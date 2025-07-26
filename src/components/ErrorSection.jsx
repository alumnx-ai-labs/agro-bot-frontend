// src/components/ErrorSection.jsx
import React from 'react';

const ErrorSection = ({ error, onRetry }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Oops! Something went wrong
      </h2>
      
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-700">{error}</p>
      </div>
      
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorSection;