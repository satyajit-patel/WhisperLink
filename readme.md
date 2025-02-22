# WhisperLink - Live Audio Interaction

This tool allows users to join audio rooms and practice a language.

## Features
- Secure user authentication using LiveKit tokens
- Real-time audio streaming

## Find the live link [here]() (comming soon)

## Installation & Setup

### 1️ Clone the Repository
    ```
    git clone https://github.com/your-repo/WhisperLink.git
    cd WhisperLink
    ```

### 2 Backend

#### Configure Environment Variables
Create a .env file in the backend directory and add:
```
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_URL=wss://your-livekit-cloud-instance
PORT=5000
```

```
cd backend
npm install
node server.js
```
# Frontend
```
cd frontend
npm install
npm run dev
```
