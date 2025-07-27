// src/components/FarmPredictiveAdvisories.jsx
import React, { useState } from 'react';

const FarmPredictiveAdvisories = ({ onAnalyze, isLoading }) => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const triggerPredictiveAdvisory = async () => {
    try {
      setError(null);
      setResults(null);
      
      // Call the analyze function with predictive advisory request
await onAnalyze({
  queryType: 'predictive_advisory',
  inputType: 'text',
  content: 'predictive advisor'
});
    } catch (error) {
      console.error('Error triggering predictive advisory:', error);
      setError('Failed to trigger predictive advisory. Please try again.');
    }
  };

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '15px', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
      padding: '30px',
      maxWidth: '100%',
      margin: '0 auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🔮</div>
        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#4a7c59', 
          marginBottom: '15px',
          margin: '0 0 15px 0'
        }}>
          Farm Predictive Advisories
        </h2>
        <p style={{ 
          color: '#666', 
          fontSize: '1.1rem', 
          marginBottom: '25px',
          lineHeight: '1.5',
          margin: '0 0 25px 0'
        }}>
          Get AI-powered insights on potential pests and diseases based on current weather conditions and your farm's environmental data.
        </p>
      </div>

      {/* Weather Parameters Display */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          background: '#f0f8ff', 
          borderRadius: '10px', 
          padding: '20px', 
          textAlign: 'center', 
          borderLeft: '4px solid #4a90e2' 
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🌡️</div>
          <h3 style={{ fontWeight: '600', color: '#4a90e2', margin: '0 0 8px 0' }}>Temperature</h3>
          <p style={{ fontSize: '0.9rem', color: '#666', margin: '0' }}>Current farm temperature monitoring</p>
        </div>
        <div style={{ 
          background: '#f0fff0', 
          borderRadius: '10px', 
          padding: '20px', 
          textAlign: 'center', 
          borderLeft: '4px solid #32cd32' 
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💧</div>
          <h3 style={{ fontWeight: '600', color: '#32cd32', margin: '0 0 8px 0' }}>Humidity</h3>
          <p style={{ fontSize: '0.9rem', color: '#666', margin: '0' }}>Atmospheric moisture levels</p>
        </div>
        <div style={{ 
          background: '#fff8dc', 
          borderRadius: '10px', 
          padding: '20px', 
          textAlign: 'center', 
          borderLeft: '4px solid #daa520' 
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🌱</div>
          <h3 style={{ fontWeight: '600', color: '#daa520', margin: '0 0 8px 0' }}>Soil Moisture</h3>
          <p style={{ fontSize: '0.9rem', color: '#666', margin: '0' }}>Ground water content analysis</p>
        </div>
      </div>

      {/* How It Works */}
      <div style={{ 
        background: '#f8f9fa', 
        borderRadius: '10px', 
        padding: '25px', 
        marginBottom: '30px' 
      }}>
        <h3 style={{ 
          fontSize: '1.2rem', 
          fontWeight: '600', 
          color: '#333', 
          marginBottom: '20px',
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🧠</span>
          How Predictive Advisory Works
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📊</div>
            <p style={{ fontWeight: '600', color: '#4a90e2', margin: '0 0 5px 0' }}>Collect Data</p>
            <p style={{ fontSize: '0.9rem', color: '#666', margin: '0' }}>Weather & soil sensors</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔍</div>
            <p style={{ fontWeight: '600', color: '#32cd32', margin: '0 0 5px 0' }}>Analyze Patterns</p>
            <p style={{ fontSize: '0.9rem', color: '#666', margin: '0' }}>Compare with impact database</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🤖</div>
            <p style={{ fontWeight: '600', color: '#8a2be2', margin: '0 0 5px 0' }}>AI Prediction</p>
            <p style={{ fontSize: '0.9rem', color: '#666', margin: '0' }}>Generate insights using LLM</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📋</div>
            <p style={{ fontWeight: '600', color: '#ff8c00', margin: '0 0 5px 0' }}>Advisory Report</p>
            <p style={{ fontSize: '0.9rem', color: '#666', margin: '0' }}>Actionable recommendations</p>
          </div>
        </div>
      </div>

      {/* Trigger Button */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button
          onClick={triggerPredictiveAdvisory}
          disabled={isLoading}
          style={{
            padding: '15px 30px',
            borderRadius: '10px',
            border: 'none',
            color: 'white',
            fontWeight: '600',
            fontSize: '1.1rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            background: isLoading 
              ? '#9ca3af' 
              : 'linear-gradient(135deg, #4a7c59 0%, #667eea 100%)',
            boxShadow: isLoading 
              ? 'none' 
              : '0 8px 25px rgba(0,0,0,0.15)',
            transform: isLoading ? 'none' : 'translateY(0)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            margin: '0 auto'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 35px rgba(0,0,0,0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }
          }}
        >
          {isLoading ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ffffff40',
                borderTop: '2px solid #ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Generating Advisory...
            </>
          ) : (
            <>
              <span style={{ fontSize: '1.5rem' }}>🚀</span>
              Trigger Predictive Advisory
            </>
          )}
        </button>
      </div>

      {/* Information Box */}
      <div style={{ 
        background: '#e3f2fd', 
        borderLeft: '4px solid #2196f3', 
        borderRadius: '0 8px 8px 0', 
        padding: '20px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
          <div style={{ fontSize: '1.5rem', marginTop: '2px' }}>💡</div>
          <div>
            <h4 style={{ 
              fontWeight: '600', 
              color: '#1976d2', 
              marginBottom: '12px',
              margin: '0 0 12px 0'
            }}>
              What you'll get:
            </h4>
            <ul style={{ 
              color: '#1565c0', 
              fontSize: '0.95rem', 
              lineHeight: '1.6',
              margin: '0',
              paddingLeft: '20px'
            }}>
              <li style={{ marginBottom: '6px' }}>
                Potential pest and disease predictions for your {localStorage.getItem('farmSettings') ? JSON.parse(localStorage.getItem('farmSettings')).cropType : 'crop'}
              </li>
              <li style={{ marginBottom: '6px' }}>Weather-based risk assessment</li>
              <li style={{ marginBottom: '6px' }}>Preventive measures and recommendations</li>
              <li style={{ marginBottom: '6px' }}>Optimal timing for treatments</li>
              <li style={{ marginBottom: '0' }}>Cost-effective solutions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          marginTop: '25px',
          background: '#fff5f5', 
          borderLeft: '4px solid #ef4444', 
          borderRadius: '0 8px 8px 0', 
          padding: '15px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '1.5rem' }}>⚠️</div>
            <div>
              <p style={{ color: '#dc2626', fontWeight: '600', margin: '0 0 5px 0' }}>Error</p>
              <p style={{ color: '#b91c1c', fontSize: '0.9rem', margin: '0' }}>{error}</p>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default FarmPredictiveAdvisories;