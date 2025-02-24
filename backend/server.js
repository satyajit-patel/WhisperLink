const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post("/api/v1//check-grammar", async (req, res) => {
  console.log("Hello.. you are here")
  try {
    const { transcript } = req.body;
    if (!transcript) return res.status(400).json({ correction: "No input detected." });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a friendly English tutor. Correct grammar and respond as 'You mean: [correct sentence]'. If perfect, say 'Perfect! 🎉 Great job!'." },
        { role: "user", content: transcript }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.3,
      max_tokens: 100
    });

    const correction = chatCompletion.choices[0]?.message?.content?.trim() || "Could you repeat that?";
    res.json({ correction });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ correction: "Oops! Something went wrong. Try again." });
  }
});

app.use("/ping", (req, res) => {
  res.send("pong");
})

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
