// src/components/DiseaseDetection.jsx
import React, { useState } from 'react';

const DiseaseDetection = ({ onAnalyze, isLoading }) => {
  const [selectedImageData, setSelectedImageData] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [textDescription, setTextDescription] = useState('');
  const [analyzeEnabled, setAnalyzeEnabled] = useState(false);

  const handleImageSelection = (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      setSelectedImageData(null);
      setSelectedImageUrl(null);
      setAnalyzeEnabled(false);
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
      console.log('✅ Image selected and converted to base64');
    };

    reader.onerror = () => {
      alert('Error reading image file.');
      setSelectedImageData(null);
      setSelectedImageUrl(null);
      setAnalyzeEnabled(false);
    };

    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!selectedImageData) {
      alert('Please select an image first.');
      return;
    }

    const requestData = {
      inputType: 'image',
      content: selectedImageData,
      userId: getUserId(),
      language: 'en',
      textDescription: textDescription.trim(),
      farmSettings: getFarmSettings()
    };

    console.log('📤 Sending analysis request...');
    await onAnalyze(requestData);
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

  return (
    <div className="mode-section active">
      <div className="input-section">
        {/* Image Upload */}
        <div className="input-group">
          <label 
            htmlFor="imageInput" 
            className="btn btn-primary"
          >
            📸 Upload Crop Image
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={handleImageSelection}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Image Preview */}
        {selectedImageUrl && (
          <div className="input-group">
            <p className="text-lg font-semibold text-green-700 mb-3">Selected Image:</p>
            <div style={{ border: '2px solid #e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
              <img
                src={selectedImageUrl}
                alt="Selected crop"
                style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', background: '#f8f9fa' }}
              />
            </div>
          </div>
        )}

        {/* Text Description */}
        <div className="input-group">
          <textarea
            value={textDescription}
            onChange={(e) => setTextDescription(e.target.value)}
            placeholder="Describe any symptoms you notice (optional)..."
          />
        </div>

        {/* Analyze Button */}
        <div className="input-group">
          <button
            onClick={analyzeImage}
            disabled={!analyzeEnabled || isLoading}
            className="btn btn-success"
          >
            {isLoading ? '⏳ Processing...' : '🔍 Analyze Crop'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;