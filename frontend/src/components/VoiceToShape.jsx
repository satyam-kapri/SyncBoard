import React, { useRef, useState } from "react";
import { useCanvas } from "../context/canvas";
import axios from "axios";
import { ML_API_URL } from "../config";

const VoiceToShape = () => {
  const { elements, setElements, saveCanvasState, strokeColor, strokeValue } = useCanvas();
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const startListening = () => {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => {
        setListening(true);
        setStatusMsg("Listening... Speak a shape name");
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        console.log("Speech heard:", transcript);
        setStatusMsg(`Heard: "${transcript}"`);
        handleSubmit(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setStatusMsg("Speech error. Click to retry.");
        setListening(false);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.warn("Speech recognition already running", err);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("Error stopping recognition:", err);
      }
    }
    setListening(false);
    setStatusMsg("Stopped recording.");
    setTimeout(() => setStatusMsg(""), 2000);
  };

  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSubmit = async (text) => {
    try {
      const response = await axios.post(`${ML_API_URL}/extract-shape`, { text });
      const shapeData = response.data;
      if (shapeData && shapeData.shape) {
        addVoiceShape(shapeData);
        setStatusMsg(`Created ${shapeData.shape}`);
      } else {
        setStatusMsg("Could not detect shape in speech");
      }
    } catch (error) {
      console.error("Error in extract-shape ML call:", error);
      parseVoiceLocal(text);
    }
  };

  const parseVoiceLocal = (text) => {
    const txt = text.toLowerCase();
    let shapeType = "circle";
    if (txt.includes("triangle")) shapeType = "triangle";
    else if (txt.includes("rectangle") || txt.includes("box")) shapeType = "rectangle";
    else if (txt.includes("square")) shapeType = "rectangle";
    else if (txt.includes("line")) shapeType = "line";

    addVoiceShape({ shape: shapeType, width: 140, height: 100, radius: 60, side: 100 });
    setStatusMsg(`Created ${shapeType}`);
  };

  const addVoiceShape = (shapeData) => {
    const { shape } = shapeData;
    const centerX = 350 + Math.floor(Math.random() * 80);
    const centerY = 200 + Math.floor(Math.random() * 80);

    let w = shapeData.width || shapeData.side || shapeData.radius * 2 || 120;
    let h = shapeData.height || shapeData.side || shapeData.radius * 2 || 120;
    if (shape === "circle") {
      const r = shapeData.radius || 60;
      w = r * 2;
      h = r * 2;
    }

    const newEl = {
      id: "voice-" + Date.now(),
      type: shape === "square" ? "rectangle" : shape,
      x: centerX,
      y: centerY,
      width: w,
      height: h,
      strokeColor: strokeColor || "rgba(134, 6, 212, 1)",
      fillColor: "transparent",
      strokeWidth: strokeValue || 3,
    };

    const updated = [...elements, newEl];
    setElements(updated);
    saveCanvasState(updated);
  };

  return (
    <div className="dedicated-voice-bar">
      {/* Primary Voice Action Button */}
      <button
        onClick={toggleListening}
        className={`voice-bar-btn ${listening ? "recording" : ""}`}
        title={listening ? "Click to Stop Recording" : "Voice AI: Click & speak e.g. 'Draw a circle'"}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
        <span>{listening ? "Recording..." : "Voice Control"}</span>
      </button>

      {/* Explicit Stop Recording Button when listening */}
      {listening && (
        <button onClick={stopListening} className="voice-stop-btn" title="Stop Recording">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="2" />
          </svg>
          Stop
        </button>
      )}

      {/* Live Speech Feedback Text */}
      {statusMsg && (
        <span className="voice-bar-status">
          {statusMsg}
        </span>
      )}
    </div>
  );
};

export default VoiceToShape;
