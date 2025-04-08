import axios from "axios";
import { useCanvas } from "../context/canvas";
import { useState, useRef, useEffect } from "react";
import { useSocket } from "../context/socketcontext";
const FreehandCanvas = ({ tool, strokeValue, AiFeature }) => {
  const {
    canvasRef,
    tempCanvasRef,
    points,
    latestStroke,
    setLatestStroke,
    strokeBounds,
    setStrokeBounds,
    isDrawing,
    setIsDrawing,
    shape,
    setShape,
    redoStack,
    setRedoStack,
    canvasHistory,
    setCanvasHistory,
    strokeBoundsRef,
    saveCanvasState,
    restoreCanvasState,
  } = useCanvas();

  const inputRef = useRef(null);
  const [texts, setTexts] = useState([]); // Store all texts
  const [activeText, setActiveText] = useState(null); // Track active input
  const { Snap, sendSnap, users } = useSocket();
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    restoreCanvasState(ctx, Snap);
  }, [Snap]);
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    const handleResize = (e) => {
      ctx.canvas.height = window.innerHeight;
      ctx.canvas.width = window.innerWidth - 500;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Handle clicking on canvas to add text
  const handleCanvasClick = (event) => {
    if (tool !== "text") return;
    if (activeText) return; // Prevent multiple input boxes

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left + 150;
    const y = event.clientY - rect.top + 80;

    setActiveText({ x, y, text: "" });

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus(); // Auto-focus input
      }
    }, 0);
  };

  // Handle text input
  const handleTextChange = (event) => {
    setActiveText((prev) => ({ ...prev, text: event.target.value }));
  };

  // Save text to canvas on Enter
  const handleTextSubmit = (event) => {
    if (
      (event.type === "keydown" && event.key === "Enter") ||
      event.type === "blur"
    ) {
      if (activeText?.text.trim() !== "") {
        setTexts((prev) => [...prev, activeText]); // Save text
      }
      saveCanvasState();
      setActiveText(null); // Hide input box
    }
  };

  const handleMouseDown = (e) => {
    if (tool !== "pen" && tool !== "eraser") return;

    setIsDrawing(true);

    const tempCanvas = tempCanvasRef.current;
    const tempCtx = tempCanvas.getContext("2d");

    const mainCanvas = canvasRef.current;
    mainCanvas.getContext("2d");

    // Clear the temporary canvas for a new stroke
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Reset stroke bounds
    strokeBoundsRef.current = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    };

    // Begin paths on both canvases
    // tempCtx.beginPath();
    // mainCtx.beginPath();

    const { offsetX, offsetY } = e.nativeEvent;
    points.current = [{ x: offsetX, y: offsetY }]; // S
    // tempCtx.moveTo(offsetX, offsetY);
    // mainCtx.moveTo(offsetX, offsetY);

    // Initialize bounds
    strokeBoundsRef.current.minX = offsetX;
    strokeBoundsRef.current.minY = offsetY;
    strokeBoundsRef.current.maxX = offsetX;
    strokeBoundsRef.current.maxY = offsetY;
  };

  const handleMouseMove = (e) => {
    if (tool !== "pen" && tool !== "eraser") return;
    if (!isDrawing) return;

    const tempCanvas = tempCanvasRef.current;
    const tempCtx = tempCanvas.getContext("2d");

    const mainCanvas = canvasRef.current;
    const mainCtx = mainCanvas.getContext("2d");

    const { offsetX, offsetY } = e.nativeEvent;
    const newPoint = { x: offsetX, y: offsetY };
    points.current.push(newPoint);

    // Draw only the last segment smoothly
    if (points.current.length >= 5) {
      const [prevPoint, currentPoint, nextPoint] = points.current.slice(-5);
      // Draw the stroke on both canvases
      mainCtx.beginPath();
      mainCtx.moveTo(prevPoint.x, prevPoint.y);
      tempCtx.beginPath();
      tempCtx.moveTo(prevPoint.x, prevPoint.y);

      // Use quadratic curve for smoothness
      const controlX = (currentPoint.x + prevPoint.x) / 2;
      const controlY = (currentPoint.y + prevPoint.y) / 2;

      mainCtx.quadraticCurveTo(prevPoint.x, prevPoint.y, controlX, controlY);
      mainCtx.lineTo(nextPoint.x, nextPoint.y);
      tempCtx.quadraticCurveTo(prevPoint.x, prevPoint.y, controlX, controlY);
      tempCtx.lineTo(nextPoint.x, nextPoint.y);

      // tempCtx.lineTo(offsetX, offsetY);
      // mainCtx.lineTo(offsetX, offsetY);

      // Styling for both canvases
      if (tool === "eraser") {
        tempCtx.globalCompositeOperation = "destination-out";
        mainCtx.globalCompositeOperation = "destination-out";
        tempCtx.lineWidth = strokeValue;
        mainCtx.lineWidth = strokeValue;
      } else {
        tempCtx.globalCompositeOperation = "source-over";
        mainCtx.globalCompositeOperation = "source-over";
        tempCtx.strokeStyle = "black";
        mainCtx.strokeStyle = "black";
        tempCtx.lineWidth = strokeValue;
        mainCtx.lineWidth = strokeValue;
      }

      tempCtx.lineCap = "round";
      mainCtx.lineCap = "round";

      tempCtx.stroke();
      mainCtx.stroke();
      tempCtx.closePath();
      mainCtx.closePath();
      sendSnap(prevPoint.x, prevPoint.y, mainCanvas.toDataURL("image/png"));
    }
    // Update stroke bounds
    strokeBoundsRef.current.minX = Math.min(
      strokeBoundsRef.current.minX,
      offsetX
    );
    strokeBoundsRef.current.minY = Math.min(
      strokeBoundsRef.current.minY,
      offsetY
    );
    strokeBoundsRef.current.maxX = Math.max(
      strokeBoundsRef.current.maxX,
      offsetX
    );
    strokeBoundsRef.current.maxY = Math.max(
      strokeBoundsRef.current.maxY,
      offsetY
    );
  };

  const handleMouseUp = () => {
    if (tool !== "pen" && tool !== "eraser") return;
    setIsDrawing(false);
    if (tool === "eraser") {
      saveCanvasState();
      console.log("saved");
      return;
    }
    if (AiFeature === false) {
      saveCanvasState();
      return;
    }
    const tempCanvas = tempCanvasRef.current;
    const tempCtx = tempCanvas.getContext("2d");

    const { minX, minY, maxX, maxY } = strokeBoundsRef.current;

    const width = maxX - minX + 50;
    const height = maxY - minY + 50;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = width;
    exportCanvas.height = height;

    const exportCtx = exportCanvas.getContext("2d");

    exportCtx.fillStyle = "white";
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    exportCtx.drawImage(
      tempCanvas,
      minX - 20,
      minY - 20,
      width,
      height,
      0,
      0,
      width,
      height
    );

    const dataURL = exportCanvas.toDataURL("image/png");
    setLatestStroke(dataURL);

    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    setStrokeBounds({ x: minX, y: minY, width, height });

    const mainCanvas = canvasRef.current;
    mainCanvas.getContext("2d");

    identifyShape(dataURL, minX, minY, width, height);
  };

  const replaceShape = async (shp, minX, minY, width, height) => {
    const mainCanvas = canvasRef.current;
    const mainCtx = mainCanvas.getContext("2d");

    if (canvasHistory.length === 0) {
      mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    } else {
      await restoreCanvasState(
        mainCtx,
        canvasHistory[canvasHistory.length - 1]
      );
    }

    if (shp === "ellipse") {
      const radius = Math.min(width - 50, height - 50) / 2; // Fit within bounding box
      mainCtx.beginPath();

      mainCtx.arc(
        minX + (width - 50) / 2,
        minY + (height - 50) / 2,
        radius,
        0,
        Math.PI * 2
      );
      mainCtx.closePath();
      mainCtx.stroke();
    } else if (shp === "triangle") {
      mainCtx.beginPath();
      mainCtx.moveTo(minX + (width - 50) / 2, minY); // Top vertex
      mainCtx.lineTo(minX, minY + height - 50); // Bottom-left vertex
      mainCtx.lineTo(minX + width - 50, minY + height - 50); // Bottom-right vertex
      mainCtx.closePath();
      mainCtx.stroke();
    } else if (shp === "rectangle" || shp === "square") {
      mainCtx.strokeRect(minX, minY, width - 50, height - 50);
    }

    saveCanvasState();
  };
  const identifyShape = async (image, minX, minY, width, height) => {
    try {
      // Convert base64 image to Blob
      const blob = await (await fetch(image)).blob();
      const formData = new FormData();
      formData.append("image", blob, "latest_stroke.png");

      // Axios POST request
      const response = await axios.post(
        "http://127.0.0.1:5000/predict",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Image uploaded successfully:", response.data);
      setShape(response.data.shape);
      if (response.data.shape !== "other") {
        replaceShape(response.data.shape, minX, minY, width, height);
      } else {
        saveCanvasState();
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      saveCanvasState();
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <canvas
        width={1000}
        height={600}
        ref={canvasRef}
        style={{
          cursor: "crosshair",
        }}
        onMouseDown={(e) => {
          if (tool === "text") handleCanvasClick(e);
          else handleMouseDown(e);
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      {/* Hidden temporary canvas for the latest stroke */}
      <canvas
        ref={tempCanvasRef}
        width={1400}
        height={600}
        style={{ display: "none" }}
      />
      {activeText && (
        <input
          ref={inputRef}
          type="text"
          value={activeText.text}
          onChange={handleTextChange}
          onKeyDown={handleTextSubmit}
          onBlur={handleTextSubmit}
          style={{
            position: "absolute",
            left: `${activeText.x}px`,
            top: `${activeText.y}px`,
            border: "2px solid rgb(134, 6, 212)",
            padding: "10px",
            fontSize: "16px",
            background: "transparent",
            color: "black",
            outline: "none",
          }}
        />
      )}

      {texts.map((txt, index) => (
        <span
          key={index}
          style={{
            position: "absolute",
            left: `${txt.x}px`,
            top: `${txt.y}px`,
            fontSize: "16px",
            cursor: "move",
          }}
          draggable
          onDragStart={(e) => e.dataTransfer.setData("text/plain", index)}
          onDrop={(e) => {
            e.preventDefault();
            const index = e.dataTransfer.getData("text/plain");
            const rect = canvasRef.current.getBoundingClientRect();
            setTexts((prev) =>
              prev.map((t, i) =>
                i == index
                  ? { ...t, x: e.clientX - rect.left, y: e.clientY - rect.top }
                  : t
              )
            );
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          {txt.text}
        </span>
      ))}

      {/* User cursors layer */}
      <div
        // ref={cursorsRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 2,
          width: "100%",
          height: "100%",
        }}
      >
        {users.map((user, index) => (
          <div
            key={user.id}
            style={{
              position: "absolute",
              left: `${user.x}px`,
              top: `${user.y}px`,
              transform: "translate(150px, 150px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "red",
                marginBottom: "4px",
              }}
            />
            <div
              style={{
                background: "rgba(255,255,255,0.7)",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "12px",
                whiteSpace: "nowrap",
              }}
            >
              {user.username}
            </div>
          </div>
        ))}
      </div>
      {/* {latestStroke && (
        <div style={{ marginTop: "20px" }}>
          <h3>Latest Stroke:</h3>
          <img
            src={latestStroke}
            alt="Latest Stroke"
            style={{ border: "1px solid black" }}
          />
          {strokeBounds && (
            <p>
              <strong>Coordinates:</strong> (x: {strokeBounds.x}, y:{" "}
              {strokeBounds.y})
              <br />
              <strong>Width:</strong> {strokeBounds.width}px
              <br />
              <strong>Height:</strong> {strokeBounds.height}px
              <br />
              {shape && <span>{shape}</span>}
            </p>
          )}
        </div>
      )} */}
    </div>
  );
};

export default FreehandCanvas;
