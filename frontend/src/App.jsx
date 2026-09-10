import React from "react";
import LeftHeader from "./components/LeftHeader";
import RightHeader from "./components/RightHeader";
import LeftBody from "./components/LeftBody";
import RightBody from "./components/RightBody";
import FreehandCanvas from "./components/Canvas";
import VoiceToShape from "./components/VoiceToShape";
import Socket from "./components/socket";
import { useSocket } from "./context/socketcontext";
import "./App.css";

function App() {
  const { joined } = useSocket();

  return (
    <div className="app-main-wrapper">
      {!joined ? (
        <Socket />
      ) : (
        <div className="workspace-container">
          {/* Top Bar Navigation Header */}
          <header id="header">
            <LeftHeader />
            <div className="header-right-group">
              <VoiceToShape />
              <RightHeader />
            </div>
          </header>

          {/* Main Whiteboard Workspace Body */}
          <main id="body">
            <LeftBody />
            <div className="middle-body">
              <FreehandCanvas />
            </div>
            <RightBody />
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
