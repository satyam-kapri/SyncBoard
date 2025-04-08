import { createContext, useContext, useRef, useState } from "react";
import { useSocket } from "./socketcontext";

const CanvasContext = createContext();

export const CanvasProvider = ({ children }) => {
  const canvasRef = useRef(null); // Main canvas
  const tempCanvasRef = useRef(null); // Temporary canvas for the latest stroke
  const points = useRef([]); // Store points for freehand drawing

  const [latestStroke, setLatestStroke] = useState(null);
  const [strokeBounds, setStrokeBounds] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shape, setShape] = useState("none");
  const [redoStack, setRedoStack] = useState([]);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const { sendSnap } = useSocket();
  // Track bounding box
  const strokeBoundsRef = useRef({
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  });
  const saveCanvasState = () => {
    const mainCanvas = canvasRef.current;
    const dataURL = mainCanvas.toDataURL("image/png");
    // setCanvasHistory((prevHistory) => [...prevHistory, dataURL]);
    setCanvasHistory((prevHistory) => {
      // If it's the first shape, save the initial blank canvas state
      if (prevHistory.length === 0) {
        const blankCanvas = document.createElement("canvas");
        blankCanvas.width = mainCanvas.width;
        blankCanvas.height = mainCanvas.height;
        const blankCtx = blankCanvas.getContext("2d");
        const blankDataURL = blankCanvas.toDataURL("image/png");

        return [blankDataURL, dataURL]; // Store initial blank state + first shape
      }

      return [...prevHistory, dataURL];
    });
    sendSnap(dataURL);
  };

  const restoreCanvasState = async (ctx, imageSrc) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); // Clear canvas
        ctx.drawImage(image, 0, 0); // Redraw canvas from snapshot
        resolve(imageSrc);
      };
      image.onerror = (error) => {
        console.error("Failed to load image", error);
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
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

// Custom hook to use CanvasContext
export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
};
