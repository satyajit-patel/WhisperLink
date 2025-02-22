// frontend/App.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const App = () => {
  const [isListening, setIsListening] = useState(false);
  const [correction, setCorrection] = useState("");
  const [userTranscript, setUserTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize speech recognition
  const [recognition, setRecognition] = useState(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognizer = new SpeechRecognition();
        recognizer.continuous = false;
        recognizer.interimResults = false;
        recognizer.lang = "en-US";

        recognizer.onresult = async (event) => {
          const transcript = event.results[0][0].transcript;
          setUserTranscript(transcript);
          setIsProcessing(true);
          try {
            const response = await axios.post("http://localhost:5000/check-grammar", {
              transcript
            });
            setCorrection(response.data.correction);
            speak(response.data.correction);
          } catch (err) {
            setError("Error processing your speech. Please try again.");
          }
          setIsProcessing(false);
        };

        recognizer.onerror = (event) => {
          setError("Speech recognition error. Please allow microphone access.");
          setIsListening(false);
        };

        setRecognition(recognizer);
      } else {
        setError("Speech recognition not supported in this browser.");
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      setError("");
      setUserTranscript("");
      setCorrection("");
      recognition?.start();
    }
    setIsListening(!isListening);
  };

  const speak = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    synth.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-600 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          AI Language Tutor
        </h1>

        {/* Animated Bot Avatar */}
        <div className="flex justify-center mb-8">
          <motion.div
            animate={isSpeaking ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          >
            <div className="w-32 h-32 bg-indigo-300 rounded-full flex items-center justify-center">
              <span className="text-6xl">🤖</span>
            </div>
          </motion.div>
        </div>

        {/* Conversation Interface */}
        <div className="space-y-6 mb-8">
          {userTranscript && (
            <div className="animate-fade-in">
              <p className="text-sm text-indigo-200 mb-1">You said:</p>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="text-white">{userTranscript}</p>
              </div>
            </div>
          )}

          {correction && (
            <div className="animate-fade-in">
              <p className="text-sm text-indigo-200 mb-1">Correction:</p>
              <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                <p className="text-green-200">{correction}</p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex justify-center items-center space-x-2 text-indigo-200">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          )}

          {error && (
            <div className="text-red-300 bg-red-900/20 p-3 rounded-lg">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Control Button */}
        <button
          onClick={toggleListening}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl font-semibold transition-all ${
            isListening 
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-white/90 hover:bg-white text-indigo-600"
          } ${isProcessing && "opacity-50 cursor-not-allowed"}`}
        >
          {isListening ? "Stop Speaking" : "Start Speaking"}
        </button>
      </div>

      <p className="mt-8 text-center text-white/60">
        Speak naturally and get instant grammar corrections from AI
      </p>
    </div>
  );
};

export default App;