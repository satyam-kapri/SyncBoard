import { createContext, useContext, useRef, useState } from "react";
import { useSocket } from "./socketcontext";

const CanvasContext = createContext();

export const CanvasProvider = ({ children }) => {
  const canvasRef = useRef(null); // Main canvas
  const tempCanvasRef = useRef(null); // Temporary canvas for latest stroke
  const points = useRef([]); // Points for active freehand drawing

  // Tools & Properties
  const [selectedTool, setSelectedTool] = useState("pen"); // pen, eraser, select, rectangle, circle, triangle, line, arrow, text
  const [strokeColor, setStrokeColor] = useState("rgba(134, 6, 212, 1)");
  const [fillColor, setFillColor] = useState("transparent");
  const [strokeValue, setStrokeValue] = useState(3);
  const [AiFeature, setAiFeature] = useState(true);
  const [gridStyle, setGridStyle] = useState("dots");

  // Object-based elements for rich whiteboard interactivity
  const [elements, setElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);

  // History for Undo / Redo
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Bounding box refs & states for ML identification
  const [latestStroke, setLatestStroke] = useState(null);
  const [strokeBounds, setStrokeBounds] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shape, setShape] = useState("none");

  const { sendSnap } = useSocket();

  const strokeBoundsRef = useRef({
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  });

  const saveCanvasState = (newElements) => {
    const currentElements = newElements !== undefined ? newElements : elements;
    const strState = JSON.stringify(currentElements);
    setCanvasHistory((prev) => [...prev, strState]);
    setRedoStack([]);

    // Sync snapshot image over socket
    if (canvasRef.current) {
      try {
        const dataURL = canvasRef.current.toDataURL("image/png");
        sendSnap(0, 0, dataURL);
      } catch (err) {
        console.error("Snap export error:", err);
      }
    }
  };

  const undo = () => {
    if (canvasHistory.length === 0) return;
    const newHistory = [...canvasHistory];
    const currentState = newHistory.pop();

    const previousStateStr = newHistory.length > 0 ? newHistory[newHistory.length - 1] : "[]";
    let previousElements = [];
    try {
      previousElements = JSON.parse(previousStateStr);
    } catch (e) {
      previousElements = [];
    }

    setRedoStack((prev) => [currentState, ...prev]);
    setCanvasHistory(newHistory);
    setElements(previousElements);
    setSelectedElementId(null);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const newRedoStack = [...redoStack];
    const nextStateStr = newRedoStack.shift();
    let nextElements = [];
    try {
      nextElements = JSON.parse(nextStateStr);
    } catch (e) {
      nextElements = [];
    }

    setCanvasHistory((prev) => [...prev, nextStateStr]);
    setRedoStack(newRedoStack);
    setElements(nextElements);
    setSelectedElementId(null);
  };

  const clearCanvas = () => {
    saveCanvasState([]);
    setElements([]);
    setSelectedElementId(null);
  };

  const restoreCanvasState = async (ctx, imageSrc) => {
    return new Promise((resolve, reject) => {
      if (!imageSrc) return resolve(null);
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(image, 0, 0);
        resolve(imageSrc);
      };
      image.onerror = (error) => {
        reject(error);
      };
    });
  };

  return (
    <CanvasContext.Provider
      value={{
        canvasRef,
        tempCanvasRef,
        points,
        selectedTool,
        setSelectedTool,
        strokeColor,
        setStrokeColor,
        fillColor,
        setFillColor,
        strokeValue,
        setStrokeValue,
        AiFeature,
        setAiFeature,
        gridStyle,
        setGridStyle,
        elements,
        setElements,
        selectedElementId,
        setSelectedElementId,
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
        clearCanvas,
        undo,
        redo,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
};
