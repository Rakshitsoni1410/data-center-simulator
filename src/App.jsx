import { useState } from "react";
import Onboarding from "./components/Onboarding";
import GameCanvas from "./components/GameCanvas";
import useGameState from "./hooks/useGameState";

export default function App() {
  const game = useGameState();

  const [started, setStarted] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [character, setCharacter] = useState("");

  const startGame = (name, selectedCharacter) => {
    setCompanyName(name);
    setCharacter(selectedCharacter);
    setStarted(true);
  };

  if (!started) {
    return (
      <Onboarding
        startGame={startGame}
      />
    );
  }

  return (
    <div className="app">
      {/* Top HUD */}
      <header className="top-bar">
        <div className="company-info">
          <h2>{companyName}</h2>
          <p>{character === "boy" ? "👦 CEO" : "👧 CEO"}</p>
        </div>

        <div className="stats">
          <div>💰 ${game.money}</div>
          <div>⚡ {game.power}%</div>
          <div>🔥 {game.heat}%</div>
          <div>⭐ Level {game.level}</div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="game-layout">

        {/* Left Build Menu */}
        <aside className="sidebar">
          <h3>Build Menu</h3>

          <button
            onClick={() => game.build("server")}
          >
            🖥 Server Rack
          </button>

          <button
            onClick={() => game.build("gpu")}
          >
            🚀 GPU Cluster
          </button>

          <button
            onClick={() => game.build("cooling")}
          >
            ❄ Cooling Unit
          </button>

          <button
            onClick={() => game.build("switch")}
          >
            🌐 Network Switch
          </button>

          <button
            onClick={() => game.build("storage")}
          >
            💾 Storage Array
          </button>
        </aside>

        {/* Game Area */}
        <main className="game-area">
          <GameCanvas
            buildings={game.buildings}
            heat={game.heat}
          />
        </main>

        {/* Right Panel */}
        <aside className="right-panel">
          <h3>Contracts</h3>

          {game.contracts.map((contract) => (
            <div className="contract-card" key={contract.id}>
              <h4>{contract.name}</h4>
              <p>Reward: ${contract.reward}</p>
            </div>
          ))}

          <h3>Events</h3>

          {game.events.map((event, index) => (
            <div className="event-card" key={index}>
              {event}
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}