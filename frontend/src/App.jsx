import React, { useState, useEffect } from "react";
import axios from "axios";
import { SparklesPreview } from "./components/Sparkles/SparklesPreview";

const App = () => {
  const [status, setStatus] = useState("idle");
  const [correction, setCorrection] = useState("");
  const [userTranscript, setUserTranscript] = useState("");
  const [error, setError] = useState("");
  const [recognition, setRecognition] = useState(null);
  
  const staticImage = "https://img.utdstc.com/icon/4fe/364/4fe364010eac6425d014a0be998e2f762ac10ad3da7fd1835986a6217eb20895:200";
  const speakingGif = "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzY2Zmh2YjA1bXIxaWhmcnF5NjNuajJ5anB6b3JjcHp5dWN5ajBhMSZlcD12MV9pbnRlcm5naWZfYnlfaWQmY3Q9Zw/2kS6e8RFoWbcs/giphy.gif";

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
            
            const response = await axios.post("/api/v1/check-grammar", { transcript: finalTranscript });
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
    <div className="h-screen bg-black">
      <div className="h-50">
        <SparklesPreview />
      </div>

      <div className="flex justify-center">
        <div className="max-w-lg w-full bg-gray-800 rounded-xl p-6 shadow-2xl border border-yellow-400">
            <h2 className="font-extrabold text-center text-yellow-400 mb-6">Talk with Tom</h2>
            <div className="flex justify-center mb-6">
              <img 
                src={status === "speaking" ? speakingGif : staticImage}
                alt="Talking Tom" 
                className="w-40 h-40 rounded-full border-4 border-yellow-400 shadow-lg" />
            </div>
            <div className="space-y-4">
              {userTranscript && <p className="p-3 bg-gray-700 rounded-lg">You: {userTranscript}</p>}
              {correction && <p className="p-3 bg-gray-700 rounded-lg">Tom: {correction}</p>}
              {error && <p className="text-red-400 text-center">⚠️ {error}</p>}
            </div>
            <button 
              onClick={startListening} 
              disabled={status !== "idle"} 
              className="mt-6 w-full py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 disabled:bg-gray-600 shadow-lg">
              {status === "listening" ? "Listening..." : "Start Conversation"}
            </button>
          </div>
      </div>

    </div>
    
  );
};

export default App;
