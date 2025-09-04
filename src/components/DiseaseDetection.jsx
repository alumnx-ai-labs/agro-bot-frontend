// src/components/DiseaseDetection.jsx
import React, { useState, useCallback } from 'react';

const DiseaseDetection = ({ onAnalyze, isLoading }) => {
  const [selectedImageData, setSelectedImageData] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [textDescription, setTextDescription] = useState('');
  const [analyzeEnabled, setAnalyzeEnabled] = useState(false);
  const [model, setModel] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Your Teachable Machine model URL for disease detection - replace with your actual model URL
  const DISEASE_MODEL_URL = process.env.REACT_APP_DISEASE_MODEL_URL || 'https://teachablemachine.withgoogle.com/models/YOUR_DISEASE_MODEL_ID/';

  // Load the Teachable Machine model for disease detection
  const loadDiseaseModel = useCallback(async () => {
    if (model) return model;

    setIsModelLoading(true);
    try {
      // Check if tmImage is available
      if (!window.tmImage) {
        throw new Error('Teachable Machine library not loaded. Please include the script in your HTML.');
      }

      const modelURL = DISEASE_MODEL_URL + "model.json";
      const metadataURL = DISEASE_MODEL_URL + "metadata.json";

      console.log('Loading disease detection model from:', modelURL);
      const loadedModel = await window.tmImage.load(modelURL, metadataURL);
      setModel(loadedModel);
      console.log('✅ Disease detection model loaded successfully');
      return loadedModel;
    } catch (error) {
      console.error('Error loading disease detection model:', error);
      alert('Failed to load the disease detection model. Please check the model URL and ensure the Teachable Machine library is loaded.');
      return null;
    } finally {
      setIsModelLoading(false);
    }
  }, [model, DISEASE_MODEL_URL]);

  const handleImageSelection = (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      setSelectedImageData(null);
      setSelectedImageUrl(null);
      setAnalyzeEnabled(false);
      setPredictions(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB.');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      // Remove data URL prefix to get pure base64
      const base64Data = e.target.result.split(',')[1];
      setSelectedImageData(base64Data);
      setSelectedImageUrl(URL.createObjectURL(file));
      setAnalyzeEnabled(true);
      setPredictions(null); // Clear previous predictions
      console.log('✅ Image selected and converted to base64');
    };

    reader.onerror = () => {
      alert('Error reading image file.');
      setSelectedImageData(null);
      setSelectedImageUrl(null);
      setAnalyzeEnabled(false);
      setPredictions(null);
    };

    reader.readAsDataURL(file);
  };

  // Classify the image using Teachable Machine model
  const classifyDiseaseImage = async (imageElement, loadedModel) => {
    try {
      const predictions = await loadedModel.predict(imageElement);
      return predictions.map(pred => ({
        className: pred.className,
        probability: pred.probability
      }));
    } catch (error) {
      console.error('Error classifying disease image:', error);
      return null;
    }
  };

  const analyzeImage = async () => {
    if (!selectedImageData || !selectedImageUrl) {
      alert('Please select an image first.');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Load the disease detection model
      const loadedModel = await loadDiseaseModel();
      if (!loadedModel) {
        setIsAnalyzing(false);
        return;
      }

      // Create an image element for prediction
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const predictions = await new Promise((resolve, reject) => {
        img.onload = async () => {
          try {
            const result = await classifyDiseaseImage(img, loadedModel);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image for analysis'));
        };
        
        img.src = selectedImageUrl;
      });

      if (predictions) {
        // Sort predictions by probability (highest first)
        const sortedPredictions = predictions.sort((a, b) => b.probability - a.probability);
        setPredictions(sortedPredictions);
        
        console.log('🔍 Disease detection results:', sortedPredictions);
        
        // Call the original onAnalyze function if needed for additional processing
        if (onAnalyze) {
          const requestData = {
            inputType: 'image',
            content: selectedImageData,
            userId: getUserId(),
            language: 'en',
            textDescription: textDescription.trim(),
            farmSettings: getFarmSettings(),
            predictions: sortedPredictions // Include predictions in the request
          };
          
          await onAnalyze(requestData);
        }
      } else {
        alert('Failed to analyze the image. Please try again.');
      }
    } catch (error) {
      console.error('Error during image analysis:', error);
      alert('An error occurred during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper functions matching the original code
  const getUserId = () => {
    let userId = localStorage.getItem('farmerAssistantUserId');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('farmerAssistantUserId', userId);
    }
    return userId;
  };

  const getFarmSettings = () => {
    const savedSettings = localStorage.getItem('farmSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    
    // Return defaults if no settings saved
    return {
      cropType: 'Mosambi',
      acreage: 15,
      sowingDate: '2022-01-01',
      currentStage: 'Fruit Development',
      farmerName: 'Vijender',
      soilType: 'A',
      currentChallenges: 'Currently there are no challenges.',
      preferredLanguages: ['English', 'Telugu']
    };
  };

  const isProcessing = isLoading || isModelLoading || isAnalyzing;

  return (
    <div style={{ 
      background: 'white', 
      padding: '30px', 
      borderRadius: '15px', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
      marginBottom: '30px' 
    }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ color: '#4a7c59', marginBottom: '10px', fontSize: '1.8rem' }}>
          🔬 Crop Disease Detection
        </h2>
        <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>
          Upload a clear image of your crop to detect diseases and get treatment recommendations
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {/* Image Upload Section */}
        <div style={{ 
          border: selectedImageUrl ? '2px solid #4a7c59' : '2px dashed #cbd5e0',
          borderRadius: '15px',
          padding: '30px',
          textAlign: 'center',
          background: selectedImageUrl ? '#f0fdf4' : '#fafafa',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}>
          {!selectedImageUrl ? (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📸</div>
              <h3 style={{ color: '#4a7c59', marginBottom: '10px', fontSize: '1.2rem' }}>
                Upload Crop Image
              </h3>
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.9rem' }}>
                Take a clear photo of affected crop areas for accurate diagnosis
              </p>
              <label 
                htmlFor="imageInput" 
                style={{
                  display: 'inline-block',
                  padding: '12px 30px',
                  border: 'none',
                  borderRadius: '10px',
                  background: '#4a7c59',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                  e.target.style.background = '#3a6b49';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = '#4a7c59';
                }}
              >
                Choose Image
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelection}
                  style={{ display: 'none' }}
                />
              </label>
              <p style={{ color: '#999', fontSize: '0.8rem', marginTop: '15px' }}>
                Supports JPG, PNG, WEBP • Max 5MB
              </p>
            </div>
          ) : (
            <div>
              <div style={{ 
                background: 'white',
                borderRadius: '10px', 
                overflow: 'hidden',
                marginBottom: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <img
                  src={selectedImageUrl}
                  alt="Selected crop"
                  style={{ 
                    width: '100%', 
                    maxHeight: '300px', 
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <label 
                  htmlFor="imageInput" 
                  style={{
                    display: 'inline-block',
                    padding: '8px 20px',
                    border: '2px solid #4a7c59',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#4a7c59',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#4a7c59';
                    e.target.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#4a7c59';
                  }}
                >
                  Change Image
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelection}
                    style={{ display: 'none' }}
                  />
                </label>
                <button
                  onClick={() => {
                    setSelectedImageUrl(null);
                    setSelectedImageData(null);
                    setAnalyzeEnabled(false);
                    setPredictions(null);
                  }}
                  style={{
                    padding: '8px 20px',
                    border: '2px solid #dc3545',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#dc3545',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#dc3545';
                    e.target.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#dc3545';
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Text Description */}
        <div>
          <label style={{ 
            display: 'block',
            color: '#4a7c59', 
            fontWeight: '600', 
            marginBottom: '10px',
            fontSize: '1.1rem'
          }}>
            📝 Additional Symptoms (Optional)
          </label>
          <textarea
            value={textDescription}
            onChange={(e) => setTextDescription(e.target.value)}
            placeholder="Describe any additional symptoms you notice: yellowing leaves, brown spots, wilting, unusual growth patterns, etc."
            style={{
              width: '100%',
              padding: '15px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              minHeight: '100px',
              transition: 'border-color 0.3s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4a7c59';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e0e0e0';
            }}
          />
          <p style={{ color: '#666', fontSize: '0.85rem', margin: '5px 0 0 0' }}>
            Providing symptom details helps improve diagnosis accuracy
          </p>
        </div>

        {/* Disease Detection Results */}
        {predictions && (
          <div style={{ 
            background: '#f8f9fa', 
            border: '1px solid #dee2e6', 
            borderRadius: '10px', 
            padding: '20px' 
          }}>
            <h4 style={{ 
              color: '#4a7c59', 
              marginBottom: '15px', 
              fontSize: '1.2rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🎯 Disease Detection Results
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {predictions.slice(0, 3).map((prediction, index) => (
                <div 
                  key={index}
                  style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    border: index === 0 ? '2px solid #28a745' : '1px solid #e0e0e0',
                    boxShadow: index === 0 ? '0 2px 8px rgba(40, 167, 69, 0.1)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ 
                      fontWeight: index === 0 ? '700' : '600',
                      color: index === 0 ? '#28a745' : '#333',
                      fontSize: index === 0 ? '1.1rem' : '1rem'
                    }}>
                      {index === 0 && '🏆 '}{prediction.className}
                    </span>
                    <span style={{ 
                      fontWeight: '700',
                      color: index === 0 ? '#28a745' : '#666',
                      fontSize: '1rem'
                    }}>
                      {(prediction.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ 
                    background: '#f1f3f4', 
                    borderRadius: '10px', 
                    overflow: 'hidden',
                    height: '6px'
                  }}>
                    <div 
                      style={{ 
                        background: index === 0 ? '#28a745' : '#6c757d',
                        height: '100%',
                        width: `${prediction.probability * 100}%`,
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                  {index === 0 && (
                    <p style={{ 
                      color: '#28a745', 
                      fontSize: '0.85rem', 
                      margin: '8px 0 0 0',
                      fontWeight: '500'
                    }}>
                      Most likely diagnosis
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyze Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={analyzeImage}
            disabled={!analyzeEnabled || isProcessing}
            style={{
              padding: '15px 40px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.2rem',
              fontWeight: '600',
              cursor: (!analyzeEnabled || isProcessing) ? 'not-allowed' : 'pointer',
              background: (!analyzeEnabled || isProcessing) ? '#ccc' : '#28a745',
              color: 'white',
              opacity: (!analyzeEnabled || isProcessing) ? 0.6 : 1,
              transition: 'all 0.3s ease',
              minWidth: '200px'
            }}
            onMouseOver={(e) => {
              if (analyzeEnabled && !isProcessing) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.4)';
                e.target.style.background = '#218838';
              }
            }}
            onMouseOut={(e) => {
              if (analyzeEnabled && !isProcessing) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
                e.target.style.background = '#28a745';
              }
            }}
          >
            {isModelLoading ? '⏳ Loading Model...' : 
             isAnalyzing ? '🔄 Analyzing...' : 
             '🔍 Analyze Crop'}
          </button>
          
          {!analyzeEnabled && !selectedImageUrl && (
            <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '10px' }}>
              Please upload an image to start analysis
            </p>
          )}
        </div>

        {/* Tips Section */}
        <div style={{ 
          background: '#e8f5e8', 
          border: '1px solid #4a7c59', 
          borderRadius: '10px', 
          padding: '20px' 
        }}>
          <h4 style={{ 
            color: '#4a7c59', 
            marginBottom: '15px', 
            fontSize: '1.1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            💡 Tips for Best Results
          </h4>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '10px',
            color: '#2c5530', 
            fontSize: '0.9rem', 
            lineHeight: '1.5'
          }}>
            <div>• Take photos in good natural light</div>
            <div>• Focus on affected plant parts</div>
            <div>• Include multiple angles if possible</div>
            <div>• Avoid blurry or dark images</div>
          </div>
        </div>

        {/* Model Status */}
        {isModelLoading && (
          <div style={{ 
            background: '#fff3cd', 
            border: '1px solid #ffeaa7', 
            borderRadius: '10px', 
            padding: '15px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#856404', margin: 0, fontSize: '0.9rem' }}>
              🤖 Loading disease detection model... This may take a moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseDetection;