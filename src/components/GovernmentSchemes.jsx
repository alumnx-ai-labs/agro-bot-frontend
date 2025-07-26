// src/components/GovernmentSchemes.jsx
import React, { useState } from 'react';

const GovernmentSchemes = ({ onQuery, showLoading, showResults, showError }) => {
  const [query, setQuery] = useState('');

  const exampleQueries = [
    'What subsidies are available for drip irrigation?',
    'Tell me about PM-KISAN scheme eligibility and benefits',
    'What are the loan schemes for dairy farming?',
    'Organic farming certification and support schemes'
  ];

  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      alert('Please enter your question about government schemes.');
      return;
    }

    querySchemes();
  };

  const querySchemes = async () => {
    showLoading('Searching government schemes database...');

    const requestData = {
      inputType: 'text',
      content: query,
      language: 'en',
      queryType: 'government_schemes'
    };

    console.log('📤 Sending schemes query request...');

    const result = await onQuery(requestData);

    if (result.success) {
      console.log('✅ Schemes query successful:', result.data);
      showResults(result.data, 'Government Schemes Information');
    } else {
      console.error('❌ Schemes query failed:', result.error);
      showError(result.error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Query Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ask about Government Schemes:
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., What are the subsidies available for organic farming? What schemes are there for small farmers? Tell me about PM-KISAN scheme..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          🔍 Search Schemes
        </button>

        {/* Example Queries */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="font-semibold text-gray-700 mb-3">Example queries:</p>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExampleClick(example)}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                {example.length > 50 ? example.substring(0, 50) + '...' : example}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default GovernmentSchemes;