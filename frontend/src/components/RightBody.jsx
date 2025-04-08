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
      // Notify others that user is typing
      if (!isTyping) {
        socket.emit("typing", { room, username, isTyping: true });
        setIsTyping(true);
      }
    }
  };

  const handleBlur = () => {
    if (isTyping) {
      socket.emit("typing", { room, username, isTyping: false });
      setIsTyping(false);
    }
  };

  return (
    <div className="Right-Body">
      <div className="Chat-Header">
        <h3>Meeting Chat - Room: {room}</h3>
        {/* <div className="online-users">
          <span>Users online: {typingUsers.length}</span>
        </div> */}
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
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="message-content">{msg.content}</div>
                </>
              )}
            </div>
          ))}
          <div className="typing-indicator">
            {typingUsers.length > 0 && (
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
          <button onClick={sendMessage} disabled={!message.trim()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="m21.426 11.095l-17-8A1 1 0 0 0 3.03 4.242l1.212 4.849L12 12l-7.758 2.909l-1.212 4.849a.998.998 0 0 0 1.396 1.147l17-8a1 1 0 0 0 0-1.81"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RightBody;
