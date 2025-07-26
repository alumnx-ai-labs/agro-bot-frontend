// src/App.jsx
import React, { useState, useEffect } from 'react';
import DiseaseDetection from './components/DiseaseDetection';

function App() {
  const [currentMode, setCurrentMode] = useState('disease');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [results, setResults] = useState(null);
  const [resultsTitle, setResultsTitle] = useState('');
  const [error, setError] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [managerThoughts, setManagerThoughts] = useState([]);

  // Health check on component mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await fetch('https://us-central1-agro-bot-1212.cloudfunctions.net/farmer-assistant/health');
      const health = await response.json();
      if (health.status === 'healthy') {
        console.log('✅ System healthy');
      } else {
        console.warn('⚠️ System health issues:', health);
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  };

  const testCloudFunction = async () => {
    setIsLoading(true);
    setLoadingText('Testing cloud function...');
    setResults(null);
    setError(null);

    try {
      const response = await fetch('https://us-central1-agro-bot-1212.cloudfunctions.net/farmer-assistant/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputType: 'text',
          content: 'Hello! This is a test message.',
          userId: 'test_user',
          language: 'en'
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setResults(result);
        setResultsTitle('Test Results');
        console.log('✅ Test successful:', result);
      } else {
        setError(result.error || 'Test failed');
        console.error('❌ Test failed:', result);
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
      console.error('❌ Test request failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (mode) => {
    setCurrentMode(mode);
    resetInterface();
  };

  const resetInterface = () => {
    setIsLoading(false);
    setLoadingText('');
    setResults(null);
    setResultsTitle('');
    setError(null);
    setCurrentSessionId(null);
    setManagerThoughts([]);
  };

  const showLoading = (message = 'Processing your request...') => {
    setIsLoading(true);
    setLoadingText(message);
    setResults(null);
    setError(null);
    
    // Show appropriate manager thoughts
    if (currentMode === 'disease') {
      startDiseaseAnalysisThoughts();
    }
  };

  const startDiseaseAnalysisThoughts = () => {
    const thoughts = [
      "🤔 Analyzing your crop image...",
      "🎯 Identifying potential issues...", 
      "🔬 Calling disease detection specialist...",
      "✅ Analysis complete! Preparing response..."
    ];
    
    setManagerThoughts([]);
    thoughts.forEach((thought, index) => {
      setTimeout(() => {
        setManagerThoughts(prev => [...prev, thought]);
      }, index * 2000);
    });
  };

  const handleAnalyze = async (requestData) => {
    showLoading('Analyzing your crop image...');

    try {
      console.log('📤 Sending analysis request...');

      const response = await fetch('https://us-central1-agro-bot-1212.cloudfunctions.net/farmer-assistant/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Analysis successful:', result);
        setCurrentSessionId(result.session_id);
        setResults(result);
        setResultsTitle('Disease Analysis Results');
      } else {
        console.error('❌ Analysis failed:', result);
        setError(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('❌ Request failed:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;

    if (currentMode === 'disease' && results.agent_response && results.agent_response.analysis) {
      return renderDiseaseAnalysis(results.agent_response.analysis);
    }

    return (
      <div style={{ background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: '#4a7c59', marginBottom: '20px' }}>Response</h3>
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px', margin: 0 }}>
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  const renderDiseaseAnalysis = (analysis) => {
    return (
      <div style={{ background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <h2 style={{ color: '#2c5530', fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>{analysis.disease_name}</h2>
            <span style={{
              padding: '5px 12px',
              borderRadius: '15px',
              fontSize: '0.85rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              background: analysis.confidence === 'high' ? '#d4edda' : analysis.confidence === 'medium' ? '#fff3cd' : '#f8d7da',
              color: analysis.confidence === 'high' ? '#155724' : analysis.confidence === 'medium' ? '#856404' : '#721c24',
              border: `1px solid ${analysis.confidence === 'high' ? '#c3e6cb' : analysis.confidence === 'medium' ? '#ffeaa7' : '#f5c6cb'}`
            }}>
              {analysis.confidence} confidence
            </span>
          </div>
        </div>

        {analysis.severity !== 'none' && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#dc3545', marginBottom: '15px', fontSize: '1.1rem' }}>🚨 Severity: {analysis.severity}</h4>
          </div>
        )}

        {analysis.symptoms_observed && analysis.symptoms_observed.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>👀 Symptoms Observed:</h4>
            <ul style={{ paddingLeft: '20px' }}>
              {analysis.symptoms_observed.map((symptom, index) => (
                <li key={index} style={{ marginBottom: '8px', lineHeight: '1.5' }}>{symptom}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>⚡ Immediate Action:</h4>
          <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #4a7c59' }}>
            <p style={{ margin: 0 }}>{analysis.immediate_action}</p>
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>💊 Treatment Summary:</h4>
          <p style={{ lineHeight: '1.5', margin: 0 }}>{analysis.treatment_summary}</p>
        </div>

        {analysis.organic_solutions && analysis.organic_solutions.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>🌿 Organic Solutions:</h4>
            <div>
              {analysis.organic_solutions.map((solution, index) => (
                <div key={index} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #4a7c59', marginBottom: '15px' }}>
                  <h5 style={{ fontWeight: '600', marginBottom: '10px', color: '#2c5530' }}>{solution.name}</h5>
                  <p style={{ margin: '5px 0', fontSize: '0.95rem' }}>
                    <strong>Preparation:</strong> {solution.preparation}
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '0.95rem' }}>
                    <strong>Application:</strong> {solution.application}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {analysis.prevention_tips && analysis.prevention_tips.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>🛡️ Prevention Tips:</h4>
            <ul style={{ paddingLeft: '20px' }}>
              {analysis.prevention_tips.map((tip, index) => (
                <li key={index} style={{ marginBottom: '8px', lineHeight: '1.5' }}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>💰 Cost Estimate:</h4>
          <div style={{ background: '#e8f5e8', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ color: '#2c5530', fontWeight: '600' }}>{analysis.cost_estimate}</span>
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>⏱️ Expected Timeline:</h4>
          <p style={{ lineHeight: '1.5', margin: 0 }}>{analysis.success_timeline}</p>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>⚠️ Warning Signs:</h4>
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '15px' }}>
            <p style={{ color: '#991b1b', fontWeight: '600', margin: 0 }}>{analysis.warning_signs}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <header style={{ 
          textAlign: 'center', 
          background: 'white', 
          padding: '30px', 
          borderRadius: '15px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
          marginBottom: '30px' 
        }}>
          <h1 style={{ color: '#4a7c59', marginBottom: '10px', fontSize: '2.5rem', margin: '0 0 10px 0' }}>
            🌱 Farmer Assistant MVP
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem', margin: '0 0 20px 0' }}>
            React Frontend + Cloud Function Backend
          </p>
          <button
            onClick={testCloudFunction}
            disabled={isLoading}
            style={{
              padding: '15px 30px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              background: isLoading ? '#ccc' : '#4a7c59',
              color: 'white',
              opacity: isLoading ? 0.6 : 1,
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
              }
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            ⚡ Test Cloud Function
          </button>
        </header>

        {/* Mode Selection */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '30px', 
          justifyContent: 'center', 
          flexWrap: 'wrap' 
        }}>
          {[
            { mode: 'disease', label: '🔬 Disease Detection', color: '#4a7c59' },
            { mode: 'schemes', label: '🏛️ Government Schemes', color: '#667eea' },
            { mode: 'talk', label: '🎤 Talk Now', color: '#f59e0b' },
            { mode: 'weather', label: '🌤️ Weather Stations', color: '#0891b2' }
          ].map(({ mode, label, color }) => (
            <button
              key={mode}
              onClick={() => switchMode(mode)}
              style={{
                padding: '15px 25px',
                border: 'none',
                borderRadius: '10px',
                background: currentMode === mode ? color : 'rgba(255, 255, 255, 0.9)',
                color: currentMode === mode ? 'white' : '#333',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: currentMode === mode ? '0 8px 25px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.1)',
                transform: currentMode === mode ? 'translateY(-2px)' : 'translateY(0)'
              }}
              onMouseOver={(e) => {
                if (currentMode !== mode) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                }
              }}
              onMouseOut={(e) => {
                if (currentMode !== mode) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                }
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <main>
          {/* Content Sections */}
          {currentMode === 'disease' && (
            <DiseaseDetection onAnalyze={handleAnalyze} isLoading={isLoading} />
          )}

          {currentMode !== 'disease' && (
            <div style={{ 
              background: 'white', 
              padding: '30px', 
              borderRadius: '15px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
              textAlign: 'center' 
            }}>
              <h2 style={{ color: '#4a7c59', marginBottom: '20px' }}>
                {currentMode === 'schemes' && '🏛️ Government Schemes'}
                {currentMode === 'talk' && '🎤 Talk Now'}
                {currentMode === 'weather' && '🌤️ Weather Stations'}
              </h2>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>Feature coming soon...</p>
            </div>
          )}

          {/* Loading Section */}
          {isLoading && (
            <div style={{ 
              background: 'white', 
              padding: '40px', 
              borderRadius: '15px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
              textAlign: 'center', 
              marginTop: '30px' 
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
              <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333', marginBottom: '20px' }}>
                {loadingText}
              </p>
              
              {managerThoughts.length > 0 && (
                <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                  {managerThoughts.map((thought, index) => (
                    <div
                      key={index}
                      style={{
                        background: '#e8f5e8',
                        padding: '10px 15px',
                        borderRadius: '20px',
                        margin: '10px 0',
                        borderLeft: '4px solid #4a7c59',
                        animation: 'fadeInUp 0.5s ease'
                      }}
                    >
                      {thought}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Results Section */}
          {results && !isLoading && (
            <div style={{ marginTop: '30px' }}>
              <h2 style={{ 
                color: '#4a7c59', 
                marginBottom: '25px', 
                textAlign: 'center', 
                fontSize: '1.8rem' 
              }}>
                {resultsTitle}
              </h2>
              {renderResults()}
            </div>
          )}

          {/* Error Section */}
          {error && !isLoading && (
            <div style={{ 
              background: 'white', 
              padding: '30px', 
              borderRadius: '15px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
              textAlign: 'center', 
              marginTop: '30px' 
            }}>
              <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>⚠️ Error</h2>
              <div style={{ 
                background: '#f8d7da', 
                border: '1px solid #f5c6cb', 
                borderRadius: '8px', 
                padding: '15px', 
                marginBottom: '20px' 
              }}>
                <p style={{ color: '#721c24', margin: 0 }}>{error}</p>
              </div>
              <button
                onClick={resetInterface}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#5a6268';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#6c757d';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Try Again
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={{ 
          textAlign: 'center', 
          color: 'rgba(255, 255, 255, 0.8)', 
          marginTop: '30px', 
          fontSize: '0.9rem' 
        }}>
          <p>Phase 1 MVP - Disease Detection, Government Schemes & Weather Monitoring</p>
        </footer>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}


export default App;