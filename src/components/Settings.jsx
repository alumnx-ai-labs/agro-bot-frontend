// src/components/Settings.jsx
import React, { useState, useEffect } from 'react';

const Settings = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    farmerName: 'Vijender',
    cropType: 'Mosambi',
    acreage: 15,
    sowingDate: '2022-01-01',
    currentStage: 'Fruit Development',
    soilType: 'A',
    currentChallenges: 'Currently there are no challenges.',
    preferredLanguages: ['English']
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadFarmSettings();
  }, []);

  const loadFarmSettings = () => {
    const savedSettings = localStorage.getItem('farmSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setFormData(prevData => ({
          ...prevData,
          ...settings
        }));
      } catch (error) {
        console.error('Error loading farm settings:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLanguageChange = (language, checked) => {
    setFormData(prev => {
      // Only allow one language to be selected at a time
      const newLanguages = checked ? [language] : [];
      
      return {
        ...prev,
        preferredLanguages: newLanguages
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      localStorage.setItem('farmSettings', JSON.stringify(formData));
      
      // Call the onSave callback if provided
      if (onSave) {
        onSave(formData);
      }
      
      // Show success state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onClose();
    } catch (error) {
      console.error('Error saving farm settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const languages = [
    'English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 
    'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'
  ];

  const cropStages = [
    'New Flush/Sprouting',
    'Flowering',
    'Fruit Set',
    'Fruit Development',
    'Maturity/Harvest'
  ];

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={handleClose}
    >
      <div 
        style={{
          background: 'white',
          borderRadius: '15px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90%',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 30px',
          borderBottom: '1px solid #e0e0e0',
          background: '#f8f9fa',
          borderRadius: '15px 15px 0 0'
        }}>
          <h3 style={{
            color: '#4a7c59',
            margin: 0,
            fontSize: '1.4rem'
          }}>
            🚜 Farm Settings
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
              padding: 0,
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '30px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '600',
              color: '#4a7c59'
            }}>
              Farmer Name:
            </label>
            <input
              type="text"
              name="farmerName"
              value={formData.farmerName}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '600',
              color: '#4a7c59'
            }}>
              Crop Type:
            </label>
            <input
              type="text"
              name="cropType"
              value={formData.cropType}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '600',
              color: '#4a7c59'
            }}>
              Acreage:
            </label>
            <input
              type="number"
              name="acreage"
              value={formData.acreage}
              onChange={handleInputChange}
              step="0.1"
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '600',
              color: '#4a7c59'
            }}>
              Sowing Date:
            </label>
            <input
              type="date"
              name="sowingDate"
              value={formData.sowingDate}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '600',
              color: '#4a7c59'
            }}>
              Current Stage:
            </label>
            <select
              name="currentStage"
              value={formData.currentStage}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                background: 'white'
              }}
            >
              {cropStages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '600',
              color: '#4a7c59'
            }}>
              Soil Type:
            </label>
            <select
              name="soilType"
              value={formData.soilType}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                background: 'white'
              }}
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '600',
              color: '#4a7c59'
            }}>
              Current Challenges:
            </label>
            <textarea
              name="currentChallenges"
              value={formData.currentChallenges}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: '600',
              color: '#4a7c59'
            }}>
              Preferred Language:
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '10px'
            }}>
              {languages.map(language => (
                <label
                  key={language}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 'normal',
                    cursor: 'pointer',
                    padding: '5px',
                    borderRadius: '5px',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.preferredLanguages.includes(language)}
                    onChange={(e) => handleLanguageChange(language, e.target.checked)}
                    style={{ margin: 0 }}
                  />
                  {language}
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'flex-end',
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #e0e0e0'
          }}>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                background: isSaving ? '#28a745' : '#4a7c59',
                color: 'white',
                opacity: isSaving ? 0.8 : 1
              }}
            >
              {isSaving ? '✅ Saved!' : '💾 Save Settings'}
            </button>
            <button
              onClick={onClose}
              disabled={isSaving}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                background: '#6c757d',
                color: 'white',
                opacity: isSaving ? 0.6 : 1
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;