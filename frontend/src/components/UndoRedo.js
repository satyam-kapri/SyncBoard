const handleUndo = async (
  canvasRef,
  setRedoStack,
  canvasHistory,
  setCanvasHistory,
  restoreCanvasState
) => {
  if (canvasHistory.length > 1) {
    const newHistory = [...canvasHistory];
    const lastState = newHistory.pop(); // Remove last state

    setRedoStack((prevRedo) => [lastState, ...prevRedo]); // Save last state in redo stack
    setCanvasHistory(newHistory); // Update history

    const ctx = canvasRef.current.getContext("2d");
    await restoreCanvasState(ctx, newHistory[newHistory.length - 1]);
  }
};

const handleRedo = async (
  canvasRef,
  redoStack,
  setRedoStack,
  setCanvasHistory,
  restoreCanvasState
) => {
  if (redoStack.length > 0) {
    const newRedoStack = [...redoStack];
    const redoState = newRedoStack.shift(); // Get latest redo state

    setCanvasHistory((prevHistory) => [...prevHistory, redoState]); // Save in history
    setRedoStack(newRedoStack); // Update redo stack

    const ctx = canvasRef.current.getContext("2d");
    await restoreCanvasState(ctx, redoState);
  }
};
export { handleRedo, handleUndo };
