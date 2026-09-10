import React, { useState } from "react";
import { useCanvas } from "../context/canvas";
import "../CSS/LeftBody.css";

const colors = [
  "rgba(134, 6, 212, 1)", // Purple accent
  "#000000",              // Black
  "#2563eb",              // Blue
  "#16a34a",              // Green
  "#dc2626",              // Red
  "#ea580c",              // Orange
  "#eab308",              // Yellow
  "#64748b",              // Slate
];

function LeftBody() {
  const {
    selectedTool,
    setSelectedTool,
    strokeColor,
    setStrokeColor,
    strokeValue,
    setStrokeValue,
    AiFeature,
    setAiFeature,
    selectedElementId,
    elements,
    setElements,
    setSelectedElementId,
    saveCanvasState,
  } = useCanvas();

  const [showShapesMenu, setShowShapesMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSlider, setShowSlider] = useState(false);

  const handleDeleteSelected = () => {
    if (!selectedElementId) return;
    const updated = elements.filter((el) => el.id !== selectedElementId);
    setElements(updated);
    setSelectedElementId(null);
    saveCanvasState(updated);
  };

  const isShapeActive = ["rectangle", "circle", "triangle", "line", "arrow"].includes(selectedTool);

  const shapeTools = [
    {
      id: "rectangle",
      label: "Rectangle",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      ),
    },
    {
      id: "circle",
      label: "Circle",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
        </svg>
      ),
    },
    {
      id: "triangle",
      label: "Triangle",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 3 2 21 22 21" />
        </svg>
      ),
    },
    {
      id: "line",
      label: "Line",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="20" x2="20" y2="4" />
        </svg>
      ),
    },
    {
      id: "arrow",
      label: "Arrow",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      ),
    },
  ];

  return (
    <div className="left-body-container">
      {/* Primary Tool Dock */}
      <div className="left-body1">
        {/* Select / Move Tool */}
        <button
          className={`tool-btn ${selectedTool === "select" ? "selected" : ""}`}
          onClick={() => {
            setSelectedTool("select");
            setShowShapesMenu(false);
          }}
          title="Select & Move Tool"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3l7 18 3-7 7-3L3 3z" />
          </svg>
        </button>

        {/* Pen Tool */}
        <button
          className={`tool-btn ${selectedTool === "pen" ? "selected" : ""}`}
          onClick={() => {
            setSelectedTool("pen");
            setShowShapesMenu(false);
          }}
          title="Pen Tool (Freehand)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          </svg>
        </button>

        {/* Eraser Tool */}
        <button
          className={`tool-btn ${selectedTool === "eraser" ? "selected" : ""}`}
          onClick={() => {
            setSelectedTool("eraser");
            setShowShapesMenu(false);
          }}
          title="Eraser Tool"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 20H7L3 16C2 15 2 13 3 12L13 2C14 1 16 1 17 2L21 6C22 7 22 9 21 10L14 17" />
          </svg>
        </button>

        {/* Shapes Dropdown Menu */}
        <div className="shapes-wrapper">
          <button
            className={`tool-btn ${isShapeActive ? "selected" : ""}`}
            onClick={() => setShowShapesMenu(!showShapesMenu)}
            title="Shapes Tool"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>

          {showShapesMenu && (
            <div className="shapes-dropdown">
              {shapeTools.map((st) => (
                <button
                  key={st.id}
                  className={`shape-option ${selectedTool === st.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedTool(st.id);
                    setShowShapesMenu(false);
                  }}
                >
                  {st.icon}
                  <span>{st.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Tool */}
        <button
          className={`tool-btn ${selectedTool === "text" ? "selected" : ""}`}
          onClick={() => {
            setSelectedTool("text");
            setShowShapesMenu(false);
          }}
          title="Text Tool"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="12" y1="4" x2="12" y2="20" />
            <line x1="9" y1="20" x2="15" y2="20" />
          </svg>
        </button>

        {/* Delete Tool */}
        <button
          className={`tool-btn danger-btn ${!selectedElementId ? "disabled" : ""}`}
          onClick={handleDeleteSelected}
          title={selectedElementId ? "Delete Selected Element" : "Select an element to delete"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      {/* AI Toggle Dock */}
      <div className="left-body2">
        <button
          className={`tool-btn ${AiFeature ? "selected Ai-active" : ""}`}
          onClick={() => setAiFeature(!AiFeature)}
          title="Toggle AI Handdrawn Shape Snap"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className="ai-text-badge">AI</span>
        </button>
      </div>

      {/* Color Selection Circular Button & Popover */}
      <div className="color-selector-wrapper">
        <button
          className="color-circle-btn"
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowSlider(false);
          }}
          title="Choose Color Palette"
        >
          <span
            className="inner-color-circle"
            style={{ backgroundColor: strokeColor }}
          />
        </button>

        {showColorPicker && (
          <div className="color-popover">
            <div className="color-popover-title">Color Palette</div>
            <div className="color-grid">
              {colors.map((c) => (
                <button
                  key={c}
                  className={`color-swatch-circle ${strokeColor === c ? "active" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    setStrokeColor(c);
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
            <div className="custom-color-row">
              <span>Custom:</span>
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="custom-color-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stroke Width / Thickness Selector Button & Vertical Slider */}
      <div className="vertical-thickness-wrapper">
        <button
          className="thickness-toggle-btn"
          onClick={() => {
            setShowSlider(!showSlider);
            setShowColorPicker(false);
          }}
          title="Stroke Width / Line Thickness"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" strokeWidth="1.5" />
            <line x1="3" y1="12" x2="21" y2="12" strokeWidth="3" />
            <line x1="3" y1="18" x2="21" y2="18" strokeWidth="5" />
          </svg>
        </button>

        {showSlider && (
          <div className="vertical-slider-popover">
            <span className="thickness-value">{strokeValue}px</span>
            <div className="vertical-slider-container">
              <input
                type="range"
                min="1"
                max="40"
                value={strokeValue}
                onChange={(e) => setStrokeValue(parseInt(e.target.value))}
                className="vertical-range-input"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeftBody;
