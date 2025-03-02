import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { SparklesPreview } from "./components/Sparkles/SparklesPreview";

const App = () => {
  const [status, setStatus] = useState("idle");
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const abortControllerRef = useRef(null);

  const staticImage = "https://img.utdstc.com/icon/4fe/364/4fe364010eac6425d014a0be998e2f762ac10ad3da7fd1835986a6217eb20895:200";
  const speakingGif = "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzY2Zmh2YjA1bXIxaWhmcnF5NjNuajJ5anB6b3JjcHp5dWN5ajBhMSZlcD12MV9pbnRlcm5naWZfYnlfaWQmY3Q9Zw/2kS6e8RFoWbcs/giphy.gif";

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = async (event) => {
      const transcript = event.results[0][0].transcript.trim();
      if (!transcript) return;

      setConversation(prev => [...prev, { type: 'user', text: transcript }]);
      setStatus('processing');
      setIsListening(false);

      try {
        abortControllerRef.current = new AbortController();
        const response = await axios.post(
          "/api/v1/check-grammar",
          { transcript },
          { signal: abortControllerRef.current.signal }
        );
        
        setConversation(prev => [...prev, { type: 'system', text: response.data.correction }]);
        speak(response.data.correction);
      } catch (err) {
        if (err.name !== 'CanceledError') {
          setError("Error processing request. Please try again.");
          stopConversation();
        }
      }
    };

    recognitionRef.current.onerror = (event) => {
      setError(event.error === 'not-allowed' 
        ? "Microphone access required" 
        : "Error recognizing speech");
      stopConversation();
    };

    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis.cancel();
    };
  }, []);

  const startListening = () => {
    setError('');
    try {
      if (!isListening) {
        recognitionRef.current?.start();
        setIsListening(true);
        setStatus('listening');
      }
    } catch (err) {
      setError("Failed to start microphone");
      stopConversation();
    }
  };

  const stopConversation = () => {
    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();
    abortControllerRef.current?.abort();
    setIsListening(false);
    setStatus('idle');
  };

  const speak = (text) => {
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setStatus('speaking');
    utterance.onend = () => {
      setStatus('idle');
      // Restart listening after speech ends
      startListening();
    };

    synth.speak(utterance);
  };

  const toggleConversation = () => {
    if (isListening) {
      stopConversation();
    } else {
      startListening();
    }
  };

  return (
    <div className="bg-black">
      <SparklesPreview />
      <div className="flex justify-center p-8">
        <div className="max-w-lg w-full bg-gray-800 rounded-xl p-6 shadow-2xl border border-yellow-400">
          <h2 className="font-extrabold text-center text-yellow-400 mb-6">Talk with Tom</h2>
          
          <div className="flex justify-center mb-6">
            <img 
              src={status === 'speaking' ? speakingGif : staticImage}
              alt="Talking Tom" 
              className="w-40 h-40 rounded-full border-4 border-yellow-400 shadow-lg"
            />
          </div>

          <div className="space-y-4 mb-6 h-48 overflow-y-auto">
            {conversation.map((entry, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg ${entry.type === 'user' 
                  ? 'bg-gray-700 text-yellow-100' 
                  : 'bg-yellow-900 text-yellow-100'}`
                }
              >
                <span className="font-bold text-yellow-400">
                  {entry.type === 'user' ? 'You:' : 'Tom:'}
                </span> {entry.text}
              </div>
            ))}
            {error && (
              <div className="p-3 bg-red-900/50 text-red-400 rounded-lg text-center">
                ⚠️ {error}
              </div>
            )}
          </div>

          <button 
            onClick={toggleConversation}
            className={`w-full py-3 text-lg font-bold rounded-lg transition-all ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
            } shadow-lg`}
          >
            {isListening ? 'Stop Conversation' : 'Start Conversation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;