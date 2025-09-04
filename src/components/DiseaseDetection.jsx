// src/components/DiseaseDetection.jsx
import React, { useState, useCallback } from 'react';

// --- NEW: Hardcoded model URLs for different crops ---
const CROP_MODELS = {
  'Mango': {
    url: 'https://teachablemachine.withgoogle.com/models/ufKan6pzm/'
  },
  'Sweet Lime': {
    url: 'https://teachablemachine.withgoogle.com/models/6UdJBojDI/'
  }
};

const DiseaseDetection = ({ onAnalyze, isLoading }) => {
  const [selectedImageData, setSelectedImageData] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [textDescription, setTextDescription] = useState('');
  const [analyzeEnabled, setAnalyzeEnabled] = useState(false);
  const [model, setModel] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // --- NEW: State for the selected crop ---
  const [selectedCrop, setSelectedCrop] = useState('');

  // --- MODIFIED: Load Teachable Machine model based on selectedCrop ---
  const loadDiseaseModel = useCallback(async () => {
    if (model) return model;
    
    // Ensure a crop is selected
    if (!selectedCrop || !CROP_MODELS[selectedCrop]) {
      alert('Please select a crop first.');
      return null;
    }

    setIsModelLoading(true);
    try {
      if (!window.tmImage) {
        throw new Error('Teachable Machine library not loaded. Please include the script in your HTML.');
      }

      const modelBaseURL = CROP_MODELS[selectedCrop].url;
      const modelURL = modelBaseURL + "model.json";
      const metadataURL = modelBaseURL + "metadata.json";

      console.log(`Loading ${selectedCrop} disease detection model from:`, modelURL);
      const loadedModel = await window.tmImage.load(modelURL, metadataURL);
      setModel(loadedModel);
      console.log(`✅ ${selectedCrop} disease detection model loaded successfully`);
      return loadedModel;
    } catch (error) {
      console.error(`Error loading ${selectedCrop} disease detection model:`, error);
      alert(`Failed to load the ${selectedCrop} disease detection model. Please check the model URL.`);
      return null;
    } finally {
      setIsModelLoading(false);
    }
  }, [model, selectedCrop]); // Dependency updated to selectedCrop

  // --- NEW: Handler for crop selection change ---
  const handleCropChange = (event) => {
    const newCrop = event.target.value;
    setSelectedCrop(newCrop);
    // Reset model and predictions when crop changes
    setModel(null);
    setPredictions(null);
    console.log(`Crop selected: ${newCrop}`);
  };

  const handleImageSelection = (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      setSelectedImageData(null);
      setSelectedImageUrl(null);
      setAnalyzeEnabled(false);
      setPredictions(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result.split(',')[1];
      setSelectedImageData(base64Data);
      setSelectedImageUrl(URL.createObjectURL(file));
      setAnalyzeEnabled(true);
      setPredictions(null);
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
    
    if (!selectedCrop) {
      alert('Please select a crop before analyzing.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const loadedModel = await loadDiseaseModel();
      if (!loadedModel) {
        setIsAnalyzing(false);
        return;
      }

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
        const sortedPredictions = predictions.sort((a, b) => b.probability - a.probability);
        setPredictions(sortedPredictions);
        
        console.log('🔍 Disease detection results:', sortedPredictions);
        
        if (onAnalyze) {
          const requestData = {
            inputType: 'image',
            content: selectedImageData,
            userId: getUserId(),
            language: 'en',
            textDescription: textDescription.trim(),
            farmSettings: getFarmSettings(),
            predictions: sortedPredictions
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
  
  // --- MODIFIED: Analyze button is also disabled if no crop is selected ---
  const isAnalyzeButtonDisabled = !analyzeEnabled || !selectedCrop || isProcessing;

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
          Select your crop and upload an image to get an instant diagnosis
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {/* --- NEW: Crop Selection Dropdown --- */}
        <div>
          <label htmlFor="cropSelect" style={{ 
            display: 'block',
            color: '#4a7c59', 
            fontWeight: '600', 
            marginBottom: '10px',
            fontSize: '1.1rem'
          }}>
            1. Select Your Crop
          </label>
          <select
            id="cropSelect"
            value={selectedCrop}
            onChange={handleCropChange}
            style={{
              width: '100%',
              padding: '15px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              backgroundColor: 'white',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            <option value="" disabled>-- Choose a crop --</option>
            {Object.keys(CROP_MODELS).map(cropName => (
              <option key={cropName} value={cropName}>{cropName}</option>
            ))}
          </select>
        </div>

        {/* Image Upload Section */}
        <div style={{ 
          border: selectedImageUrl ? '2px solid #4a7c59' : '2px dashed #cbd5e0',
          borderRadius: '15px',
          padding: '30px',
          textAlign: 'center',
          background: selectedImageUrl ? '#f0fdf4' : '#fafafa',
          transition: 'all 0.3s ease',
          position: 'relative',
          opacity: selectedCrop ? 1 : 0.5, // Dim if no crop is selected
          pointerEvents: selectedCrop ? 'auto' : 'none' // Disable interaction if no crop
        }}>
          {!selectedImageUrl ? (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📸</div>
              <h3 style={{ color: '#4a7c59', marginBottom: '10px', fontSize: '1.2rem' }}>
                2. Upload Crop Image
              </h3>
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.9rem' }}>
                {selectedCrop 
                  ? `Take a clear photo of your ${selectedCrop} for accurate diagnosis`
                  : 'Please select a crop first'
                }
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
            placeholder="Describe any additional symptoms you notice..."
            style={{
              width: '100%',
              padding: '15px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '1rem',
              resize: 'vertical',
              minHeight: '100px',
              boxSizing: 'border-box'
            }}
          />
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
            }}>
              🎯 Disease Detection Results for {selectedCrop}
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyze Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={analyzeImage}
            disabled={isAnalyzeButtonDisabled}
            style={{
              padding: '15px 40px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.2rem',
              fontWeight: '600',
              cursor: isAnalyzeButtonDisabled ? 'not-allowed' : 'pointer',
              background: isAnalyzeButtonDisabled ? '#ccc' : '#28a745',
              color: 'white',
              opacity: isAnalyzeButtonDisabled ? 0.6 : 1,
              transition: 'all 0.3s ease',
              minWidth: '200px'
            }}
          >
            {isModelLoading ? '⏳ Loading Model...' : 
             isAnalyzing ? '🔄 Analyzing...' : 
             '🔍 Analyze Crop'}
          </button>
          
          {(!selectedCrop || !selectedImageUrl) && (
            <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '10px' }}>
              {!selectedCrop 
                ? 'Please select a crop to begin' 
                : 'Please upload an image to start analysis'
              }
            </p>
          )}
        </div>
        
        {/* Tips and Model Status sections remain the same */}
      </div>
    </div>
  );
};

export default DiseaseDetection;