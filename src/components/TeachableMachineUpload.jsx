import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileImage, AlertCircle, MapPin, Check, Trash2 } from 'lucide-react';
const TeachableMachineUpload = () => {
  const [model, setModel] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelType, setModelType] = useState('teachable_machine'); // 'teachable_machine' or 'mobilenet'
  const [imageResults, setImageResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duplicatePairs, setDuplicatePairs] = useState([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const fileInputRef = useRef(null);

  // Backend URL from environment variable
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL 

  // Your Teachable Machine model URL - replace with your actual model URL
  const MODEL_URL = process.env.TEACHABLE_MACHINE_URL 

  // Extract GPS coordinates from EXIF data
  // Helper function to convert DMS (Degrees, Minutes, Seconds) to Decimal Degrees
  const convertDMSToDD = (dms, ref) => {
    let dd = dms[0] + dms[1] / 60 + dms[2] / 3600;
    if (ref === "S" || ref === "W") {
      dd = dd * -1;
    }
    return dd;
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

  // Load the Teachable Machine model
  const loadModel = useCallback(async () => {
    if (model) return model;

    setIsModelLoading(true);
    try {
      const modelURL = MODEL_URL + "model.json";
      const metadataURL = MODEL_URL + "metadata.json";

      if (window.tmImage) {
        const loadedModel = await window.tmImage.load(modelURL, metadataURL);
        setModel(loadedModel);
        return loadedModel;
      } else {
        throw new Error('Teachable Machine library not loaded');
      }
    } catch (error) {
      console.error('Error loading model:', error);
      alert('Failed to load the model. Please check the model URL and ensure Teachable Machine library is loaded.');
      return null;
    } finally {
      setIsModelLoading(false);
    }
  }, [model, MODEL_URL]);

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

  // Send images with location data to backend
  const sendMangoLocationsToBackend = async (allImages) => {
    // Filter only images that have location data
    const imagesWithLocation = allImages.filter(img => img.location !== null);

    if (imagesWithLocation.length === 0) {
      console.log('No images with location data to send to backend');
      return;
    }

    try {
      setIsCheckingDuplicates(true);

      const locationData = imagesWithLocation.map(img => ({
        imageName: img.file.name,
        latitude: img.location.latitude,
        longitude: img.location.longitude,
        imageId: String(img.id)
      }));

      console.log(`Sending ${locationData.length} images with location data (out of ${allImages.length} total):`, locationData);

      const response = await fetch(`${BACKEND_URL}/check-proximity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locations: locationData })
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const duplicateData = await response.json();
        console.log('Received duplicate data:', duplicateData);
        setDuplicatePairs(duplicateData.similar_pairs || []);
      } else {
        const errorText = await response.text();
        console.error('Backend error:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
    } finally {
      setIsCheckingDuplicates(false);
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
                const result = {
                  id: Date.now() + Math.random(),
                  file: file,
                  imageUrl: imageUrl,
                  predictions: predictions, // Keep original order for now, will sort in display
                  timestamp: new Date().toLocaleTimeString(),
                  location: location
                };

                newResults.push(result);
              }
              resolve();
            };
            img.src = imageUrl;
          });
        }
      }

      setImageResults(prev => [...prev, ...newResults]);

      // Send images with location data to backend
      if (newResults.length > 0) {
        await sendMangoLocationsToBackend(newResults);
      }

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

  // Handle duplicate resolution
  const handleDuplicateAction = async (pairId, action, imageId1, imageId2) => {
    try {
      const response = await fetch(`${BACKEND_URL}/save-decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pairId: pairId,
          action: action,
          imageId1: imageId1,
          imageId2: imageId2
        })
      });

      if (response.ok) {
        // Remove the pair from duplicates list
        setDuplicatePairs(prev => prev.filter(pair => pair.pairId !== pairId));

        // Remove images from results if needed
        if (action === 'keep_first_remove_second') {
          removeImageResult(imageId2);
        } else if (action === 'remove_first_keep_second') {
          removeImageResult(imageId1);
        }
        // For 'save_both', we don't remove any images
      }
    } catch (error) {
      console.error('Error saving decision:', error);
    }
  };

  // Remove an image result
  const removeImageResult = (id) => {
    console.log('Attempting to remove image with ID:', id, typeof id);
    console.log('Current imageResults IDs:', imageResults.map(r => ({ id: r.id, type: typeof r.id })));

    setImageResults(prev => {
      const updated = prev.filter(result => String(result.id) !== String(id)); // Fixed: !== instead of ===
      const toRemove = prev.find(result => String(result.id) === String(id));
      if (toRemove) {
        URL.revokeObjectURL(toRemove.imageUrl);
        console.log('Successfully removed image:', toRemove.file.name);
      } else {
        console.log('Could not find image to remove with ID:', id);
      }
      return updated;
    });

    // Also remove from duplicate pairs if it exists
    setDuplicatePairs(prev => prev.filter(pair =>
      String(pair.imageId1) !== String(id) && String(pair.imageId2) !== String(id)
    ));
  };

  // Clear all results
  const clearAllResults = () => {
    imageResults.forEach(result => URL.revokeObjectURL(result.imageUrl));
    setImageResults([]);
    setDuplicatePairs([]);
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
          📤 Teachable Machine Mango Classifier
        </h2>
        <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>
          Upload images to classify mango trees and detect nearby duplicates using GPS location data.
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

      {/* Model Selection */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ color: '#4a7c59', marginBottom: '15px' }}>Select Model:</h3>
        <div style={{ display: 'flex', gap: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              value="teachable_machine"
              checked={modelType === 'teachable_machine'}
              onChange={(e) => setModelType(e.target.value)}
              disabled={isProcessing}
              style={{ marginRight: '8px' }}
            />
            Teachable Machine
          </label>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              value="mobilenet"
              checked={modelType === 'mobilenet'}
              onChange={(e) => setModelType(e.target.value)}
              disabled={isProcessing}
              style={{ marginRight: '8px' }}
            />
            Fine-tuned MobileNetV2
          </label>
        </div>
      </div>

      {/* Duplicate Pairs Section */}
      {duplicatePairs.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ 
            color: '#dc3545', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🔍 Nearby Mango Trees Found ({duplicatePairs.length} pairs)
            {isCheckingDuplicates && <span style={{ color: '#666' }}> - Checking...</span>}
          </h2>

          {duplicatePairs.map((pair) => {
            const image1 = imageResults.find(img => String(img.id) === String(pair.imageId1));
            const image2 = imageResults.find(img => String(img.id) === String(pair.imageId2));

            if (!image1 || !image2) {
              console.log('Could not find images for pair:', pair, 'Available images:', imageResults.map(img => ({ id: img.id, name: img.file.name })));
              return null;
            }

            return (
              <div key={pair.pairId} style={{
                border: '1px solid #dee2e6',
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '20px',
                background: '#fff8f0'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ 
                    color: '#856404', 
                    fontWeight: '600',
                    margin: 0 
                  }}>
                    📏 Distance: {pair.distance ? pair.distance.toFixed(2) : 'Unknown'}m apart
                  </p>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <img 
                      src={image1.imageUrl} 
                      alt={image1.file.name}
                      style={{
                        width: '100%',
                        maxWidth: '200px',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '2px solid #dee2e6'
                      }}
                    />
                    <p style={{ margin: '8px 0 4px', fontWeight: '600' }}>{image1.file.name}</p>
                    <p style={{ 
                      margin: 0, 
                      color: '#666', 
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}>
                      <MapPin size={14} />
                      {image1.location ? `${image1.location.latitude.toFixed(6)}, ${image1.location.longitude.toFixed(6)}` : 'No location'}
                    </p>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <img 
                      src={image2.imageUrl} 
                      alt={image2.file.name}
                      style={{
                        width: '100%',
                        maxWidth: '200px',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '2px solid #dee2e6'
                      }}
                    />
                    <p style={{ margin: '8px 0 4px', fontWeight: '600' }}>{image2.file.name}</p>
                    <p style={{ 
                      margin: 0, 
                      color: '#666', 
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}>
                      <MapPin size={14} />
                      {image2.location ? `${image2.location.latitude.toFixed(6)}, ${image2.location.longitude.toFixed(6)}` : 'No location'}
                    </p>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => handleDuplicateAction(pair.pairId, 'save_both', pair.imageId1, pair.imageId2)}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.9rem'
                    }}
                  >
                    <Check size={16} />
                    Save Both
                  </button>
                  <button
                    onClick={() => handleDuplicateAction(pair.pairId, 'keep_first_remove_second', pair.imageId1, pair.imageId2)}
                    style={{
                      background: '#ffc107',
                      color: '#212529',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.9rem'
                    }}
                  >
                    <Trash2 size={16} />
                    Keep First
                  </button>
                  <button
                    onClick={() => handleDuplicateAction(pair.pairId, 'remove_first_keep_second', pair.imageId1, pair.imageId2)}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.9rem'
                    }}
                  >
                    <Trash2 size={16} />
                    Keep Second
                  </button>
                </div>
              </div>
            );
          })}
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
            📊 Classification Results ({imageResults.length})
            <span style={{
              background: '#d4edda',
              color: '#155724',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              {imageResults.filter(result => {
                const mangoTreePrediction = result.predictions.find(p =>
                  p.className.toLowerCase() === 'mango_tree'
                );
                return mangoTreePrediction && mangoTreePrediction.probability > 0.5;
              }).length} mango trees detected
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
                      {result.location.latitude.toFixed(6)}, {result.location.longitude.toFixed(6)}
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

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    Processed at {result.timestamp}
                  </div>
                </div>

                <div>
                  <h4 style={{ color: '#2c5530', marginBottom: '10px', fontSize: '1rem' }}>Predictions:</h4>
                  {/* Sort predictions: mango_tree first, then not_mango_tree, then others by probability */}
                  {result.predictions
                    .sort((a, b) => {
                      // Priority order: mango_tree, not_mango_tree, then others by probability
                      const getPriority = (pred) => {
                        if (pred.className.toLowerCase() === 'mango_tree') return 1;
                        if (pred.className.toLowerCase() === 'not_mango_tree') return 2;
                        return 3;
                      };

                      const priorityA = getPriority(a);
                      const priorityB = getPriority(b);

                      if (priorityA !== priorityB) {
                        return priorityA - priorityB;
                      }

                      // If same priority, sort by probability (highest first)
                      return b.probability - a.probability;
                    })
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
          <p>Upload some images to see classification results and check for nearby duplicates.</p>
        </div>
      )}

      {/* Loading State */}
      {(isProcessing || isCheckingDuplicates) && (
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
            {isProcessing ? 'Processing images...' : 'Checking for nearby duplicates...'}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        background: '#e3f2fd',
        padding: '20px',
        borderRadius: '10px',
        marginTop: '25px'
      }}>
        <h4 style={{ color: '#1976d2', marginBottom: '15px', fontSize: '1.1rem' }}>📋 Instructions:</h4>
        <ul style={{ paddingLeft: '20px', color: '#1565c0', lineHeight: '1.6' }}>
          <li>Upload images with GPS location data for classification</li>
          <li>Images will be automatically sent to the backend for proximity checking</li>
          <li>If images are found within 1 meter of each other, you'll see duplicate resolution options</li>
          <li>Update TEACHABLE_MACHINE_URL and REACT_APP_BACKEND_URL in your environment</li>
          <li>Each image can be removed individually using the X button</li>
        </ul>
      </div>

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
