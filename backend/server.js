// backend/server.js
const express = require("express");
const cors = require("cors");
const { AccessToken } = require("livekit-server-sdk");
require("dotenv").config();
const Groq = require('groq-sdk');
const app = express();

app.use(cors());
app.use(express.json());

// LiveKit Configuration
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

// Groq Configuration
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Grammar Check Endpoint
app.post("/check-grammar", async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({ error: "Empty transcript provided" });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert English teacher. Correct any grammatical errors in the user's text while maintaining their original meaning. Provide only the corrected version without explanations."
        },
        {
          role: "user",
          content: transcript
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.3,
      max_tokens: 1024
    });

    const correction = chatCompletion.choices[0]?.message?.content?.trim();
    if (!correction) {
      throw new Error("No correction generated");
    }

    res.json({ correction });
  } catch (error) {
    console.error("Grammar check error:", error);
    res.status(500).json({ 
      error: "Could not process your request. Please try again.",
      details: error.message
    });
  }
});

// LiveKit Token Endpoint (for future voice integration)
app.post("/get-token", (req, res) => {
  try {
    const { username, room } = req.body;
    if (!username || !room) {
      return res.status(400).json({ error: "Username and room are required" });
    }

    const token = new AccessToken(API_KEY, API_SECRET, { identity: username });
    token.addGrant({
      roomJoin: true,
      room: room,
      canPublish: true,
      canSubscribe: true,
    });

    res.json({ token: token.toJwt(), url: LIVEKIT_URL });
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ 
      error: "Failed to generate access token",
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));