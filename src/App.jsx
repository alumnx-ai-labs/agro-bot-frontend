// src/App.jsx
import React, { useState, useEffect } from 'react';
import DiseaseDetection from './components/DiseaseDetection';
import GovernmentSchemes from './components/GovernmentSchemes';
import TalkNow from './components/TalkNow';
import WeatherStations from './components/WeatherStations';
import LoadingSection from './components/LoadingSection';
import ResultsSection from './components/ResultsSection';
import ErrorSection from './components/ErrorSection';
import SettingsModal from './components/SettingsModal';

const App = () => {
  const [activeMode, setActiveMode] = useState('disease');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Your Cloud Function endpoint
  const API_ENDPOINT = 'https://us-central1-agro-bot-1212.cloudfunctions.net/farmer-assistant';

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      // Health check - you might need to deploy this endpoint separately
      console.log('✅ System ready');
    } catch (error) {
      console.warn('⚠️ Health check failed:', error);
    }
  };

  const resetInterface = () => {
    setLoading(false);
    setResults(null);
    setError(null);
    setSessionId(null);
  };

  const showLoading = (message = 'Processing your request...') => {
    setLoading(true);
    setLoadingText(message);
    setResults(null);
    setError(null);
  };

  const showResults = (data, title) => {
    setLoading(false);
    setResults({ data, title });
    setError(null);
    setSessionId(data.session_id);
  };

  const showError = (message) => {
    setLoading(false);
    setResults(null);
    setError(message);
  };

  const getFarmSettings = () => {
    const savedSettings = localStorage.getItem('farmSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      cropType: 'Rice',
      acreage: '5',
      farmerName: 'Farmer',
      soilType: 'Clay',
      currentStage: 'Flowering',
      currentChallenges: 'None'
    };
  };

  const getUserId = () => {
    let userId = localStorage.getItem('farmerAssistantUserId');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('farmerAssistantUserId', userId);
    }
    return userId;
  };

  const makeApiRequest = async (requestData) => {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestData,
          userId: getUserId(),
          farmSettings: getFarmSettings()
        })
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, data: result };
      } else {
        return { success: false, error: result.error || 'Request failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  };

  const modes = [
    { id: 'disease', name: '🔬 Crop Disease Detection' },
    { id: 'schemes', name: '🏛️ Government Schemes' },
    { id: 'talk', name: '🎤 Talk Now' },
    { id: 'weather', name: '🌤️ Weather Stations' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-lg p-6 mb-6 relative">
          <h1 className="text-3xl font-bold text-green-600 text-center mb-2">
            🌱 Farmer Assistant MVP
          </h1>
          <p className="text-gray-600 text-center">
            Upload crop images for disease detection or query government schemes
          </p>
          <button
            onClick={() => setShowSettings(true)}
            className="absolute top-4 right-4 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            ⚙️ Settings
          </button>
        </header>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setActiveMode(mode.id);
                resetInterface();
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                activeMode === mode.id
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
            >
              {mode.name}
            </button>
          ))}
        </div>

        {/* Loading Section */}
        {loading && (
          <LoadingSection 
            loadingText={loadingText} 
            mode={activeMode}
          />
        )}

        {/* Results Section */}
        {results && (
          <ResultsSection 
            results={results}
            mode={activeMode}
          />
        )}

        {/* Error Section */}
        {error && (
          <ErrorSection 
            error={error}
            onRetry={resetInterface}
          />
        )}

        {/* Mode Sections */}
        {!loading && !results && !error && (
          <>
            {activeMode === 'disease' && (
              <DiseaseDetection
                onAnalyze={makeApiRequest}
                showLoading={showLoading}
                showResults={showResults}
                showError={showError}
              />
            )}
            {activeMode === 'schemes' && (
              <GovernmentSchemes
                onQuery={makeApiRequest}
                showLoading={showLoading}
                showResults={showResults}
                showError={showError}
              />
            )}
            {activeMode === 'talk' && (
              <TalkNow
                onTranscribe={makeApiRequest}
                showLoading={showLoading}
                showResults={showResults}
                showError={showError}
              />
            )}
            {activeMode === 'weather' && (
              <WeatherStations />
            )}
          </>
        )}

        {/* Settings Modal */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />

        {/* Footer */}
        <footer className="text-center text-white/80 mt-8">
          <p>Phase 1 MVP - Disease Detection, Government Schemes & Weather Monitoring</p>
        </footer>
      </div>
    </div>
  );
};

export default App;