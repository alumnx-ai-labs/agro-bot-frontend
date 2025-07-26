// src/components/TalkNow.jsx
import React, { useState, useRef } from 'react';

const TalkNow = ({ onTranscribe, showLoading, showResults, showError }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [audioUrl, setAudioUrl] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi (हिन्दी)' },
    { value: 'bengali', label: 'Bengali (বাংলা)' },
    { value: 'tamil', label: 'Tamil (தமிழ்)' },
    { value: 'telugu', label: 'Telugu (తెలుగు)' },
    { value: 'marathi', label: 'Marathi (मराठी)' },
    { value: 'gujarati', label: 'Gujarati (ગુજરાતી)' },
    { value: 'kannada', label: 'Kannada (ಕನ್ನಡ)' },
    { value: 'malayalam', label: 'Malayalam (മലയാളം)' },
    { value: 'punjabi', label: 'Punjabi (ਪੰਜਾਬੀ)' }
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const options = {
        mimeType: 'audio/webm;codecs=opus'
      };

      if (MediaRecorder.isTypeSupported(options.mimeType)) {
        mediaRecorderRef.current = new MediaRecorder(stream, options);
      } else {
        mediaRecorderRef.current = new MediaRecorder(stream);
      }

      audioChunksRef.current = [];

      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        convertAudioToBase64(audioBlob);
      });

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingStatus('🔴 Recording...');
      
      console.log('✅ Recording started');

    } catch (error) {
      console.error('❌ Recording failed:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      setIsRecording(false);
      setRecordingStatus('✅ Recording complete! Ready to transcribe.');
      
      console.log('✅ Recording stopped');
    }
  };

  const convertAudioToBase64 = (audioBlob) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result.split(',')[1];
      setAudioData(base64Data);
      
      // Create audio URL for playback
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      console.log('✅ Audio converted to base64');
    };
    reader.readAsDataURL(audioBlob);
  };

  const transcribeAudio = async () => {
    if (!audioData) {
      alert('Please record audio first.');
      return;
    }

    showLoading('Transcribing your audio...');

    const requestData = {
      inputType: 'audio',
      content: audioData,
      language: selectedLanguage
    };

    console.log('📤 Sending transcription request...');

    const result = await onTranscribe(requestData);

    if (result.success) {
      console.log('✅ Transcription successful:', result.data);
      showResults(result.data, 'Audio Transcription Results');
    } else {
      console.error('❌ Transcription failed:', result.error);
      showError(result.error);
    }
  };

  const resetRecording = () => {
    setAudioData(null);
    setAudioUrl(null);
    setRecordingStatus('');
    setIsRecording(false);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="space-y-6">
        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Language:
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Recording Controls */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={startRecording}
            disabled={isRecording}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              isRecording
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            🎤 Start Recording
          </button>
          
          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              !isRecording
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            ⏹️ Stop Recording
          </button>
          
          <button
            onClick={transcribeAudio}
            disabled={!audioData}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              !audioData
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            📝 Transcribe Audio
          </button>

          {audioData && (
            <button
              onClick={resetRecording}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              🔄 Reset
            </button>
          )}
        </div>

        {/* Recording Status */}
        {recordingStatus && (
          <div className={`p-3 rounded-lg text-center font-semibold ${
            isRecording 
              ? 'bg-red-100 text-red-700 border border-red-300'
              : 'bg-green-100 text-green-700 border border-green-300'
          }`}>
            {recordingStatus}
          </div>
        )}

        {/* Audio Playback */}
        {audioUrl && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-3">🎵 Preview Recorded Audio:</h4>
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/webm" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
};

export default TalkNow;