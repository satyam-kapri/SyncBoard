import React, { useState } from "react";
import "../CSS/RightHeader.css";
import undoimg from "../assets/Undo.svg";
import shareicon from "../assets/Share.svg";
import { useCanvas } from "../context/canvas";
import { useSocket } from "../context/socketcontext";

function RightHeader() {
  const {
    redoStack,
    canvasHistory,
    undo,
    redo,
  } = useCanvas();

  const { room, users } = useSocket();
  const [copied, setCopied] = useState(false);

  const handleCopyShare = () => {
    if (room) {
      navigator.clipboard.writeText(room);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeUsersCount = users ? users.length + 1 : 1;

  return (
    <div id="right-header">
      {/* Undo & Redo Controls */}
      <div className="undo-outer">
        <button
          className="undo-btn"
          title="Undo"
          onClick={undo}
          disabled={canvasHistory.length === 0}
        >
          <img src={undoimg} alt="Undo" className="undo-icon" />
        </button>

        <button
          className="undo-btn"
          title="Redo"
          onClick={redo}
          disabled={redoStack.length === 0}
        >
          <img src={undoimg} alt="Redo" className="redo-icon" />
        </button>
      </div>

      <div className="top-right-icons">
        {/* User Presence Badge */}
        <div className="users-icon" title={`${activeUsersCount} user(s) currently connected`}>
          <div className="user-avatars">
            <span className="user-badge-count">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "4px" }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {activeUsersCount} Online
            </span>
          </div>
        </div>

        {/* Share Room Code */}
        <button className="sharebtn" onClick={handleCopyShare} title="Copy Room ID to Clipboard">
          <img src={shareicon} alt="Share" style={{ height: "12px", width: "12px" }} />
          {copied ? "Copied!" : "Share"}
        </button>
      </div>
    </div>
  );
}

export default RightHeader;
