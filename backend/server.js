const express = require("express");
const cors = require("cors");
const { AccessToken } = require("livekit-server-sdk");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

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
    console.error("Error generating token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
