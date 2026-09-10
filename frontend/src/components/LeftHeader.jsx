import React from "react";
import Logo from "./Logo";
import { useSocket } from "../context/socketcontext";
import { useCanvas } from "../context/canvas";
import "../CSS/LeftHeader.css";

function LeftHeader() {
  const { room } = useSocket();
  const { gridStyle, setGridStyle, clearCanvas, canvasRef } = useCanvas();

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `syncboard-${room || "whiteboard"}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div id="left-header">
      <Logo size="small" />

      {room && (
        <div className="room-badge">
          <span className="live-dot"></span>
          Room: <strong>{room}</strong>
        </div>
      )}

      {/* Grid Style Toggle */}
      <div className="header-actions">
        <div className="grid-selector" title="Canvas background grid style">
          <button
            className={gridStyle === "blank" ? "active" : ""}
            onClick={() => setGridStyle("blank")}
          >
            Blank
          </button>
          <button
            className={gridStyle === "dots" ? "active" : ""}
            onClick={() => setGridStyle("dots")}
          >
            Dots
          </button>
          <button
            className={gridStyle === "lines" ? "active" : ""}
            onClick={() => setGridStyle("lines")}
          >
            Lines
          </button>
        </div>

        {/* Download Canvas PNG */}
        <button className="icon-header-btn" onClick={handleDownload} title="Export Whiteboard as PNG Image">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export PNG
        </button>

        {/* Clear Canvas */}
        <button className="icon-header-btn danger" onClick={clearCanvas} title="Clear Entire Canvas">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Clear
        </button>
      </div>
    </div>
  );
}

export default LeftHeader;
