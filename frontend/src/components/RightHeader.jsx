import React from "react";
import "../CSS/RightHeader.css";
import undoimg from "../assets/Undo.svg";
import shareicon from "../assets/Share.svg";
import usersicon from "../assets/Users.svg";
import profileicon from "../assets/image.png";
import { handleRedo, handleUndo } from "./UndoRedo";
import { useCanvas } from "../context/canvas";
function RightHeader() {
  const {
    canvasRef,
    redoStack,
    setRedoStack,
    canvasHistory,
    setCanvasHistory,
    restoreCanvasState,
  } = useCanvas();
  return (
    <div id="right-header">
      <div className="undo-outer">
        <img
          src={undoimg}
          className="undo"
          onClick={() =>
            handleUndo(
              canvasRef,
              setRedoStack,
              canvasHistory,
              setCanvasHistory,
              restoreCanvasState
            )
          }
        ></img>
        <img
          src={undoimg}
          className="redo"
          onClick={() =>
            handleRedo(
              canvasRef,
              redoStack,
              setRedoStack,
              setCanvasHistory,
              restoreCanvasState
            )
          }
        ></img>
      </div>
      <div className="top-right-icons">
        <div className="users-icon">
          <img src={usersicon} style={{ height: "30px", weight: "30px" }}></img>
          <div>2</div>
        </div>
        <button className="sharebtn">
          <img src={shareicon} style={{ height: "20px", width: "20px" }}></img>
          Share
        </button>
        <img src={profileicon} style={{ height: "50px", weight: "50px" }}></img>
      </div>
    </div>
  );
}

export default RightHeader;

// shift+alt+down =>copy current to next line
// ctrl +shift+l => select all similar text
