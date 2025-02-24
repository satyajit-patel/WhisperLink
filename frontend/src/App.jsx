import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const App = () => {
  const [status, setStatus] = useState("idle"); // idle, listening, processing, speaking
  const [correction, setCorrection] = useState("");
  const [userTranscript, setUserTranscript] = useState("");
  const [error, setError] = useState("");
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          setError("Speech recognition is not supported in this browser.");
          return;
        }

        const recognizer = new SpeechRecognition();
        recognizer.continuous = false;
        recognizer.interimResults = false;
        recognizer.lang = "en-US";

        recognizer.onresult = async (event) => {
          try {
            const finalTranscript = event.results[0][0].transcript.trim();
            if (!finalTranscript) return;
            
            setUserTranscript(finalTranscript);
            setStatus("processing");
            recognizer.stop();
            
            const response = await axios.post("http://localhost:5000/api/v1/check-grammar", { transcript: finalTranscript });
            setCorrection(response.data.correction);
            speak(response.data.correction);
          } catch (err) {
            setError("Error processing speech. Please try again.");
            setStatus("idle");
          }
        };

        recognizer.onerror = () => {
          setError("Microphone access is required.");
          setStatus("idle");
        };

        recognizer.onend = () => {
          if (status === "listening") setStatus("idle");
        };

        setRecognition(recognizer);
      }
    } catch (err) {
      setError("Unexpected error occurred.");
    }
  }, []);

  const startListening = () => {
    try {
      setError("");
      setUserTranscript("");
      setCorrection("");
      recognition?.start();
      setStatus("listening");
    } catch (err) {
      setError("Failed to start listening. Please try again.");
    }
  };

  const speak = (text) => {
    try {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setStatus("speaking");
      utterance.onend = () => setStatus("idle");
      synth.speak(utterance);
    } catch (err) {
      setError("Speech synthesis failed.");
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <div className="max-w-lg w-full bg-gray-800 rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-center text-yellow-400 mb-6">Talk with Tom</h1>
        <div className="flex justify-center mb-6">
          <motion.div animate={status === "speaking" ? { scale: [1, 1.05, 1] } : { scale: 1 }} transition={{ duration: 0.8, repeat: Infinity }}>
            <img src="https://img.utdstc.com/icon/4fe/364/4fe364010eac6425d014a0be998e2f762ac10ad3da7fd1835986a6217eb20895:200" alt="Talking Tom" className="w-32 h-32 rounded-full border-4 border-yellow-400" />
          </motion.div>
        </div>
        <div className="space-y-4">
          {userTranscript && <p className="p-3 bg-gray-700 rounded-lg">You: {userTranscript}</p>}
          {correction && <p className="p-3 bg-yellow-600 rounded-lg">Tom: {correction}</p>}
          {error && <p className="text-red-400 text-center">⚠️ {error}</p>}
        </div>
        <button onClick={startListening} disabled={status !== "idle"} className="mt-6 w-full py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 disabled:bg-gray-600">
          {status === "listening" ? "Listening..." : "Start Conversation"}
        </button>
      </div>
    </div>
  );
};

export default App;
