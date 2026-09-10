import React, { useState } from "react";

export function AiInfoPanel({ onTryShape, AiFeature, setAiFeature }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        marginBottom: "6px",
        background: "#ffffff",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
        padding: collapsed ? "4px 10px" : "6px 12px",
        transition: "all 0.15s ease",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "6px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              padding: "2px 6px",
              borderRadius: "4px",
              background: "rgba(134, 6, 212, 0.08)",
              color: "#8606d4",
              fontSize: "0.68rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Quick Guide & AI Features
          </div>
          <span style={{ fontSize: "0.68rem", color: "#64748b" }}>
            {AiFeature ? (
              <span style={{ color: "#16a34a", fontWeight: "500" }}>
                AI Shape Snap Active — Rough hand-drawn shapes automatically snap to clean vectors.
              </span>
            ) : (
              <span>Turn on AI Mode in toolbar to enable hand-drawn shape auto-snapping.</span>
            )}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={() => setAiFeature(!AiFeature)}
            style={{
              background: AiFeature ? "#8606d4" : "#f1f5f9",
              color: AiFeature ? "#ffffff" : "#475569",
              border: "none",
              padding: "3px 8px",
              borderRadius: "5px",
              fontSize: "0.65rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {AiFeature ? "AI Mode: Enabled" : "Enable AI Mode"}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "transparent",
              border: "1px solid #cbd5e1",
              borderRadius: "4px",
              color: "#475569",
              cursor: "pointer",
              fontSize: "0.65rem",
              padding: "2px 6px",
            }}
          >
            {collapsed ? "Show Instructions" : "Hide Instructions"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div
          style={{
            marginTop: "6px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "6px",
            fontSize: "0.65rem",
            paddingTop: "6px",
            borderTop: "1px solid #f1f5f9",
          }}
        >
          {/* Card 1: Try AI Shapes */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8606d4" strokeWidth="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              </svg>
              AI Shape Snapping
            </div>
            <div style={{ color: "#475569", marginBottom: "4px" }}>
              Draw rough strokes with pen or click to test:
            </div>
            <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
              <button onClick={() => onTryShape && onTryShape("triangle")} style={chipStyle}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 3 2 21 22 21" />
                </svg>
                Triangle
              </button>
              <button onClick={() => onTryShape && onTryShape("circle")} style={chipStyle}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                </svg>
                Circle
              </button>
              <button onClick={() => onTryShape && onTryShape("rectangle")} style={chipStyle}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
                Rectangle
              </button>
            </div>
          </div>

          {/* Card 2: Voice Commands */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
              Voice Commands
            </div>
            <div style={{ color: "#475569" }}>
              Click mic icon & speak:
              <ul style={{ margin: "2px 0 0 10px", padding: 0, color: "#334155" }}>
                <li>"Draw a circle radius 70"</li>
                <li>"Draw a rectangle 150 by 100"</li>
              </ul>
            </div>
          </div>

          {/* Card 3: Select & Move */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <path d="M3 3l7 18 3-7 7-3L3 3z" />
              </svg>
              Select, Move & Scale
            </div>
            <div style={{ color: "#475569" }}>
              Use <b>Select Tool</b> to click shapes/strokes, drag to move, drag corners to scale, or press <kbd style={kbdStyle}>Delete</kbd>.
            </div>
          </div>

          {/* Card 4: Real-time Collaboration */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Real-Time Collaboration
            </div>
            <div style={{ color: "#475569" }}>
              Open a new browser tab, join the same Room ID, and experience live multiplayer drawing and cursor tracking!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  padding: "4px 8px",
};

const cardHeaderStyle = {
  fontWeight: "600",
  color: "#0f172a",
  marginBottom: "2px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
};

const chipStyle = {
  background: "#ffffff",
  border: "1px solid #cbd5e1",
  borderRadius: "3px",
  padding: "1px 5px",
  fontSize: "0.62rem",
  fontWeight: "500",
  color: "#334155",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "3px",
  transition: "all 0.15s ease",
};

const kbdStyle = {
  background: "#ffffff",
  border: "1px solid #cbd5e1",
  borderRadius: "3px",
  padding: "0px 3px",
  fontSize: "0.6rem",
  fontFamily: "monospace",
};

export default AiInfoPanel;
