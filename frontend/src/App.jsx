import React, { useEffect, useState } from "react";
import { LiveKitRoom, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import axios from "axios";

const App = () => {
  const username = "user1";
  const room = "test-room";
  const [token, setToken] = useState(null);
  const [serverUrl, setServerUrl] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    axios
      .post("http://localhost:5000/get-token", { username, room })
      .then((res) => {
        setToken(res.data.token);
        setServerUrl(res.data.url);
      })
      .catch((err) => console.error("Error getting token", err));
  }, [username, room]);

  if (!token || !serverUrl)
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-blue-100 to-blue-300">
        <p className="text-xl font-medium text-gray-700 animate-pulse">
          Connecting to your agent...
        </p>
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-blue-200 justify-center items-center p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold text-gray-700">
          🎙️ Talking to Live Agent
        </h2>
        <p className="text-gray-500 mt-2">Feel free to speak, I'm listening...</p>

        {!connected ? (
          <button
            onClick={() => setConnected(true)}
            className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
          >
            Start Conversation
          </button>
        ) : (
          <LiveKitRoom serverUrl={serverUrl} token={token} connect={true}>
            <AudioRenderer />
            <button
              onClick={() => setConnected(false)}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition mt-4"
            >
              End Conversation
            </button>
          </LiveKitRoom>
        )}
      </div>
    </div>
  );
};

const AudioRenderer = () => {
  const tracks = useTracks(Track.Source.Microphone);

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium text-gray-700 mb-2">🔊 Audio Stream</h3>
      {tracks.length > 0 ? (
        tracks.map((track) =>
          track.publication.isSubscribed ? (
            <audio
              key={track.sid}
              autoPlay
              controls
              className="w-full mt-2 rounded-lg shadow-sm"
              srcObject={track.track.mediaStream}
            />
          ) : null
        )
      ) : (
        <p className="text-gray-500 italic">Waiting for agent's response...</p>
      )}
    </div>
  );
};

export default App;
