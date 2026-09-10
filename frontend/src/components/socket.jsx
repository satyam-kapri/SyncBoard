import React from "react";
import { useSocket } from "../context/socketcontext";
import Logo from "./Logo";
import "../CSS/socket.css";

function Socket() {
  const { setRoom, joined, username, room, setUsername, joinRoom } = useSocket();

  const handleRandomRoom = () => {
    const randomId = "room-" + Math.floor(1000 + Math.random() * 9000);
    setRoom(randomId);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      joinRoom();
    }
  };

  if (!setUsername || !setRoom) {
    return <p>Error: Socket context not found.</p>;
  }

  return (
    <div className="landing-page">
      {!joined && (
        <div className="landing-container">
          {/* Header Brand */}
          <div className="landing-header">
            <Logo size="large" />
            <p className="landing-subtitle">
              Collaborative whiteboard with hand-drawn AI shape recognition & voice controls.
            </p>
          </div>

          {/* Main Content Layout */}
          <div className="landing-content">
            {/* Join Room Form Card */}
            <div className="join-card">
              <div className="card-badge">Live Workspace</div>
              <h2>Join a Room</h2>
              <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "20px" }}>
                Enter your username and room ID to start collaborating
              </p>

              <div className="form-group">
                <label>Username</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label>Room ID</label>
                  <button
                    type="button"
                    onClick={handleRandomRoom}
                    className="quick-room-btn"
                  >
                    Generate Room ID
                  </button>
                </div>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Enter or generate room ID"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                </div>
              </div>

              <button
                className="join-submit-btn"
                onClick={joinRoom}
                disabled={!username.trim() || !room.trim()}
              >
                Join Room
              </button>
            </div>

            {/* Feature Showcase */}
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon-wrapper purple">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <h3>AI Shape Snapping</h3>
                <p>
                  Draw rough hand-drawn strokes of triangles, circles, or rectangles and let AI convert them into clean vectors.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper blue">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  </svg>
                </div>
                <h3>Voice-to-Shape AI</h3>
                <p>
                  Speak commands like <i>"Draw a circle with radius 70"</i> or <i>"Draw a rectangle 150 by 100"</i>.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper green">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3l7 18 3-7 7-3L3 3z" />
                  </svg>
                </div>
                <h3>Select, Drag & Move</h3>
                <p>
                  Click any shape or text element with the <b>Select Tool</b> to drag it around, resize, or delete.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper orange">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3>Real-Time Multiplayer</h3>
                <p>
                  Open another browser tab and join the same room ID to see real-time multiplayer drawing and live cursors.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Socket;
