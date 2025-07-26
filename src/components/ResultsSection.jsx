// src/components/ResultsSection.jsx
import React from 'react';

const ResultsSection = ({ results, mode }) => {
  const { data, title } = results;

  const renderDiseaseAnalysis = (analysis) => {
    if (!analysis || !analysis.final_response) return null;

    const diseaseData = analysis.final_response.detailed_analysis || {};
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="border-b pb-4 mb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-green-700">
              {diseaseData.disease_name || 'Analysis Complete'}
            </h3>
            {diseaseData.confidence && (
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                diseaseData.confidence === 'high' 
                  ? 'bg-green-100 text-green-800'
                  : diseaseData.confidence === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {diseaseData.confidence} confidence
              </span>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {diseaseData.severity && diseaseData.severity !== 'none' && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">🚨 Severity</h4>
              <p className="text-gray-700 capitalize">{diseaseData.severity}</p>
            </div>
          )}

          {diseaseData.immediate_action && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">⚡ Immediate Action</h4>
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <p className="text-red-700">{diseaseData.immediate_action}</p>
              </div>
            </div>
          )}

          {diseaseData.treatment_summary && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">💊 Treatment Summary</h4>
              <p className="text-gray-700">{diseaseData.treatment_summary}</p>
            </div>
          )}

          {diseaseData.organic_solutions && diseaseData.organic_solutions.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">🌿 Organic Solutions</h4>
              <div className="space-y-3">
                {diseaseData.organic_solutions.map((solution, index) => (
                  <div key={index} className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                    <h5 className="font-semibold text-green-800">{solution.name}</h5>
                    <p className="text-green-700 text-sm mt-1">
                      <strong>Preparation:</strong> {solution.preparation}
                    </p>
                    <p className="text-green-700 text-sm">
                      <strong>Application:</strong> {solution.application}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {diseaseData.cost_estimate && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">💰 Cost Estimate</h4>
              <div className="bg-blue-50 border border-blue-200 p-3 rounded text-center">
                <p className="font-semibold text-blue-800">{diseaseData.cost_estimate}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSchemesResponse = (response) => {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-green-700 mb-6">Government Schemes Information</h3>
        
        <div className="space-y-6">
          {response.final_response?.message && (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {response.final_response.message}
              </p>
            </div>
          )}

          {response.final_response?.schemes && response.final_response.schemes.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">📋 Relevant Schemes</h4>
              <div className="space-y-4">
                {response.final_response.schemes.map((scheme, index) => (
                  <div key={index} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <h5 className="font-semibold text-blue-800 mb-2">{scheme.name}</h5>
                    {scheme.description && (
                      <p className="text-blue-700 mb-2">{scheme.description}</p>
                    )}
                    {scheme.eligibility && (
                      <p className="text-blue-700 text-sm">
                        <strong>Eligibility:</strong> {scheme.eligibility}
                      </p>
                    )}
                    {scheme.benefits && (
                      <p className="text-blue-700 text-sm">
                        <strong>Benefits:</strong> {scheme.benefits}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTranscriptionResponse = (response) => {
    const success = response.final_response?.success;
    const transcript = response.final_response?.transcript || '';

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-green-700 mb-6">Audio Transcription</h3>
        
        {success ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">📝 Transcribed Text</h4>
              <div className="bg-gray-50 border-l-4 border-green-500 p-4 rounded">
                <p className="text-gray-700">{transcript}</p>
              </div>
            </div>
            
            <button
              onClick={() => navigator.clipboard.writeText(transcript)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📋 Copy Text
            </button>
          </div>
        ) : (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <h4 className="font-semibold text-red-800 mb-2">❌ Transcription Failed</h4>
            <p className="text-red-700">{response.final_response?.error || 'Unknown error occurred'}</p>
          </div>
        )}
      </div>
    );
  };

  const renderGenericResponse = (response) => {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-green-700 mb-6">{title}</h3>
        
        <div className="space-y-4">
          <div className="prose max-w-none">
            <p className="text-gray-700">
              {response.final_response?.message || response.message || 'Request processed successfully'}
            </p>
          </div>

          {/* Debug Panel */}
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              🔍 Show Debug Info
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-green-700 text-center">{title}</h2>
      
      {mode === 'disease' && data.final_response?.detailed_analysis 
        ? renderDiseaseAnalysis(data)
        : mode === 'schemes' 
        ? renderSchemesResponse(data)
        : mode === 'talk'
        ? renderTranscriptionResponse(data)
        : renderGenericResponse(data)
      }
    </div>
  );
};

export default ResultsSection;