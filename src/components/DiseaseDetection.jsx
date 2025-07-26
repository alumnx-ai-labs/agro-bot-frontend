// src/components/DiseaseDetection.jsx
import React, { useState } from 'react';

const DiseaseDetection = ({ onAnalyze, showLoading, showResults, showError }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [textDescription, setTextDescription] = useState('');
  const [analyzeEnabled, setAnalyzeEnabled] = useState(false);

  const handleImageSelection = (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      setSelectedImage(null);
      setImageData(null);
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
      const base64Data = e.target.result.split(',')[1];
      setImageData(base64Data);
      setSelectedImage(URL.createObjectURL(file));
      setAnalyzeEnabled(true);
      console.log('✅ Image selected and converted to base64');
    };

    reader.onerror = () => {
      alert('Error reading image file.');
      setSelectedImage(null);
      setImageData(null);
      setAnalyzeEnabled(false);
    };

    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!imageData) {
      alert('Please select an image first.');
      return;
    }

    showLoading('Analyzing your crop image...');

    const requestData = {
      inputType: 'image',
      content: imageData,
      language: 'en',
      textDescription: textDescription
    };

    console.log('📤 Sending analysis request...');

    const result = await onAnalyze(requestData);

    if (result.success) {
      console.log('✅ Analysis successful:', result.data);
      showResults(result.data, 'Disease Analysis Results');
    } else {
      console.error('❌ Analysis failed:', result.error);
      showError(result.error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📸 Upload Crop Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelection}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>

        {/* Image Preview */}
        {selectedImage && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Selected Image:</p>
            <img
              src={selectedImage}
              alt="Selected crop"
              className="max-w-full h-64 object-cover rounded-lg border-2 border-gray-200"
            />
          </div>
        )}

        {/* Text Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe any symptoms you notice (optional):
          </label>
          <textarea
            value={textDescription}
            onChange={(e) => setTextDescription(e.target.value)}
            placeholder="e.g., Brown spots on leaves, yellowing of edges..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
          />
        </div>

        {/* Analyze Button */}
        <button
          onClick={analyzeImage}
          disabled={!analyzeEnabled}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
            analyzeEnabled
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          🔍 Analyze Crop
        </button>
      </div>
    </div>
  );
};

export default DiseaseDetection;