import useGameState from "./hooks/useGameState";
import Onboarding from "./components/Onboarding";
import TopBar from "./components/TopBar";
import Toolbar from "./components/Toolbar";
import GameCanvas from "./components/GameCanvas";
import InfoPanel from "./components/InfoPanel";
import Toasts from "./components/Toasts";

export default function App() {
  const gameState = useGameState();
  const { phase, toasts, tool, setTool, startGame } = gameState;

  if (phase === "intro") {
    return <Onboarding onStart={startGame} />;
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#050a05",
        fontFamily: "'Press Start 2P', monospace",
      }}
    >
      {/* Top HUD */}
      <TopBar gameState={gameState} />

      {/* Middle: Toolbar + Canvas */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Toolbar tool={tool} setTool={setTool} />
        <GameCanvas gameState={gameState} />
      </div>

      {/* Bottom Info Panel */}
      <InfoPanel gameState={gameState} />

      {/* Toast notifications */}
      <Toasts toasts={toasts} />
    </div>
  );
}
