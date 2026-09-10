import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { ML_API_URL } from "../config";
import { useCanvas } from "../context/canvas";
import { useSocket } from "../context/socketcontext";
import AiInfoPanel from "./AiInfoPanel";

const FreehandCanvas = () => {
  const {
    canvasRef,
    tempCanvasRef,
    points,
    selectedTool,
    strokeColor,
    strokeValue,
    AiFeature,
    setAiFeature,
    gridStyle,
    elements,
    setElements,
    selectedElementId,
    setSelectedElementId,
    saveCanvasState,
    strokeBoundsRef,
    isDrawing,
    setIsDrawing,
  } = useCanvas();

  const { Snap, sendSnap, users } = useSocket();

  // Active shape placement, dragging, or corner resizing state
  const [drawingShape, setDrawingShape] = useState(null);
  const [dragOffset, setDragOffset] = useState(null);
  const [resizeState, setResizeState] = useState(null); // { handle: 'tl'|'tr'|'bl'|'br', initialX, initialY, initialEl }
  const [cursorStyle, setCursorStyle] = useState("crosshair");

  const [activeText, setActiveText] = useState(null); // { x, y, text }
  const textInputRef = useRef(null);

  // Sync from socket snapshot
  useEffect(() => {
    if (!Snap || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const img = new Image();
    img.src = Snap;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
  }, [Snap]);

  // Canvas Resize Handler
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      const tempCtx = tempCanvasRef.current ? tempCanvasRef.current.getContext("2d") : null;

      const width = window.innerWidth - 380;
      const height = window.innerHeight - 150;

      ctx.canvas.width = Math.max(width, 800);
      ctx.canvas.height = Math.max(height, 500);

      if (tempCtx) {
        tempCtx.canvas.width = ctx.canvas.width;
        tempCtx.canvas.height = ctx.canvas.height;
      }

      redrawCanvas();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [elements, selectedElementId, gridStyle]);

  // Keyboard listener for Delete key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedElementId && !activeText) {
        const updated = elements.filter((el) => el.id !== selectedElementId);
        setElements(updated);
        setSelectedElementId(null);
        saveCanvasState(updated);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementId, elements, activeText]);

  // Redraw Canvas (Elements + Grid + Selection Box with Corner Handles)
  const redrawCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    // 1. Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // 2. Draw Grid Background
    drawGrid(ctx, width, height, gridStyle);

    // 3. Render all vector Elements (Shapes, Text, Freehand Strokes)
    elements.forEach((el) => {
      renderElement(ctx, el);
    });

    // 4. Render currently drawing shape preview
    if (drawingShape) {
      renderElement(ctx, drawingShape);
    }

    // 5. Render Selection Box around selected element
    if (selectedElementId) {
      const selEl = elements.find((e) => e.id === selectedElementId);
      if (selEl) {
        drawSelectionOutline(ctx, selEl);
      }
    }
  };

  useEffect(() => {
    redrawCanvas();
  }, [elements, selectedElementId, gridStyle, drawingShape]);

  // Draw Grid Pattern
  const drawGrid = (ctx, width, height, style) => {
    if (style === "blank") return;

    ctx.save();
    if (style === "dots") {
      ctx.fillStyle = "#cbd5e1";
      const gap = 24;
      for (let x = gap; x < width; x += gap) {
        for (let y = gap; y < height; y += gap) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (style === "lines") {
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      const gap = 30;
      for (let x = gap; x < width; x += gap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = gap; y < height; y += gap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  // Render individual element (Supports Freehand Scaling & Position)
  const renderElement = (ctx, el) => {
    ctx.save();
    ctx.strokeStyle = el.strokeColor || "#8606d4";
    ctx.fillStyle = el.fillColor || "transparent";
    ctx.lineWidth = el.strokeWidth || 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (el.type === "rectangle" || el.type === "square") {
      ctx.beginPath();
      ctx.rect(el.x, el.y, el.width, el.height);
      if (el.fillColor && el.fillColor !== "transparent") ctx.fill();
      ctx.stroke();
    } else if (el.type === "circle" || el.type === "ellipse") {
      ctx.beginPath();
      const radiusX = Math.abs(el.width) / 2;
      const radiusY = Math.abs(el.height) / 2;
      const centerX = el.x + radiusX;
      const centerY = el.y + radiusY;
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      if (el.fillColor && el.fillColor !== "transparent") ctx.fill();
      ctx.stroke();
    } else if (el.type === "triangle") {
      ctx.beginPath();
      ctx.moveTo(el.x + el.width / 2, el.y);
      ctx.lineTo(el.x, el.y + el.height);
      ctx.lineTo(el.x + el.width, el.y + el.height);
      ctx.closePath();
      if (el.fillColor && el.fillColor !== "transparent") ctx.fill();
      ctx.stroke();
    } else if (el.type === "line") {
      ctx.beginPath();
      ctx.moveTo(el.x, el.y);
      ctx.lineTo(el.x + el.width, el.y + el.height);
      ctx.stroke();
    } else if (el.type === "arrow") {
      const fromX = el.x;
      const fromY = el.y;
      const toX = el.x + el.width;
      const toY = el.y + el.height;
      const headlen = 14;
      const dx = toX - fromX;
      const dy = toY - fromY;
      const angle = Math.atan2(dy, dx);

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fillStyle = el.strokeColor || "#8606d4";
      ctx.fill();
    } else if (el.type === "text") {
      ctx.font = `${el.fontSize || 20}px 'Inter', sans-serif`;
      ctx.fillStyle = el.strokeColor || "#0f172a";
      ctx.fillText(el.text, el.x, el.y + (el.fontSize || 20));
    } else if (el.type === "freehand" && el.points && el.points.length > 0) {
      ctx.beginPath();
      const scaleX = el.origWidth && el.origWidth > 0 ? el.width / el.origWidth : 1;
      const scaleY = el.origHeight && el.origHeight > 0 ? el.height / el.origHeight : 1;

      const p0 = el.points[0];
      ctx.moveTo(el.x + p0.x * scaleX, el.y + p0.y * scaleY);
      for (let i = 1; i < el.points.length; i++) {
        const pt = el.points[i];
        ctx.lineTo(el.x + pt.x * scaleX, el.y + pt.y * scaleY);
      }
      ctx.stroke();
    }
    ctx.restore();
  };

  // Helper to compute element bounding box
  const getElementBounds = (el) => {
    if (!el) return { x: 0, y: 0, width: 0, height: 0 };
    if (el.type === "text") {
      const textWidth = (el.text ? el.text.length : 1) * 12;
      return { x: el.x, y: el.y, width: Math.max(textWidth, 60), height: el.fontSize || 24 };
    } else {
      return {
        x: Math.min(el.x, el.x + el.width),
        y: Math.min(el.y, el.y + el.height),
        width: Math.abs(el.width),
        height: Math.abs(el.height),
      };
    }
  };

  // Corner Handles Hit Testing
  const getCornerHandleUnderMouse = (x, y, el) => {
    if (!el) return null;
    const b = getElementBounds(el);
    const p = 8; // padding
    const rx = b.x - p;
    const ry = b.y - p;
    const rw = b.width + p * 2;
    const rh = b.height + p * 2;
    const r = 10; // hit radius

    const corners = {
      tl: { x: rx, y: ry },
      tr: { x: rx + rw, y: ry },
      bl: { x: rx, y: ry + rh },
      br: { x: rx + rw, y: ry + rh },
    };

    for (const [key, pos] of Object.entries(corners)) {
      if (Math.hypot(x - pos.x, y - pos.y) <= r) {
        return key;
      }
    }
    return null;
  };

  // Selection Bounding Box Outline with Interactive Corner Handles
  const drawSelectionOutline = (ctx, el) => {
    ctx.save();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);

    const bounds = getElementBounds(el);
    const p = 8;

    const rx = bounds.x - p;
    const ry = bounds.y - p;
    const rw = bounds.width + p * 2;
    const rh = bounds.height + p * 2;

    ctx.strokeRect(rx, ry, rw, rh);

    // Corner Handles
    ctx.setLineDash([]);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;

    const corners = [
      { x: rx, y: ry },
      { x: rx + rw, y: ry },
      { x: rx, y: ry + rh },
      { x: rx + rw, y: ry + rh },
    ];

    corners.forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  };

  // Check if click point is inside element
  const isPointInElement = (x, y, el) => {
    const b = getElementBounds(el);
    const p = 10;
    return x >= b.x - p && x <= b.x + b.width + p && y >= b.y - p && y <= b.y + b.height + p;
  };

  // Mouse Down Event
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === "select") {
      // 1. Check if clicking corner handle of already selected element
      if (selectedElementId) {
        const selEl = elements.find((el) => el.id === selectedElementId);
        const handle = getCornerHandleUnderMouse(x, y, selEl);
        if (handle) {
          setResizeState({
            handle,
            initialX: x,
            initialY: y,
            initialEl: { ...selEl },
          });
          setIsDrawing(true);
          return;
        }
      }

      // 2. Otherwise find clicked element (top to bottom)
      const clicked = [...elements].reverse().find((el) => isPointInElement(x, y, el));
      if (clicked) {
        setSelectedElementId(clicked.id);
        setDragOffset({ x: x - clicked.x, y: y - clicked.y });
        setIsDrawing(true);
      } else {
        setSelectedElementId(null);
      }
    } else if (selectedTool === "pen" || selectedTool === "eraser") {
      setIsDrawing(true);
      points.current = [{ x, y }];

      if (tempCanvasRef.current) {
        const tempCtx = tempCanvasRef.current.getContext("2d");
        tempCtx.clearRect(0, 0, tempCanvasRef.current.width, tempCanvasRef.current.height);
      }

      strokeBoundsRef.current = { minX: x, minY: y, maxX: x, maxY: y };
    } else if (["rectangle", "circle", "triangle", "line", "arrow"].includes(selectedTool)) {
      setIsDrawing(true);
      setDrawingShape({
        id: "shape-" + Date.now(),
        type: selectedTool,
        x,
        y,
        width: 0,
        height: 0,
        strokeColor,
        fillColor: "transparent",
        strokeWidth: strokeValue,
      });
    } else if (selectedTool === "text") {
      setActiveText({ x, y, text: "" });
      setTimeout(() => textInputRef.current?.focus(), 50);
    }
  };

  // Mouse Move Event (Supports Corner Resizing & Dragging Handdrawn Strokes)
  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Dynamically update cursor when in Select tool
    if (selectedTool === "select" && !isDrawing) {
      if (selectedElementId) {
        const selEl = elements.find((el) => el.id === selectedElementId);
        const handle = getCornerHandleUnderMouse(x, y, selEl);
        if (handle === "tl" || handle === "br") {
          setCursorStyle("nwse-resize");
        } else if (handle === "tr" || handle === "bl") {
          setCursorStyle("nesw-resize");
        } else if (isPointInElement(x, y, selEl)) {
          setCursorStyle("move");
        } else {
          setCursorStyle("default");
        }
      } else {
        const hovered = [...elements].reverse().find((el) => isPointInElement(x, y, el));
        setCursorStyle(hovered ? "pointer" : "default");
      }
    } else if (selectedTool === "text") {
      setCursorStyle("text");
    } else if (selectedTool === "pen" || selectedTool === "eraser" || ["rectangle", "circle", "triangle", "line", "arrow"].includes(selectedTool)) {
      setCursorStyle("crosshair");
    }

    if (!isDrawing) return;

    if (selectedTool === "select") {
      if (resizeState && selectedElementId) {
        // Corner Resizing / Scaling Logic
        const { handle, initialX, initialY, initialEl } = resizeState;
        const dx = x - initialX;
        const dy = y - initialY;

        let newX = initialEl.x;
        let newY = initialEl.y;
        let newWidth = initialEl.width;
        let newHeight = initialEl.height;

        if (handle === "br") {
          newWidth = Math.max(15, initialEl.width + dx);
          newHeight = Math.max(15, initialEl.height + dy);
        } else if (handle === "tr") {
          newWidth = Math.max(15, initialEl.width + dx);
          newHeight = Math.max(15, initialEl.height - dy);
          newY = initialEl.y + dy;
        } else if (handle === "bl") {
          newWidth = Math.max(15, initialEl.width - dx);
          newHeight = Math.max(15, initialEl.height + dy);
          newX = initialEl.x + dx;
        } else if (handle === "tl") {
          newWidth = Math.max(15, initialEl.width - dx);
          newHeight = Math.max(15, initialEl.height - dy);
          newX = initialEl.x + dx;
          newY = initialEl.y + dy;
        }

        setElements((prev) =>
          prev.map((el) =>
            el.id === selectedElementId
              ? { ...el, x: newX, y: newY, width: newWidth, height: newHeight }
              : el
          )
        );
      } else if (selectedElementId && dragOffset) {
        // Dragging Element Position (Handdrawn strokes, shapes & text)
        setElements((prev) =>
          prev.map((el) =>
            el.id === selectedElementId ? { ...el, x: x - dragOffset.x, y: y - dragOffset.y } : el
          )
        );
      }
    } else if (selectedTool === "pen" || selectedTool === "eraser") {
      points.current.push({ x, y });

      const mainCtx = canvasRef.current.getContext("2d");
      mainCtx.save();
      mainCtx.lineWidth = strokeValue;
      mainCtx.lineCap = "round";

      if (selectedTool === "eraser") {
        mainCtx.globalCompositeOperation = "destination-out";
        mainCtx.beginPath();
        mainCtx.arc(x, y, strokeValue * 1.5, 0, Math.PI * 2);
        mainCtx.fill();
      } else {
        mainCtx.globalCompositeOperation = "source-over";
        mainCtx.strokeStyle = strokeColor;
        const prev = points.current[points.current.length - 2];
        if (prev) {
          mainCtx.beginPath();
          mainCtx.moveTo(prev.x, prev.y);
          mainCtx.lineTo(x, y);
          mainCtx.stroke();
        }
      }
      mainCtx.restore();

      strokeBoundsRef.current.minX = Math.min(strokeBoundsRef.current.minX, x);
      strokeBoundsRef.current.minY = Math.min(strokeBoundsRef.current.minY, y);
      strokeBoundsRef.current.maxX = Math.max(strokeBoundsRef.current.maxX, x);
      strokeBoundsRef.current.maxY = Math.max(strokeBoundsRef.current.maxY, y);
    } else if (drawingShape) {
      setDrawingShape((prev) => ({
        ...prev,
        width: x - prev.x,
        height: y - prev.y,
      }));
    }
  };

  // Mouse Up Event
  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (selectedTool === "select") {
      if (resizeState || dragOffset) {
        setResizeState(null);
        setDragOffset(null);
        saveCanvasState();
      }
    } else if (drawingShape) {
      if (Math.abs(drawingShape.width) > 5 || Math.abs(drawingShape.height) > 5) {
        const updated = [...elements, drawingShape];
        setElements(updated);
        saveCanvasState(updated);
      }
      setDrawingShape(null);
    } else if (selectedTool === "pen") {
      if (points.current.length > 2) {
        const { minX, minY, maxX, maxY } = strokeBoundsRef.current;
        const w = Math.max(maxX - minX, 10);
        const h = Math.max(maxY - minY, 10);

        // Store relative freehand points for seamless dragging & corner scaling!
        const relativePoints = points.current.map((p) => ({
          x: p.x - minX,
          y: p.y - minY,
        }));

        const newFreehandElement = {
          id: "stroke-" + Date.now(),
          type: "freehand",
          x: minX,
          y: minY,
          width: w,
          height: h,
          origWidth: w,
          origHeight: h,
          points: relativePoints,
          strokeColor,
          strokeWidth: strokeValue,
        };

        if (AiFeature) {
          // Identify shape using ML backend API
          identifyShape(newFreehandElement);
        } else {
          const updated = [...elements, newFreehandElement];
          setElements(updated);
          saveCanvasState(updated);
        }
      }
    }
  };

  // ML Shape Identification function
  const identifyShape = async (freehandElement) => {
    try {
      const { minX, minY, maxX, maxY } = strokeBoundsRef.current;
      const width = Math.max(maxX - minX + 40, 60);
      const height = Math.max(maxY - minY + 40, 60);

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = width;
      exportCanvas.height = height;
      const exportCtx = exportCanvas.getContext("2d");

      exportCtx.fillStyle = "white";
      exportCtx.fillRect(0, 0, width, height);

      exportCtx.strokeStyle = "black";
      exportCtx.lineWidth = 4;
      exportCtx.lineCap = "round";
      exportCtx.beginPath();

      const p0 = points.current[0];
      exportCtx.moveTo(p0.x - minX + 20, p0.y - minY + 20);
      for (let i = 1; i < points.current.length; i++) {
        const pt = points.current[i];
        exportCtx.lineTo(pt.x - minX + 20, pt.y - minY + 20);
      }
      exportCtx.stroke();

      const dataURL = exportCanvas.toDataURL("image/png");
      const blob = await (await fetch(dataURL)).blob();
      const formData = new FormData();
      formData.append("image", blob, "latest_stroke.png");

      const response = await axios.post(`${ML_API_URL}/predict`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const predictedShape = response.data.shape;

      if (predictedShape && predictedShape !== "other") {
        const cleanShape = {
          id: "ai-shape-" + Date.now(),
          type: predictedShape === "ellipse" ? "circle" : predictedShape,
          x: minX,
          y: minY,
          width: width - 40,
          height: height - 40,
          strokeColor,
          fillColor: "transparent",
          strokeWidth: strokeValue,
        };
        const updated = [...elements, cleanShape];
        setElements(updated);
        saveCanvasState(updated);
      } else {
        const updated = [...elements, freehandElement];
        setElements(updated);
        saveCanvasState(updated);
      }
    } catch (err) {
      console.warn("ML API inference fallback to standard stroke:", err);
      const updated = [...elements, freehandElement];
      setElements(updated);
      saveCanvasState(updated);
    }
  };

  // Submit Text input onto canvas
  const handleTextSubmit = () => {
    if (activeText && activeText.text.trim()) {
      const textEl = {
        id: "text-" + Date.now(),
        type: "text",
        x: activeText.x,
        y: activeText.y,
        text: activeText.text,
        strokeColor,
        fontSize: 22,
      };
      const updated = [...elements, textEl];
      setElements(updated);
      saveCanvasState(updated);
    }
    setActiveText(null);
  };

  const handleTryShapePrompt = (shapeName) => {
    const centerX = 300 + Math.floor(Math.random() * 100);
    const centerY = 180 + Math.floor(Math.random() * 100);
    const demoShape = {
      id: "demo-" + Date.now(),
      type: shapeName,
      x: centerX,
      y: centerY,
      width: 130,
      height: 110,
      strokeColor,
      fillColor: "transparent",
      strokeWidth: strokeValue,
    };
    const updated = [...elements, demoShape];
    setElements(updated);
    saveCanvasState(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      {/* Quick Guide Banner matching Canvas Width */}
      <AiInfoPanel onTryShape={handleTryShapePrompt} AiFeature={AiFeature} setAiFeature={setAiFeature} />

      <div
        style={{
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
          border: "1px solid #e2e8f0",
          background: "#ffffff",
          width: "100%",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            cursor: cursorStyle,
            display: "block",
            width: "100%",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />

        {/* Temporary Canvas for ML stroke processing */}
        <canvas ref={tempCanvasRef} style={{ display: "none" }} />

        {/* Active Text Input overlay */}
        {activeText && (
          <input
            ref={textInputRef}
            type="text"
            value={activeText.text}
            onChange={(e) => setActiveText({ ...activeText, text: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTextSubmit();
            }}
            onBlur={handleTextSubmit}
            placeholder="Type text here..."
            style={{
              position: "absolute",
              left: `${activeText.x}px`,
              top: `${activeText.y}px`,
              border: "2px solid rgba(134, 6, 212, 1)",
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "20px",
              fontFamily: "'Inter', sans-serif",
              background: "#ffffff",
              color: strokeColor || "#0f172a",
              outline: "none",
              boxShadow: "0 4px 12px rgba(134, 6, 212, 0.2)",
              zIndex: 30,
            }}
          />
        )}

        {/* Multiplayer User Cursors overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 20,
            width: "100%",
            height: "100%",
          }}
        >
          {users &&
            users.map((u) => (
              <div
                key={u.username}
                style={{
                  position: "absolute",
                  left: `${u.x || 0}px`,
                  top: `${u.y || 0}px`,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.1s ease",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#ec4899",
                    border: "2px solid #fff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}
                />
                <span
                  style={{
                    background: "#0f172a",
                    color: "#fff",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    padding: "2px 6px",
                    borderRadius: "8px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {u.username}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FreehandCanvas;
