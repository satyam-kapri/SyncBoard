import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { CanvasProvider } from "./context/canvas.jsx";
import { SocketProvider } from "./context/socketcontext.jsx";

createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <CanvasProvider>
      <App />
    </CanvasProvider>
  </SocketProvider>
);
