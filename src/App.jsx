// src/App.jsx
import React, { useState, useEffect } from 'react';
import DiseaseDetection from './components/DiseaseDetection';
import GovernmentSchemes from './components/GovernmentSchemes';
import FarmAIConsultant from './components/FarmAIConsultant';
import Settings from './components/Settings';
import FarmPredictiveAdvisories from './components/FarmPredictiveAdvisories';
import FarmPlotsMap from './components/FarmPlotsMap';
import TeachableMachineUpload from './components/TeachableMachineUpload';

function App() {
  const [currentMode, setCurrentMode] = useState('disease');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [results, setResults] = useState(null);
  const [resultsTitle, setResultsTitle] = useState('');
  const [error, setError] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [managerThoughts, setManagerThoughts] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedSME, setSelectedSME] = useState(''); // New state for SME selection
  const [uploadedImageCoordinates, setUploadedImageCoordinates] = useState([]);

  // Teachable Machine persistent state
  const [teachableMachineState, setTeachableMachineState] = useState({
    imageResults: [],
    duplicatePairs: [],
    model: null
  });

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  // SME options
const smeOptions = [
  { value: '', label: 'Select an SME (Required)' },
  { value: 'op-awasthi-mosambi', label: 'OP Awasthi - Mosambi' },
  { value: 'ms-swaminathan-wheat', label: 'MS Swaminathan - Wheat' }
];

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
      try {
        return JSON.parse(savedSettings);
      } catch (error) {
        console.error('Error parsing farm settings:', error);
        return getDefaultSettings();
      }
    }

    return getDefaultSettings();
  };

  const getDefaultSettings = () => ({
    cropType: 'Mosambi',
    acreage: 15,
    sowingDate: '2022-01-01',
    currentStage: 'Fruit Development',
    farmerName: 'Vijender',
    soilType: 'A',
    currentChallenges: 'Currently there are no challenges.',
    preferredLanguages: ['English', 'Telugu']
  });

  const switchMode = (mode) => {
    setCurrentMode(mode);
    // Only reset interface for non-teachable machine modes
    if (mode !== 'teachable') {
      resetInterface();
    } else {
      // For teachable machine, only reset loading states but keep the data
      setIsLoading(false);
      setLoadingText('');
      setResults(null);
      setResultsTitle('');
      setError(null);
      setCurrentSessionId(null);
      setManagerThoughts([]);
    }
  };
  const updateImageCoordinates = (coordinates) => {
  setUploadedImageCoordinates(coordinates);
  };
  const resetInterface = () => {
    setIsLoading(false);
    setLoadingText('');
    setResults(null);
    setResultsTitle('');
    setError(null);
    setCurrentSessionId(null);
    setManagerThoughts([]);
    setSelectedSME(''); // Reset SME selection

    // Reset voice recording states
    setIsRecording(false);
    setRecordedAudio(null);
    setAudioChunks([]);
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  const showLoading = (message = 'Processing your request...') => {
    setIsLoading(true);
    setLoadingText(message);
    setResults(null);
    setError(null);

    if (currentMode === 'disease') {
      startDiseaseAnalysisThoughts();
    } else if (currentMode === 'schemes') {
      startSchemesQueryThoughts();
    } else if (currentMode === 'consultant') {
      startConsultantThoughts();
    } else if (currentMode === 'predictive') {
    startPredictiveAdvisoryThoughts();
  }
  };

const startPredictiveAdvisoryThoughts = () => {
  const thoughts = [
    "🌡️ Analyzing current weather conditions...",
    "🔍 Comparing with crop impact database...",
    "🤖 Generating AI-powered predictions...",
    "✅ Predictive advisory complete! Preparing recommendations..."
  ];

  setManagerThoughts([]);
  thoughts.forEach((thought, index) => {
    setTimeout(() => {
      setManagerThoughts(prev => [...prev, thought]);
    }, index * 2000);
  });
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

  const startConsultantThoughts = () => {
    const thoughts = [
      "🤔 Connecting with AI farming expert...",
      "🧠 Analyzing your farming question...",
      "📖 Consulting agricultural knowledge base...",
      "✅ Expert consultation complete! Preparing advice..."
    ];

    setManagerThoughts([]);
    thoughts.forEach((thought, index) => {
      setTimeout(() => {
        setManagerThoughts(prev => [...prev, thought]);
      }, index * 2000);
    });
  };

  const startSchemesQueryThoughts = () => {
    const thoughts = [
      "🤔 Understanding your query...",
      "🔍 Consulting AI farming database...",
      "📊 Finding relevant insights and recommendations...",
      "✅ Query complete! Preparing information..."
    ];

    setManagerThoughts([]);
    thoughts.forEach((thought, index) => {
      setTimeout(() => {
        setManagerThoughts(prev => [...prev, thought]);
      }, index * 2000);
    });
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        convertAudioToBase64(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const convertAudioToBase64 = (audioBlob) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Audio = reader.result.split(',')[1];
      setRecordedAudio(base64Audio);
    };
    reader.readAsDataURL(audioBlob);
  };

  const handleVoiceQuery = async (audioData) => {
    const queryType = currentMode === 'consultant' ? 'sme_consultation' : 'government_schemes';
    const requestData = {
      inputType: 'audio',
      content: audioData,
      queryType: queryType,
      language: 'en',
      ...(selectedSME && currentMode === 'consultant' && { sme_agent: selectedSME }) // Add SME agent if selected for consultant mode
    };

    await handleAnalyze(requestData);
  };

  const handleAnalyze = async (requestData) => {
    if (requestData.queryType === 'government_schemes') {
      if (requestData.inputType === 'audio') {
        showLoading('Transcribing and processing your voice query...');
      } else {
        showLoading('Consulting farming AI assistant...');
      }
    } else if (requestData.queryType === 'predictive_advisory') {
  showLoading('Generating predictive advisory based on farm conditions...');
} else {
      showLoading('Analyzing your crop image...');
    }

    try {
      console.log('📤 Sending analysis request...');

      // Add SME agent to request data if selected and it's a government schemes query
      const finalRequestData = {
        ...requestData,
        userId: getUserId(),
        farmSettings: getFarmSettings(),
        ...(requestData.inputType === 'image' ? { image_data: requestData.content } : {}),
        ...(selectedSME && requestData.queryType === 'sme_consultation' ? { sme_agent: selectedSME } : {})
      };

      const response = await fetch('https://us-central1-agro-bot-1212.cloudfunctions.net/farmer-assistant/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalRequestData)
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Analysis successful:', result);
        setCurrentSessionId(result.session_id);
        setResults(result);
        if (requestData.inputType === 'audio') {
          setResultsTitle('Voice Query Results');
        }  else if (requestData.queryType === 'predictive_advisory') {
          setResultsTitle('Farm Predictive Advisory Results');
        } else {
          setResultsTitle(requestData.queryType === 'government_schemes' ? 'Farming AI Consultant Results' : 'Disease Analysis Results');
        }
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

    // Handle predictive advisory responses
    console.log('Full results object:', results);

// Handle predictive advisory responses
if (results.agent_response && results.agent_response.type === 'predictive_advisory') {
  return renderPredictiveAdvisory(results.agent_response);
}

    // Handle government schemes response - prioritize message-only responses
    if (results.final_response && results.final_response.message) {
      return renderMessageOnly(results.final_response.message);
    }

    if (results.agent_response && results.agent_response.message && !results.agent_response.schemes) {
      return renderMessageOnly(results.agent_response.message);
    }

    if (results.agent_response && (results.agent_response.message || results.agent_response.schemes)) {
      return renderSchemesResponse(results.agent_response);
    }

    // Handle disease analysis responses (existing code)
    if (results.final_response && results.final_response.detailed_analysis) {
      return renderDiseaseAnalysis(results.final_response.detailed_analysis);
    }

    if (results.final_response && results.final_response.type === 'disease_analysis' && results.final_response.analysis) {
      return renderDiseaseAnalysis(results.final_response.analysis);
    }

    if (results.agent_response && results.agent_response.type === 'disease_analysis' && results.agent_response.analysis) {
      return renderDiseaseAnalysis(results.agent_response.analysis);
    }

    if (results.analysis) {
      return renderDiseaseAnalysis(results.analysis);
    }

    // Fallback - show the raw response for debugging
    return (
      <div style={{ background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: '#4a7c59', marginBottom: '20px' }}>Analysis Results</h3>
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', lineHeight: '1.6' }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px', overflow: 'auto' }}>
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

   const renderPredictiveAdvisory = (advisoryData) => {
    if (!advisoryData) {
      return (
        <div style={{ background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#dc3545', marginBottom: '20px' }}>Advisory Error</h3>
          <p>Predictive advisory data is missing or invalid.</p>
        </div>
      );
    }

    const getRiskLevelStyle = (riskLevel) => {
      const styles = {
        high: { background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' },
        medium: { background: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' },
        low: { background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' }
      };
      return styles[riskLevel] || styles.medium;
    };

    return (
      <div style={{ background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ color: '#2c5530', fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>
              🔮 Farm Predictive Advisory
            </h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {advisoryData.risk_level && (
                <span style={{
                  padding: '5px 12px',
                  borderRadius: '15px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  ...getRiskLevelStyle(advisoryData.risk_level)
                }}>
                  {advisoryData.risk_level} risk
                </span>
              )}
              {advisoryData.confidence && (
                <span style={{
                  padding: '5px 12px',
                  borderRadius: '15px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  background: '#e3f2fd',
                  color: '#1976d2',
                  border: '1px solid #bbdefb'
                }}>
                  {advisoryData.confidence} confidence
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Current Conditions */}
        {advisoryData.current_conditions && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>
              🌤️ Current Farm Conditions:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div style={{ background: '#f0f8ff', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #4a90e2' }}>
                <strong>🌡️ Temperature:</strong> {advisoryData.current_conditions.temperature}°C
              </div>
              <div style={{ background: '#f0fff0', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #32cd32' }}>
                <strong>💧 Humidity:</strong> {advisoryData.current_conditions.humidity}%
              </div>
              <div style={{ background: '#fff8dc', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #daa520' }}>
                <strong>🌱 Soil Moisture:</strong> {advisoryData.current_conditions.soil_moisture}%
              </div>
            </div>
          </div>
        )}

        {/* Summary Message */}
        {advisoryData.message && (
          <div style={{ marginBottom: '25px' }}>
            <div style={{ 
              background: '#e8f5e8', 
              padding: '20px', 
              borderRadius: '10px', 
              borderLeft: '4px solid #4a7c59',
              fontSize: '1.05rem',
              lineHeight: '1.6'
            }}>
              {advisoryData.message}
            </div>
          </div>
        )}

        {/* Predictions */}
        {advisoryData.predictions && advisoryData.predictions.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>
              🔮 Predicted Issues:
            </h4>
            {advisoryData.predictions.map((prediction, index) => (
              <div key={index} style={{
                background: '#fff3cd',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px',
                borderLeft: '4px solid #ffc107'
              }}>
                <h5 style={{ color: '#856404', marginBottom: '10px', fontSize: '1.1rem' }}>
                  ⚠️ {prediction.issue}
                </h5>
                <div style={{ fontSize: '0.95rem', color: '#6c5214' }}>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Probability:</strong> 
                    <span style={{
                      marginLeft: '8px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: prediction.probability === 'high' ? '#dc3545' : 
                                  prediction.probability === 'medium' ? '#ffc107' : '#28a745',
                      color: 'white'
                    }}>
                      {prediction.probability}
                    </span>
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Expected timeframe:</strong> {prediction.timeframe}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Reason:</strong> {prediction.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {advisoryData.recommendations && advisoryData.recommendations.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>
              💡 Recommended Actions:
            </h4>
            {advisoryData.recommendations.map((recommendation, index) => (
              <div key={index} style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px',
                borderLeft: `4px solid ${recommendation.priority === 'high' ? '#dc3545' : 
                                         recommendation.priority === 'medium' ? '#ffc107' : '#28a745'}`
              }}>
                <h5 style={{ 
                  color: '#2c5530', 
                  marginBottom: '10px', 
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {recommendation.priority === 'high' ? '🔴' : 
                   recommendation.priority === 'medium' ? '🟡' : '🟢'}
                  {recommendation.action}
                </h5>
                <div style={{ fontSize: '0.95rem' }}>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Priority:</strong> {recommendation.priority}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Timing:</strong> {recommendation.timing}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Cost estimate:</strong> {recommendation.cost_estimate}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Reason:</strong> {recommendation.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Monitoring Points */}
        {advisoryData.monitoring_points && advisoryData.monitoring_points.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>
              👁️ What to Monitor:
            </h4>
            <ul style={{ paddingLeft: '20px' }}>
              {advisoryData.monitoring_points.map((point, index) => (
                <li key={index} style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Advisory Date */}
        {advisoryData.next_check_date && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>
              📅 Next Advisory:
            </h4>
            <div style={{ background: '#e3f2fd', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ color: '#1976d2', fontWeight: '600' }}>
                {new Date(advisoryData.next_check_date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMessageOnly = (message) => {
    const formatText = (text) => {
      return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
    };

    return (
      <div style={{ background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
          <div dangerouslySetInnerHTML={{ __html: formatText(message) }} />
        </div>
      </div>
    );
  };

  const renderSchemesResponse = (agentResponse) => {
    const formatText = (text) => {
      return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
    };

    return (
      <div style={{ background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ color: '#2c5530', fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>
              Farming AI Consultant Results
            </h2>
            {agentResponse.confidence && (
              <span style={{
                padding: '5px 12px',
                borderRadius: '15px',
                fontSize: '0.85rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                background: '#d4edda',
                color: '#155724',
                border: '1px solid #c3e6cb'
              }}>
                {agentResponse.confidence} relevance
              </span>
            )}
          </div>
        </div>

        {agentResponse.message && (
          <div style={{ marginBottom: '25px' }}>
            <div style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
              <div dangerouslySetInnerHTML={{ __html: formatText(agentResponse.message) }} />
            </div>
          </div>
        )}

        {agentResponse.schemes && agentResponse.schemes.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>
              📋 Relevant Schemes:
            </h4>
            {agentResponse.schemes.map((scheme, index) => (
              <div key={index} style={{
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '15px',
                borderLeft: '4px solid #4a7c59'
              }}>
                <h5 style={{ color: '#2c5530', marginBottom: '10px', fontSize: '1.2rem' }}>
                  {scheme.name}
                </h5>
                <p style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                  <strong>Description:</strong> {scheme.description}
                </p>
                {scheme.eligibility && (
                  <p style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                    <strong>Eligibility:</strong> {scheme.eligibility}
                  </p>
                )}
                {scheme.benefits && (
                  <p style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                    <strong>Benefits:</strong> {scheme.benefits}
                  </p>
                )}
                {scheme.application_process && (
                  <p style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                    <strong>How to Apply:</strong> {scheme.application_process}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {agentResponse.sources && agentResponse.sources.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>
              📚 Sources:
            </h4>
            <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {agentResponse.sources.map((source, index) => (
                  <li key={index} style={{ color: '#1976d2', fontWeight: '500', marginBottom: '8px', lineHeight: '1.5' }}>
                    {source}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDiseaseAnalysis = (analysis) => {
    if (!analysis) {
      return (
        <div style={{ background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#dc3545', marginBottom: '20px' }}>Analysis Error</h3>
          <p>Analysis data is missing or invalid.</p>
        </div>
      );
    }

    const getConfidenceStyle = (confidence) => {
      const styles = {
        high: { background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
        medium: { background: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' },
        low: { background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }
      };
      return styles[confidence] || styles.low;
    };

    return (
      <div style={{ background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ color: '#2c5530', fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>
              {analysis.disease_name}
            </h2>
            <span style={{
              padding: '5px 12px',
              borderRadius: '15px',
              fontSize: '0.85rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              ...getConfidenceStyle(analysis.confidence)
            }}>
              {analysis.confidence} confidence
            </span>
          </div>
        </div>

        {analysis.severity !== 'none' && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#dc3545', marginBottom: '15px', fontSize: '1.1rem' }}>
              🚨 Severity: {analysis.severity}
            </h4>
          </div>
        )}

        {analysis.symptoms_observed && analysis.symptoms_observed.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>
              👀 Symptoms Observed:
            </h4>
            <ul style={{ paddingLeft: '20px' }}>
              {analysis.symptoms_observed.map((symptom, index) => (
                <li key={index} style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                  {symptom}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>
            ⚡ Immediate Action:
          </h4>
          <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #4a7c59' }}>
            <p style={{ margin: 0 }}>{analysis.immediate_action}</p>
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>
            💊 Treatment Summary:
          </h4>
          <p style={{ lineHeight: '1.5', margin: 0 }}>{analysis.treatment_summary}</p>
        </div>

        {analysis.organic_solutions && analysis.organic_solutions.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>
              🌿 Organic Solutions:
            </h4>
            <div>
              {analysis.organic_solutions.map((solution, index) => (
                <div key={index} style={{
                  background: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px',
                  borderLeft: '4px solid #4a7c59',
                  marginBottom: '15px'
                }}>
                  <h5 style={{ fontWeight: '600', marginBottom: '10px', color: '#2c5530' }}>
                    {solution.name}
                  </h5>
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
            <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>
              🛡️ Prevention Tips:
            </h4>
            <ul style={{ paddingLeft: '20px' }}>
              {analysis.prevention_tips.map((tip, index) => (
                <li key={index} style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>
            💰 Cost Estimate:
          </h4>
          <div style={{ background: '#e8f5e8', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ color: '#2c5530', fontWeight: '600' }}>{analysis.cost_estimate}</span>
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>
            ⏱️ Expected Timeline:
          </h4>
          <p style={{ lineHeight: '1.5', margin: 0 }}>{analysis.success_timeline}</p>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.1rem' }}>
            ⚠️ Warning Signs:
          </h4>
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '15px' }}>
            <p style={{ color: '#991b1b', fontWeight: '600', margin: 0 }}>{analysis.warning_signs}</p>
          </div>
        </div>
      </div>
    );
  };

  const buttonStyle = {
    padding: '15px 25px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
  };

  const activeButtonStyle = {
    ...buttonStyle,
    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
    transform: 'translateY(-2px)'
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
          marginBottom: '30px',
          position: 'relative'
        }}>
          <h1 style={{ color: '#4a7c59', marginBottom: '10px', fontSize: '2.5rem', margin: '0 0 10px 0' }}>
            🌱 Krishi Vikas
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem', margin: '0' }}>
            AI Powered solution for Precision Farming to improve yields and incomes of farmers
          </p>
          <button
            onClick={() => setIsSettingsOpen(true)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: '#4a7c59',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#3a6b49';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#4a7c59';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            ⚙️ Settings
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
            { mode: 'schemes', label: '📋 Government Schemes', color: '#667eea' },
            { mode: 'consultant', label: '🤖 Farm AI Consultants', color: '#28a745' },
            { mode: 'predictive', label: '🔮 Farm Predictive Advisories', color: '#0891b2' },
            { mode: 'weather', label: '🚜 Farm Plots Map', color: '#ff6b35' },
            { mode: 'teachable', label: '🧠 Upload Images', color: '#a855f7' }
          ].map(({ mode, label, color }) => (
            <button
              key={mode}
              onClick={() => switchMode(mode)}
              style={{
                ...(currentMode === mode ? activeButtonStyle : buttonStyle),
                background: currentMode === mode ? color : 'rgba(255, 255, 255, 0.9)',
                color: currentMode === mode ? 'white' : '#333'
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

          {currentMode === 'schemes' && (
            <GovernmentSchemes
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              voiceSupport={true}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onVoiceQuery={handleVoiceQuery}
              isRecording={isRecording}
              recordedAudio={recordedAudio}
            />
          )}

{currentMode === 'consultant' && (
  <FarmAIConsultant
    onAnalyze={handleAnalyze}
    isLoading={isLoading}
    selectedSME={selectedSME}
    setSelectedSME={setSelectedSME}
    smeOptions={smeOptions}
  />
)}

            {currentMode === 'predictive' && (
  <FarmPredictiveAdvisories
    onAnalyze={handleAnalyze}
    isLoading={isLoading}
  />
)}

          {currentMode === 'weather' && (
            < FarmPlotsMap uploadedImageCoordinates={uploadedImageCoordinates}/>
          )}

          {currentMode === 'teachable' && (
              <TeachableMachineUpload 
                persistentState={teachableMachineState}
                onStateChange={setTeachableMachineState}
                onCoordinatesUpdate={updateImageCoordinates}
              />
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
                        borderLeft: '4px solid #4a7c59'
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
                  ...buttonStyle,
                  background: '#6c757d',
                  color: 'white'
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
          <p>Phase 1 MVP - Disease Detection, Government Schemes, AI Consultants, Predictive Advisories & Weather Data</p>
        </footer>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* Settings Modal */}
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(settings) => {
          console.log('✅ Farm settings saved:', settings);
          // You can add additional logic here if needed
        }}
      />
    </div>
  );
}

export default App;
