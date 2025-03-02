const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.static("dist")); // to serve dist file
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post("/api/v1/check-grammar", async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) return res.status(400).json({ correction: "No input detected." });

    const chatCompletion = await groq.chat.completions.create({
      "messages": [
          {
              "role": "system",
              "content": `You are an expert English teacher. First, check if the user's sentence contains abusive language (e.g., 'fuck', 'shit', racial slurs). If detected, respond ONLY with 'I can't respond to this sentence.' Otherwise, check grammatical correctness while ignoring capitalization, punctuation, and minor stylistic choices. If correct, respond with 'Your sentence is correct.' If errors exist, provide ONLY the corrected version. Never explain your responses.`
          },
          { 
              "role": "user", 
              "content": `Tell me if this sentence is grammatically correct: \"${transcript}\"`
          }
      ],
      "model": "mixtral-8x7b-32768",
      "temperature": 0.05,
      "max_completion_tokens": 1040,
      "top_p": 1,
      "stream": false
    });

    const correction = chatCompletion.choices[0]?.message?.content?.trim() || "Could you repeat again?";
    res.json({ correction });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ correction: "Oops! Something went wrong. Try again." });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
