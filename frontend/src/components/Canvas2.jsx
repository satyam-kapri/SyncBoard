import React, { useState, useRef, useEffect } from "react";

const Canvas = () => {
  const canvasRef = useRef(null);
  const [shapes, setShapes] = useState([]);
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState(null);

  useEffect(() => {
    drawAllShapes();
  }, [shapes]);

  const drawAllShapes = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((shape, index) => {
      ctx.beginPath();
      ctx.strokeStyle = index === selectedShapeIndex ? "red" : "black";
      ctx.lineWidth = index === selectedShapeIndex ? 2 : 1;

      if (shape.type === "rect") {
        ctx.rect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        ctx.arc(
          shape.x + shape.width / 2,
          shape.y + shape.height / 2,
          shape.width / 2,
          0,
          Math.PI * 2
        );
      }
      ctx.stroke();

      // Draw resize handles if selected
      if (index === selectedShapeIndex) {
        ctx.fillStyle = "blue";
        ctx.fillRect(
          shape.x + shape.width - 5,
          shape.y + shape.height - 5,
          10,
          10
        ); // Bottom-right handle
      }
    });
  };

  const addShape = (type) => {
    setShapes([...shapes, { x: 100, y: 100, width: 80, height: 80, type }]);
  };

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    let found = false;

    shapes.forEach((shape, index) => {
      // Check if clicking on resize handle
      if (
        offsetX >= shape.x + shape.width - 5 &&
        offsetX <= shape.x + shape.width + 5 &&
        offsetY >= shape.y + shape.height - 5 &&
        offsetY <= shape.y + shape.height + 5
      ) {
        setResizeHandle(index);
        setIsResizing(true);
        found = true;
      }
      // Check if clicking inside shape
      else if (
        offsetX >= shape.x &&
        offsetX <= shape.x + shape.width &&
        offsetY >= shape.y &&
        offsetY <= shape.y + shape.height
      ) {
        setSelectedShapeIndex(index);
        setOffset({ x: offsetX - shape.x, y: offsetY - shape.y });
        setIsDragging(true);
        found = true;
      }
    });

    if (!found) setSelectedShapeIndex(null);
  };

  const handleMouseMove = (e) => {
    if (isDragging && selectedShapeIndex !== null) {
      const { offsetX, offsetY } = e.nativeEvent;
      const updatedShapes = [...shapes];
      updatedShapes[selectedShapeIndex].x = offsetX - offset.x;
      updatedShapes[selectedShapeIndex].y = offsetY - offset.y;
      setShapes(updatedShapes);
    } else if (isResizing && resizeHandle !== null) {
      const { offsetX, offsetY } = e.nativeEvent;
      const updatedShapes = [...shapes];
      updatedShapes[resizeHandle].width =
        offsetX - updatedShapes[resizeHandle].x;
      updatedShapes[resizeHandle].height =
        offsetY - updatedShapes[resizeHandle].y;
      setShapes(updatedShapes);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  const deleteShape = () => {
    if (selectedShapeIndex !== null) {
      setShapes(shapes.filter((_, index) => index !== selectedShapeIndex));
      setSelectedShapeIndex(null);
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        style={{
          border: "1px solid black",
          cursor: isResizing ? "nwse-resize" : "default",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div style={{ marginTop: "10px" }}>
        <button onClick={() => addShape("rect")}>Add Rectangle</button>
        <button onClick={() => addShape("circle")}>Add Circle</button>
        <button onClick={deleteShape}>Delete Shape</button>
      </div>
    </div>
  );
};

export default Canvas;
