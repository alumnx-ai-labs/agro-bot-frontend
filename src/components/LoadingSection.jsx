// src/components/LoadingSection.jsx
import React, { useState, useEffect } from 'react';

const LoadingSection = ({ loadingText, mode }) => {
  const [currentThought, setCurrentThought] = useState(0);
  const [thoughts, setThoughts] = useState([]);

  useEffect(() => {
    // Set thoughts based on mode
    let modeThoughts;
    if (mode === 'disease') {
      modeThoughts = [
        "🤔 Analyzing your crop image...",
        "🎯 Identifying potential issues...",
        "🔬 Calling disease detection specialist...",
        "✅ Analysis complete! Preparing response..."
      ];
    } else if (mode === 'schemes') {
      modeThoughts = [
        "🤔 Understanding your query...",
        "🔍 Searching government schemes database...",
        "📊 Finding relevant schemes and policies...",
        "✅ Query complete! Preparing information..."
      ];
    } else if (mode === 'talk') {
      modeThoughts = [
        "🎤 Processing your audio...",
        "🔊 Converting speech to text...",
        "🌐 Translating if needed...",
        "✅ Transcription complete!"
      ];
    } else {
      modeThoughts = [
        "🤔 Processing your request...",
        "⚙️ Working on it...",
        "📊 Almost done...",
        "✅ Complete!"
      ];
    }

    setThoughts(modeThoughts);
    setCurrentThought(0);

    // Cycle through thoughts
    const interval = setInterval(() => {
      setCurrentThought((prev) => {
        if (prev < modeThoughts.length - 1) {
          return prev + 1;
        }
        return prev; // Stay on last thought
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [mode]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      {/* Spinner */}
      <div className="flex justify-center mb-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>

      {/* Loading Text */}
      <p className="text-lg font-medium text-gray-700 mb-6">
        {loadingText}
      </p>

      {/* Manager Thoughts */}
      <div className="space-y-3">
        {thoughts.map((thought, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg transition-all duration-500 ${
              index <= currentThought
                ? 'bg-green-50 border-l-4 border-green-500 text-green-700 opacity-100 transform translate-y-0'
                : 'opacity-50 transform translate-y-2'
            }`}
          >
            {thought}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSection;