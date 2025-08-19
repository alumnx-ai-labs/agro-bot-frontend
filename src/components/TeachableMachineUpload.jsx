import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, FileImage, AlertCircle, MapPin } from 'lucide-react';

const TeachableMachineUpload = ({ persistentState, onStateChange, onCoordinatesUpdate }) => {
  const [modelType, setModelType] = useState('teachable_machine'); // 'teachable_machine' or 'mobilenet'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({});

  // Use persistent state from parent
  const { imageResults, model } = persistentState;

  // Backend URL from environment variable
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

  // Your Teachable Machine model URL - replace with your actual model URL
  const MODEL_URL = process.env.REACT_APP_TEACHABLE_MACHINE_URL || "https://teachablemachine.withgoogle.com/models/6UdJBojDI/";

  // Hard-coded farm configuration
  const FARM_ID = "689f38a62fc7b82767250cda";

  // Update coordinates when imageResults change
  // FIXED CODE:
  useEffect(() => {
    if (onCoordinatesUpdate && imageResults.length > 0) {
      const coordinatesData = imageResults
        .filter(result => result.location)
        .map(result => ({
          id: result.id,
          fileName: result.file.name,
          location: result.location,
          predictions: result.predictions,
          timestamp: result.timestamp
        }));

      onCoordinatesUpdate(coordinatesData);
    }
  }, [imageResults]); // REMOVE onCoordinatesUpdate from dependencies

  // Helper function to convert DMS (Degrees, Minutes, Seconds) to Decimal Degrees
  const convertDMSToDD = (dms, ref) => {
    let dd = dms[0] + dms[1] / 60 + dms[2] / 3600;
    if (ref === "S" || ref === "W") {
      dd = dd * -1;
    }
    return dd;
  };

  // ADD this new function after your existing helper functions
  const uploadDirectToCloudinary = async (imageResult) => {
    try {
      // Compress the image first
      const compressedFile = await compressImage(imageResult.file);

      // Check size after compression
      if (compressedFile.size > 10 * 1024 * 1024) { // 10MB
        throw new Error(`Image still too large after compression: ${(compressedFile.size / 1024 / 1024).toFixed(1)}MB`);
      }

      // Get signature from backend
      const signatureResponse = await fetch(`${BACKEND_URL}/cloudinary-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'mango-trees' })
      });

      if (!signatureResponse.ok) {
        const errorText = await signatureResponse.text();
        throw new Error(`Failed to get upload signature: ${errorText}`);
      }

      const { signature, timestamp, cloudName, apiKey } = await signatureResponse.json();

      // Prepare form data with compressed file
      const formData = new FormData();
      formData.append('file', compressedFile, imageResult.file.name); // Keep original filename
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', 'mango-trees');

      // Upload to Cloudinary
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!cloudinaryResponse.ok) {
        const errorData = await cloudinaryResponse.json();
        console.error('Cloudinary Error:', errorData);
        throw new Error(errorData.error?.message || 'Cloudinary upload failed');
      }

      const cloudinaryResult = await cloudinaryResponse.json();

      return {
        success: true,
        cloudinaryUrl: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        fullResult: cloudinaryResult
      };

    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  const extractGPSFromExif = async (file) => {
    return new Promise((resolve) => {
      // Note: You'll need to install and import EXIF library
      // For now, using a placeholder - you should install exif-js
      if (window.EXIF) {
        window.EXIF.getData(file, function () {
          const lat = window.EXIF.getTag(this, "GPSLatitude");
          const lon = window.EXIF.getTag(this, "GPSLongitude");
          const latRef = window.EXIF.getTag(this, "GPSLatitudeRef");
          const lonRef = window.EXIF.getTag(this, "GPSLongitudeRef");

          if (lat && lon && latRef && lonRef) {
            const latitude = convertDMSToDD(lat, latRef);
            const longitude = convertDMSToDD(lon, lonRef);
            resolve({ latitude, longitude });
          } else {
            resolve(null); // No GPS data available
          }
        });
      } else {
        resolve(null); // EXIF library not available
      }
    });
  };

  // ADD this function to compress images before upload
  const compressImage = (file, maxSizeMB = 8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (keep aspect ratio)
        const maxWidth = 1920; // Reasonable max width
        const maxHeight = 1080; // Reasonable max height

        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.7); // 70% quality
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const saveImagesToCloudinary = async () => {
    setIsUploading(true);
    const imagesToSave = imageResults.filter(result => result.location && !result.cloudinaryUrl);

    for (const result of imagesToSave) {
      try {
        setUploadStatus(prev => ({ ...prev, [result.id]: 'uploading' }));

        // Use the new direct upload function
        const uploadResult = await uploadDirectToCloudinary(result);

        if (!uploadResult.success) {
          throw new Error(uploadResult.error);
        }

        // Save to farm database with Cloudinary URL
        const farmDataResponse = await saveFarmData(
          result.location,
          result.predictions,
          result.file,
          uploadResult.cloudinaryUrl
        );

        // Update result with URLs
        const updatedResults = imageResults.map(r =>
          r.id === result.id
            ? {
              ...r,
              cloudinaryUrl: uploadResult.cloudinaryUrl,
              publicId: uploadResult.publicId,
              farmDataSaved: farmDataResponse
            }
            : r
        );

        onStateChange(prev => ({ ...prev, imageResults: updatedResults }));
        setUploadStatus(prev => ({ ...prev, [result.id]: 'success' }));

      } catch (error) {
        console.error('Error uploading image:', error);
        setUploadStatus(prev => ({ ...prev, [result.id]: 'error' }));
      }
    }

    setIsUploading(false);
  };

  // Load the Teachable Machine model
  const loadModel = useCallback(async () => {
    if (model) return model;

    setIsModelLoading(true);
    try {
      // Try direct URLs first (these sometimes work better for CORS)
      const directModelURL = "https://storage.googleapis.com/tm-model/6UdJBojDI/model.json";
      const directMetadataURL = "https://storage.googleapis.com/tm-model/6UdJBojDI/metadata.json";

      // Fallback to original URLs
      const modelURL = MODEL_URL + "model.json";
      const metadataURL = MODEL_URL + "metadata.json";

      console.log('Checking Teachable Machine availability...');
      console.log('window.tmImage:', window.tmImage);
      console.log('Trying direct URLs first...');
      console.log('Direct Model URL:', directModelURL);
      console.log('Direct Metadata URL:', directMetadataURL);

      if (window.tmImage) {
        console.log('Teachable Machine library found, loading model...');

        let loadedModel;
        try {
          // Try direct URLs first
          console.log('Attempting to load with direct URLs...');
          loadedModel = await window.tmImage.load(directModelURL, directMetadataURL);
        } catch (directError) {
          console.log('Direct URLs failed, trying original URLs...', directError.message);
          // Fallback to original URLs
          loadedModel = await window.tmImage.load(modelURL, metadataURL);
        }

        console.log('Model loaded successfully:', loadedModel);
        onStateChange(prev => ({ ...prev, model: loadedModel }));
        return loadedModel;
      } else {
        throw new Error('Teachable Machine library not loaded');
      }
    } catch (error) {
      console.error('Error loading model:', error);
      console.log('MODEL_URL from env:', process.env.REACT_APP_TEACHABLE_MACHINE_URL);

      // More detailed error message
      const errorMessage = error.message.includes('CORS') || error.message.includes('fetch')
        ? 'CORS error: The model cannot be loaded from localhost. Please deploy the app or use a different model URL.'
        : error.message;

      alert(`Failed to load the model. Error: ${errorMessage}\n\nSuggestions:\n1. Deploy the app to a domain\n2. Use a local model file\n3. Set up a proxy server`);
      return null;
    } finally {
      setIsModelLoading(false);
    }
  }, [model, MODEL_URL, onStateChange]);

  // Convert image to base64
  const imageToBase64 = (imageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    ctx.drawImage(imageElement, 0, 0);
    return canvas.toDataURL('image/jpeg');
  };

  // Process a single image through the model
  const classifyImage = async (imageElement, loadedModel) => {
    try {
      if (modelType === 'teachable_machine') {
        const predictions = await loadedModel.predict(imageElement);
        return predictions.map(pred => ({
          className: pred.className,
          probability: pred.probability
        }));
      } else if (modelType === 'mobilenet') {
        // Send to backend for MobileNetV2 classification
        const base64Image = imageToBase64(imageElement);

        const response = await fetch(`${BACKEND_URL}/classify-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_data: base64Image,
            model_type: 'mobilenet'
          })
        });

        if (response.ok) {
          const result = await response.json();
          return result.predictions;
        } else {
          throw new Error('Backend classification failed');
        }
      }
    } catch (error) {
      console.error('Error classifying image:', error);
      return null;
    }
  };

  // Determine crop type based on model predictions
  const determineCropType = (predictions) => {
    if (!predictions || predictions.length === 0) {
      return "Not Mango";
    }

    // Find the highest probability prediction
    const topPrediction = predictions.reduce((prev, current) =>
      (prev.probability > current.probability) ? prev : current
    );

    console.log('Top prediction:', topPrediction);

    // Check the actual class name and confidence
    if (topPrediction.className === 'mango_tree' && topPrediction.probability > 0.5) {
      return "Mango";
    } else if (topPrediction.className === 'not_mango_tree' && topPrediction.probability > 0.5) {
      return "Not Mango";
    } else {
      // If confidence is low, default to "Not Mango"
      return "Not Mango";
    }
  };

  // Save farm data to backend
  const saveFarmData = async (location, predictions, file, cloudinaryUrl = null) => {
    if (!location) {
      console.log('No location data to save');
      return {
        saved: false,
        isDuplicate: false,
        message: 'No GPS coordinates available'
      };
    }

    // Determine crop type based on predictions
    const cropType = determineCropType(predictions);

    try {
      console.log(`Saving farm data for coordinates: ${location.latitude}, ${location.longitude}`);
      console.log(`Detected crop type: ${cropType}`);

      const requestPayload = {
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        farmId: FARM_ID,
        cropType: cropType,
        fileName: file.name,
        cloudinaryUrl: cloudinaryUrl // ADD this line
      };

      console.log('Request payload:', requestPayload);

      const response = await fetch(`${BACKEND_URL}/save-farm-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Farm data save response:', result);

        // Ensure the response has the expected structure
        return {
          latitude: result.latitude || location.latitude.toString(),
          longitude: result.longitude || location.longitude.toString(),
          cropType: result.cropType || cropType,
          farmId: result.farmId || FARM_ID,
          isDuplicate: result.isDuplicate || false,
          saved: result.saved !== undefined ? result.saved : true,
          message: result.message || (result.saved ? 'Successfully saved to farm database' : 'Failed to save')
        };
      } else {
        const errorText = await response.text();
        console.error('Failed to save farm data:', response.status, errorText);
        return {
          saved: false,
          isDuplicate: false,
          message: `Failed to save: ${response.status} ${errorText}`
        };
      }
    } catch (error) {
      console.error('Error saving farm data:', error);
      return {
        saved: false,
        isDuplicate: false,
        message: `Error saving farm data: ${error.message}`
      };
    }
  };

  // Handle file upload and processing
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsProcessing(true);

    try {
      let loadedModel = null;
      if (modelType === 'teachable_machine') {
        loadedModel = await loadModel();
        if (!loadedModel) {
          setIsProcessing(false);
          return;
        }
      }
      // For mobilenet, we don't need to load a model on frontend

      const newResults = [];

      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const img = new Image();
          const imageUrl = URL.createObjectURL(file);

          // Extract GPS coordinates
          const location = await extractGPSFromExif(file);

          await new Promise((resolve) => {
            img.onload = async () => {
              const predictions = await classifyImage(img, loadedModel);

              if (predictions) {
                // Save farm data to backend if location is available
                const farmDataResponse = null;

                const result = {
                  id: Date.now() + Math.random(),
                  file: file,
                  imageUrl: imageUrl,
                  predictions: predictions,
                  timestamp: new Date().toLocaleTimeString(),
                  location: location,
                  farmDataSaved: null, // Will be set after manual save
                  cloudinaryUrl: null  // Will be set after upload
                };

                newResults.push(result);
              }
              resolve();
            };
            img.src = imageUrl;
          });
        }
      }

      const updatedResults = [...imageResults, ...newResults];
      onStateChange(prev => ({ ...prev, imageResults: updatedResults }));

    } catch (error) {
      console.error('Error processing images:', error);
      alert('Error processing images. Please try again.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove an image result
  const removeImageResult = (id) => {
    console.log('Attempting to remove image with ID:', id, typeof id);
    console.log('Current imageResults IDs:', imageResults.map(r => ({ id: r.id, type: typeof r.id })));

    const toRemove = imageResults.find(result => String(result.id) === String(id));
    if (toRemove) {
      URL.revokeObjectURL(toRemove.imageUrl);
      console.log('Successfully removed image:', toRemove.file.name);
    } else {
      console.log('Could not find image to remove with ID:', id);
    }

    onStateChange(prev => ({
      ...prev,
      imageResults: prev.imageResults.filter(result => String(result.id) !== String(id))
    }));
  };

  // Clear all results
  const clearAllResults = () => {
    imageResults.forEach(result => URL.revokeObjectURL(result.imageUrl));
    onStateChange(prev => ({
      ...prev,
      imageResults: []
    }));
    // Clear coordinates from parent when clearing all results
    if (onCoordinatesUpdate) {
      onCoordinatesUpdate([]);
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '15px',
      padding: '25px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{
          color: '#2c5530',
          marginBottom: '10px',
          fontSize: '1.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          Crop Classifier
        </h2>
        <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>
          Upload images to classify crops and save location data to the farm database.
        </p>
      </div>

      {/* Upload Section */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{
          border: '2px dashed #4a7c59',
          borderRadius: '10px',
          padding: '40px',
          textAlign: 'center',
          background: '#f8fdf9',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            disabled={isModelLoading || isProcessing}
          />

          <Upload size={48} style={{ color: '#4a7c59', marginBottom: '15px' }} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isModelLoading || isProcessing}
            style={{
              background: '#4a7c59',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isModelLoading || isProcessing ? 'not-allowed' : 'pointer',
              opacity: isModelLoading || isProcessing ? 0.6 : 1,
              transition: 'all 0.3s ease',
              marginBottom: '10px',
              display: 'block',
              margin: '0 auto 10px auto'
            }}
          >
            {isModelLoading ? 'Loading Model...' : isProcessing ? 'Processing...' : 'Upload Images'}
          </button>
          <p style={{ color: '#666', margin: 0 }}>
            Select multiple image files with GPS location data (JPG, PNG, etc.)
          </p>
        </div>
      </div>

      {/* Map Integration Status */}
      {imageResults.filter(result => result.location).length > 0 && (
        <div style={{
          background: '#e8f5e8',
          border: '1px solid #4CAF50',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '25px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#2E7D32',
            fontWeight: '600'
          }}>
            <MapPin size={20} />
            <span>
              {imageResults.filter(result => result.location).length} images with GPS coordinates processed!
            </span>
          </div>
          <p style={{
            margin: '8px 0 0 30px',
            color: '#4a7c59',
            fontSize: '0.9rem'
          }}>
            Images have been classified and location data sent to the farm database.
          </p>
        </div>
      )}

      {/* Results Header */}
      {imageResults.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: '2px solid #f0f0f0'
        }}>
          <h2 style={{ color: '#2c5530', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            Classification Results ({imageResults.length})
            <span style={{
              background: '#e3f2fd',
              color: '#1976d2',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              {imageResults.filter(result => result.location).length} with GPS
            </span>
            <span style={{
              background: '#d4edda',
              color: '#155724',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              {imageResults.filter(result => result.farmDataSaved?.saved).length} saved to farm DB
            </span>
            <span style={{
              background: '#fff3cd',
              color: '#856404',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              {imageResults.filter(result => result.farmDataSaved?.isDuplicate).length} duplicates found
            </span>
          </h2>
          <button
            onClick={clearAllResults}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            Clear All
          </button>
          {imageResults.filter(result => result.location && !result.cloudinaryUrl).length > 0 && (
            <button
              onClick={saveImagesToCloudinary}
              disabled={isUploading}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginLeft: '10px',
                opacity: isUploading ? 0.6 : 1
              }}
            >
              {isUploading ? 'Uploading...' : `Save ${imageResults.filter(result => result.location && !result.cloudinaryUrl).length} Images`}
            </button>
          )}
        </div>
      )}

      {/* Results Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '25px'
      }}>
        {/* Sort results by timestamp (newest first) */}
        {[...imageResults]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .map((result) => (
            <div key={result.id} style={{
              border: '1px solid #dee2e6',
              borderRadius: '10px',
              overflow: 'hidden',
              background: 'white',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={result.imageUrl}
                  alt={result.file.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
                <button
                  onClick={() => removeImageResult(result.id)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={16} />
                </button>
                {/* GPS indicator */}
                {result.location && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: '#4CAF50',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <MapPin size={12} />
                    GPS
                  </div>
                )}
                {/* Farm data saved indicator */}
                {result.farmDataSaved && (
                  <div style={{
                    position: 'absolute',
                    top: result.location ? '45px' : '10px',
                    left: '10px',
                    background: result.farmDataSaved.saved ? '#28a745' : result.farmDataSaved.isDuplicate ? '#ffc107' : '#dc3545',
                    color: result.farmDataSaved.saved ? 'white' : result.farmDataSaved.isDuplicate ? '#212529' : 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {result.farmDataSaved.saved ? 'SAVED' : result.farmDataSaved.isDuplicate ? 'DUPLICATE' : 'FAILED'}
                  </div>
                )}
              </div>

              <div style={{ padding: '15px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px'
                }}>
                  <FileImage size={16} style={{ color: '#4a7c59' }} />
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }} title={result.file.name}>
                    {result.file.name}
                  </span>
                </div>

                {result.location ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '10px'
                  }}>
                    <MapPin size={14} style={{ color: '#28a745' }} />
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                      {result.location.latitude}, {result.location.longitude}
                    </span>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '10px'
                  }}>
                    <MapPin size={14} style={{ color: '#6c757d' }} />
                    <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>No GPS data available</span>
                  </div>
                )}

                {/* Farm data save status */}
                {result.farmDataSaved && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px',
                    marginBottom: '10px',
                    padding: '8px',
                    borderRadius: '6px',
                    background: result.farmDataSaved.saved ? '#d4edda' : result.farmDataSaved.isDuplicate ? '#fff3cd' : '#f8d7da',
                    border: `1px solid ${result.farmDataSaved.saved ? '#c3e6cb' : result.farmDataSaved.isDuplicate ? '#ffeaa7' : '#f5c6cb'}`
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.8rem',
                        color: result.farmDataSaved.saved ? '#155724' : result.farmDataSaved.isDuplicate ? '#856404' : '#721c24',
                        fontWeight: '600',
                        marginBottom: '4px'
                      }}>
                        Farm Database Status:
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: result.farmDataSaved.saved ? '#155724' : result.farmDataSaved.isDuplicate ? '#856404' : '#721c24'
                      }}>
                        {result.farmDataSaved.message || (result.farmDataSaved.saved ? 'Successfully saved' : 'Save failed')}
                      </div>
                      {result.farmDataSaved.isDuplicate && (
                        <div style={{
                          fontSize: '0.7rem',
                          color: '#856404',
                          marginTop: '4px',
                          fontStyle: 'italic'
                        }}>
                          A plant with the same coordinates already exists in this farm
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    Processed at {result.timestamp}
                  </div>
                </div>

                <div>
                  <h4 style={{ color: '#2c5530', marginBottom: '10px', fontSize: '1rem' }}>Predictions:</h4>
                  {result.predictions
                    .sort((a, b) => b.probability - a.probability)
                    .slice(0, 3)
                    .map((prediction, index) => (
                      <div key={index} style={{
                        marginBottom: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          flex: 1
                        }}>
                          {prediction.className}
                        </span>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flex: 1
                        }}>
                          <div style={{
                            background: '#e9ecef',
                            borderRadius: '10px',
                            height: '6px',
                            flex: 1,
                            overflow: 'hidden'
                          }}>
                            <div
                              style={{
                                background: '#4a7c59',
                                height: '100%',
                                width: `${prediction.probability * 100}%`,
                                borderRadius: '10px',
                                transition: 'width 0.3s ease'
                              }}
                            ></div>
                          </div>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: '#4a7c59',
                            minWidth: '45px',
                            textAlign: 'right'
                          }}>
                            {(prediction.probability * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Empty State */}
      {imageResults.length === 0 && !isProcessing && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#6c757d'
        }}>
          <AlertCircle size={64} style={{ marginBottom: '20px' }} />
          <h3 style={{ marginBottom: '10px', color: '#495057' }}>No images uploaded yet</h3>
          <p>Upload some images to see classification results and save location data to the farm database.</p>
        </div>
      )}

      {/* Loading State */}
      {isProcessing && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: '#f8f9fa',
          borderRadius: '10px',
          margin: '20px 0'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #4a7c59',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#495057', margin: 0 }}>
            Processing images and saving farm data...
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TeachableMachineUpload;