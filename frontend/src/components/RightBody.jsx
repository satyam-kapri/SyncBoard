import React from "react";
import "../CSS/RightBody.css";
import { useSocket } from "../context/socketcontext";

function RightBody() {
  const {
    socket,
    setMessage,
    messages,
    message,
    room,
    username,
    sendMessage,
    isTyping,
    setIsTyping,
    typingUsers,
  } = useSocket();

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    } else {
      if (!isTyping && socket) {
        socket.emit("typing", { room, username, isTyping: true });
        setIsTyping(true);
      }
    }
  };

  const handleBlur = () => {
    if (isTyping && socket) {
      socket.emit("typing", { room, username, isTyping: false });
      setIsTyping(false);
    }
  };

  return (
    <div className="Right-Body">
      <div className="Chat-Header">
        <div className="chat-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Room Chat</span>
          <span className="room-name">#{room || "general"}</span>
        </div>
      </div>
      <div className="Chat-Body">
        <div className="chat-box">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              {msg.type === "system" ? (
                <em className="system-message">{msg.content}</em>
              ) : (
                <>
                  <div className="message-header">
                    <strong className="sender">{msg.sender}</strong>
                    <span className="timestamp">
                      {msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  <div className="message-content">{msg.content}</div>
                </>
              )}
            </div>
          ))}
          <div className="typing-indicator">
            {typingUsers && typingUsers.length > 0 && (
              <span>
                {typingUsers.join(", ")}{" "}
                {typingUsers.length === 1 ? "is" : "are"} typing...
              </span>
            )}
          </div>
        </div>
        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            placeholder="Type a message..."
            maxLength={500}
          />
          <button onClick={sendMessage} disabled={!message.trim()} title="Send Message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RightBody;
