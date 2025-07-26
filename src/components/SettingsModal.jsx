// src/components/SettingsModal.jsx
import React, { useState, useEffect } from 'react';

const SettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    cropType: 'Rice',
    acreage: '5',
    farmerName: 'Farmer',
    soilType: 'Clay',
    currentStage: 'Flowering',
    currentChallenges: 'None',
    preferredLanguages: ['English']
  });

  const languages = [
    'English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 
    'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'
  ];

  const stages = [
    'Seed Preparation',
    'Sowing',
    'Germination', 
    'Vegetative Growth',
    'Flowering',
    'Fruit Development',
    'Maturity',
    'Harvesting'
  ];

  const soilTypes = ['Clay', 'Sandy', 'Loamy', 'Silty', 'Peaty', 'Chalky'];

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('farmSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLanguageToggle = (language) => {
    setSettings(prev => ({
      ...prev,
      preferredLanguages: prev.preferredLanguages.includes(language)
        ? prev.preferredLanguages.filter(lang => lang !== language)
        : [...prev.preferredLanguages, language]
    }));
  };

  const saveSettings = () => {
    localStorage.setItem('farmSettings', JSON.stringify(settings));
    
    // Show success feedback
    const saveBtn = document.getElementById('saveSettingsBtn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '✅ Saved!';
    saveBtn.className = saveBtn.className.replace('bg-green-600', 'bg-green-500');
    
    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.className = saveBtn.className.replace('bg-green-500', 'bg-green-600');
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-green-700">🚜 Farm Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Farmer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Farmer Name
            </label>
            <input
              type="text"
              value={settings.farmerName}
              onChange={(e) => handleInputChange('farmerName', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Crop Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crop Type
            </label>
            <input
              type="text"
              value={settings.cropType}
              onChange={(e) => handleInputChange('cropType', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Acreage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Acreage (in acres)
            </label>
            <input
              type="number"
              value={settings.acreage}
              onChange={(e) => handleInputChange('acreage', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Current Stage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Growth Stage
            </label>
            <select
              value={settings.currentStage}
              onChange={(e) => handleInputChange('currentStage', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          {/* Soil Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Soil Type
            </label>
            <select
              value={settings.soilType}
              onChange={(e) => handleInputChange('soilType', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {soilTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Current Challenges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Challenges
            </label>
            <textarea
              value={settings.currentChallenges}
              onChange={(e) => handleInputChange('currentChallenges', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Preferred Languages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Languages
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {languages.map(language => (
                <label key={language} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.preferredLanguages.includes(language)}
                    onChange={() => handleLanguageToggle(language)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{language}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            id="saveSettingsBtn"
            onClick={saveSettings}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            💾 Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;