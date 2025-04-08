import LeftHeader from "./components/LeftHeader";
import RightHeader from "./components/RightHeader";
import LeftBody from "./components/LeftBody";
import RightBody from "./components/RightBody";
import "./App.css";
import FreehandCanvas from "./components/Canvas";
import { useState } from "react";
import VoiceToShape from "./components/VoiceToShape";
import Socket from "./components/socket";
import { useSocket } from "./context/socketcontext";

function App() {
  const [selectedTool, setSelectedTool] = useState("");
  const [strokeValue, setStrokeValue] = useState(2);
  const [AiFeature, setAiFeature] = useState(false);
  const { joined } = useSocket();

  return (
    <>
      {!joined ? (
        <Socket />
      ) : (
        <div>
          <div id="header">
            <LeftHeader />
            <RightHeader />
          </div>

          <div id="body">
            <LeftBody
              selectedTool={selectedTool}
              setSelectedTool={setSelectedTool}
              setStrokeValue={setStrokeValue}
              strokeValue={strokeValue}
              AiFeature={AiFeature}
              setAiFeature={setAiFeature}
            />
            <div className="middle-body">
              <FreehandCanvas
                tool={selectedTool}
                strokeValue={strokeValue}
                AiFeature={AiFeature}
              />
              <VoiceToShape />
            </div>
            <RightBody />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
