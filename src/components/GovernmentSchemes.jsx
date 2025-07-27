// src/components/GovernmentSchemes.jsx
import React, { useState } from 'react';

const GovernmentSchemes = ({ 
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
    { text: 'Irrigation Subsidies', query: 'What subsidies are available for drip irrigation?' },
    { text: 'PM-KISAN Scheme', query: 'Tell me about PM-KISAN scheme eligibility and benefits' },
    { text: 'Dairy Farming Loans', query: 'What are the loan schemes for dairy farming?' },
    { text: 'Organic Farming Support', query: 'Organic farming certification and support schemes' }
  ];

  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery);
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      alert('Please enter your question about government schemes.');
      return;
    }

    const requestData = {
      inputType: 'text',
      content: query.trim(),
      queryType: 'government_schemes',
      sme_expert: selectedSME !== 'none' ? selectedSME : undefined,
      language: 'en'
    };

    await onAnalyze(requestData);
  };

  const handleVoiceSubmit = async () => {
    if (recordedAudio) {
      const requestData = {
        inputType: 'audio',
        content: recordedAudio,
        queryType: 'government_schemes',
        sme_expert: selectedSME !== 'none' ? selectedSME : undefined,
        language: 'en'
      };
      
      await onVoiceQuery(requestData.content);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit(e);
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

  const textButtonStyle = {
    ...buttonStyle,
    background: '#28a745',
    color: 'white'
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
          <label htmlFor="schemeQuery" style={labelStyle}>
            Ask about Government Schemes:
          </label>
          <textarea
            id="schemeQueryInput"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., What are the subsidies available for organic farming? What schemes are there for small farmers? Tell me about PM-KISAN scheme..."
            style={{
              ...textareaStyle,
              ...(document.activeElement?.id === 'schemeQueryInput' ? textareaFocusStyle : {})
            }}
            onFocus={(e) => e.target.style.borderColor = '#4a7c59'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        {/* SME Dropdown Section */}
        <div style={inputGroupStyle}>
          <label htmlFor="smeSelect" style={labelStyle}>
            👨‍🌾 Consult Subject Matter Expert (Optional):
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
            Select an expert to get specialized advice for specific crops
          </p>
        </div>

        <div style={inputGroupStyle}>
          <div style={buttonContainerStyle}>
            {/* Text Query Button */}
            <button
              onClick={handleTextSubmit}
              disabled={isLoading || !query.trim()}
              style={{
                ...textButtonStyle,
                ...(isLoading || !query.trim() ? buttonDisabledStyle : {})
              }}
              onMouseEnter={(e) => {
                if (!isLoading && query.trim()) {
                  Object.assign(e.target.style, buttonHoverStyle);
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && query.trim()) {
                  e.target.style.transform = 'none';
                  e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                }
              }}
            >
              🔍 Search Schemes
            </button>

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
                  {isRecording ? '⏹️ Stop Recording' : '🎤 Voice Query'}
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
                    🚀 Submit Voice Query
                  </button>
                )}
              </>
            )}
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div style={recordingStatusStyle}>
              🔴 Recording... Speak your question about government schemes
            </div>
          )}

          {/* Recorded Audio Status */}
          {recordedAudio && !isRecording && (
            <div style={recordedStatusStyle}>
              ✅ Voice recorded! Click "Submit Voice Query" to process.
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
            <strong>Example queries:</strong>
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

export default GovernmentSchemes;