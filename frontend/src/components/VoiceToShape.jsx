import React, { useRef, useState } from "react";
import { useCanvas } from "../context/canvas";
import voiceWave from "../assets/wave.gif";
import axios from "axios";
const VoiceToShape = () => {
  const { canvasRef } = useCanvas();
  const ctxRef = useRef(null);
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  const startListening = () => {
    if (!ctxRef.current) {
      ctxRef.current = canvasRef.current.getContext("2d");
    }
    if (!recognitionRef.current) {
      recognitionRef.current = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript =
          event.results[event.results.length - 1][0].transcript;
        console.log("Heard:", transcript);
        handleSubmit(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setListening(false); // Disable button if error occurs
      };

      recognitionRef.current.onend = () => {
        console.log("Speech recognition stopped.");
        setListening(false); // Automatically disable button
      };
    }

    recognitionRef.current.start();
    setListening(true);
  };

  const handleSubmit = async (text) => {
    const response = await axios.post("http://127.0.0.1:5000/extract-shape", {
      text: text,
    });
    console.log("ok");
    const shapeData = await response.data;
    console.log("yes", shapeData);
    drawShape(shapeData);
  };

  const drawShape = (shapeData) => {
    console.log(shapeData);
    if (!shapeData) return;

    const { shape } = shapeData;
    console.log(shape);
    let ctx = ctxRef.current;
    ctx.strokeStyle = "black";
    switch (shape) {
      case "line":
        ctx.beginPath();
        ctx.moveTo(300, 300);
        ctx.lineTo(50 + shapeData.length, 50);
        ctx.stroke();
        break;

      case "square":
        ctx.strokeRect(300, 300, shapeData.side, shapeData.side);
        break;

      case "rectangle":
        ctx.strokeRect(300, 300, shapeData.width, shapeData.height);
        break;

      case "circle":
        ctx.beginPath();
        ctx.arc(300, 300, shapeData.radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;

      case "hexagon":
        drawHexagon(ctx, 300, 300, shapeData.side);
        break;

      case "pentagon":
        drawPentagon(ctx, 300, 300, shapeData.side);
        break;

      case "parallelogram":
        drawParallelogram(ctx, 300, 300, shapeData.base, shapeData.height);
        break;

      default:
        console.log("Unsupported shape");
    }
  };

  const drawHexagon = (ctx, x, y, side) => {
    ctx.strokeStyle = "black";
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * 2 * Math.PI) / 6;
      ctx.lineTo(x + side * Math.cos(angle), y + side * Math.sin(angle));
    }
    ctx.closePath();
    ctx.stroke();
  };

  const drawPentagon = (ctx, x, y, side) => {
    ctx.strokeStyle = "black";
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5;
      ctx.lineTo(x + side * Math.cos(angle), y + side * Math.sin(angle));
    }
    ctx.closePath();
    ctx.stroke();
  };

  const drawParallelogram = (ctx, x, y, base, height) => {
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + base, y);
    ctx.lineTo(x + base + 20, y + height);
    ctx.lineTo(x + 20, y + height);
    ctx.closePath();
    ctx.stroke();
  };

  return (
    <div>
      {/* <h2>
            🎤 Click the button and say: "Draw a rectangle 200 by 100" or "Create a
            circle with radius 50"
        </h2> */}
      <button
        onClick={startListening}
        disabled={listening}
        style={{
          position: "fixed",
          bottom: 10,
          background: "white",
          color: "black",
          width: 70,
          height: 60,
          boxShadow: "5px 10px 26px 8px rgba(0, 0, 0, 0.11)",
          //   border: "2px dashed red",
        }}
      >
        {listening ? (
          <img src={voiceWave} width={30} height={30}></img>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 21 21"
          >
            <g
              fill="none"
              fill-rule="evenodd"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1"
            >
              <path d="m10.39 2.615l.11-.004a2.893 2.893 0 0 1 3 2.891V9.5a3 3 0 1 1-6 0V5.613a3 3 0 0 1 2.89-2.998" />
              <path d="M15.5 9.5a5 5 0 0 1-9.995.217L5.5 9.5m5 5v4" />
            </g>
          </svg>
        )}
      </button>
      <br />
    </div>
  );
};

export default VoiceToShape;
