// src/components/FarmAIConsultant.jsx
import React, { useState } from 'react';

const FarmAIConsultant = ({ 
  onAnalyze, 
  isLoading, 
  voiceSupport, 
  onStartRecording, 
  onStopRecording, 
  onVoiceQuery, 
  isRecording, 
  recordedAudio,
  selectedSME,
  setSelectedSME,
  smeOptions
}) => {
  const [query, setQuery] = useState('');

  const exampleQueries = [
    { text: 'Pest Control', query: 'What are the best pest control methods for my crop?' },
    { text: 'Fertilizer Advice', query: 'What fertilizers should I use for better yield?' },
    { text: 'Disease Prevention', query: 'How can I prevent common diseases in my crop?' },
    { text: 'Harvest Timing', query: 'When is the best time to harvest my crop?' }
  ];

  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery);
  };

  const handleVoiceSubmit = async () => {
    if (recordedAudio) {
      const requestData = {
        inputType: 'audio',
        content: recordedAudio,
        queryType: 'sme_consultation',
        sme_expert: selectedSME !== 'none' ? selectedSME : undefined,
        language: 'en'
      };
      
      await onVoiceQuery(requestData.content);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // For Farm AI Consultant, we'll trigger voice submit if audio is available
      // or you can add text submission logic here if needed
    }
  };

  const inputSectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  };

  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  };

  const labelStyle = {
    fontWeight: '600',
    color: '#4a7c59',
    fontSize: '1.1rem'
  };

  const textareaStyle = {
    padding: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '120px',
    transition: 'border-color 0.3s ease',
    outline: 'none'
  };

  const textareaFocusStyle = {
    borderColor: '#4a7c59'
  };

  const selectStyle = {
    width: '300px',
    padding: '12px 15px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    background: 'white',
    cursor: 'pointer',
    transition: 'border-color 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const selectFocusStyle = {
    borderColor: '#4a7c59'
  };

  const buttonStyle = {
    padding: '15px 30px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    display: 'inline-block',
    textAlign: 'center',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
  };

  const buttonHoverStyle = {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
  };

  const buttonDisabledStyle = {
    opacity: '0.6',
    cursor: 'not-allowed',
    transform: 'none'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flexWrap: 'wrap'
  };

  const voiceButtonStyle = {
    ...buttonStyle,
    background: isRecording ? '#dc3545' : '#667eea',
    color: 'white'
  };

  const submitVoiceButtonStyle = {
    ...buttonStyle,
    background: '#28a745',
    color: 'white'
  };

  const recordingStatusStyle = {
    marginTop: '15px',
    padding: '10px 15px',
    background: '#ffebee',
    color: '#c62828',
    border: '1px solid #ef5350',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '600'
  };

  const recordedStatusStyle = {
    marginTop: '15px',
    padding: '10px 15px',
    background: '#e8f5e8',
    color: '#2e7d32',
    border: '1px solid #66bb6a',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '600'
  };

  const examplesStyle = {
    marginTop: '20px',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '10px'
  };

  const exampleChipsStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  };

  const chipStyle = {
    padding: '8px 15px',
    background: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '20px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '1px solid transparent'
  };

  const chipHoverStyle = {
    background: '#1976d2',
    color: 'white',
    transform: 'translateY(-1px)'
  };

  const helperTextStyle = {
    fontSize: '0.85rem',
    color: '#666',
    marginTop: '5px',
    fontStyle: 'italic'
  };

  return (
    <div style={{ 
      background: 'white', 
      padding: '30px', 
      borderRadius: '15px', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
      marginBottom: '30px' 
    }}>
      <div style={inputSectionStyle}>
        <div style={inputGroupStyle}>
          <label htmlFor="consultantQuery" style={labelStyle}>
            Ask our Farm AI Consultant:
          </label>
          <textarea
            id="consultantQueryInput"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., What's the best fertilizer for my crop? How to control pests naturally? When should I harvest? Best irrigation practices..."
            style={{
              ...textareaStyle,
              ...(document.activeElement?.id === 'consultantQueryInput' ? textareaFocusStyle : {})
            }}
            onFocus={(e) => e.target.style.borderColor = '#4a7c59'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        {/* SME Dropdown Section */}
        <div style={inputGroupStyle}>
          <label htmlFor="smeSelect" style={labelStyle}>
            👨‍🌾 Select Subject Matter Expert:
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <select
              id="smeSelect"
              value={selectedSME}
              onChange={(e) => setSelectedSME(e.target.value)}
              style={{
                ...selectStyle,
                ...(document.activeElement?.id === 'smeSelect' ? selectFocusStyle : {})
              }}
              onFocus={(e) => e.target.style.borderColor = '#4a7c59'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            >
              {smeOptions && smeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <p style={helperTextStyle}>
            Choose an expert to get specialized advice for your specific crop
          </p>
        </div>

        <div style={inputGroupStyle}>
          <div style={buttonContainerStyle}>
            {/* Voice Recording Button */}
            {voiceSupport && (
              <>
                <button
                  onClick={isRecording ? onStopRecording : onStartRecording}
                  disabled={isLoading}
                  style={{
                    ...voiceButtonStyle,
                    ...(isLoading ? buttonDisabledStyle : {})
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      Object.assign(e.target.style, buttonHoverStyle);
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = 'none';
                      e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                    }
                  }}
                >
                  {isRecording ? '⏹️ Stop Recording' : '🎤 Voice Consultation'}
                </button>

                {/* Submit Voice Query Button */}
                {recordedAudio && !isRecording && (
                  <button
                    onClick={handleVoiceSubmit}
                    disabled={isLoading}
                    style={{
                      ...submitVoiceButtonStyle,
                      ...(isLoading ? buttonDisabledStyle : {})
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        Object.assign(e.target.style, buttonHoverStyle);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.target.style.transform = 'none';
                        e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                      }
                    }}
                  >
                    🚀 Submit Consultation
                  </button>
                )}
              </>
            )}
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div style={recordingStatusStyle}>
              🔴 Recording... Ask your farming question to the AI consultant
            </div>
          )}

          {/* Recorded Audio Status */}
          {recordedAudio && !isRecording && (
            <div style={recordedStatusStyle}>
              ✅ Voice recorded! Click "Submit Consultation" to get expert advice.
            </div>
          )}
        </div>

        <div style={examplesStyle}>
          <p style={{ 
            marginBottom: '15px', 
            fontWeight: '600', 
            color: '#4a7c59',
            margin: '0 0 15px 0'
          }}>
            <strong>Example consultations:</strong>
          </p>
          <div style={exampleChipsStyle}>
            {exampleQueries.map((example, index) => (
              <span
                key={index}
                onClick={() => handleExampleClick(example.query)}
                style={chipStyle}
                onMouseEnter={(e) => {
                  Object.assign(e.target.style, chipHoverStyle);
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#e3f2fd';
                  e.target.style.color = '#1976d2';
                  e.target.style.transform = 'none';
                }}
              >
                {example.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmAIConsultant;