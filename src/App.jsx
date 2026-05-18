import { useEffect, useState } from "react";
import StatsChart from "./components/StatsChart";
function ServerRack({ type }) {
  return (
    <div className="w-24 bg-gray-950 border border-gray-700 rounded-lg p-2 shadow-lg">
      <div className="text-center text-xs mb-2 text-white">
        {type === "basic" ? "Basic" : "Advanced"}
      </div>

      <div className="space-y-1">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`h-3 rounded ${
              type === "basic" ? "bg-green-500" : "bg-blue-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [chartData, setChartData] = useState([]);
  const [temperature, setTemperature] = useState(20);
  const [money, setMoney] = useState(1000);
  const [servers, setServers] = useState([]);
  const [cooling, setCooling] = useState(1);
  const [electricity, setElectricity] = useState(0);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);

  // Load save
  useEffect(() => {
    const save = localStorage.getItem("dc-save");

    if (save) {
      const data = JSON.parse(save);

      setTemperature(data.temperature);
      setMoney(data.money);
      setServers(data.servers);
      setCooling(data.cooling);
    }
  }, []);

  // Auto save
  useEffect(() => {
    localStorage.setItem(
      "dc-save",
      JSON.stringify({
        temperature,
        money,
        servers,
        cooling,
      }),
    );
  }, [temperature, money, servers, cooling]);

  // Add server
  const addServer = (type) => {
    const costs = {
      basic: 100,
      advanced: 300,
    };

    if (money >= costs[type]) {
      setServers((prev) => [...prev, type]);
      setMoney((prev) => prev - costs[type]);
    }
  };

  // Upgrade cooling
  const upgradeCooling = () => {
    if (money >= 200) {
      setCooling((prev) => prev + 1);
      setMoney((prev) => prev - 200);
    }
  };

  // Restart game
  const restartGame = () => {
    localStorage.removeItem("dc-save");
    window.location.reload();
  };

  // Main game loop
  useEffect(() => {
    const interval = setInterval(() => {
      let income = 0;
      let heat = 0;
      let power = 0;

      servers.forEach((server) => {
        if (server === "basic") {
          income += 10;
          heat += 2;
          power += 5;
        }

        if (server === "advanced") {
          income += 25;
          heat += 5;
          power += 12;
        }
      });

      // Electricity bill
      const electricBill = power * 0.5;

      setMoney((prev) => prev + income - electricBill);

      setElectricity(power);
      setChartData((prev) => [
        ...prev.slice(-9),
        {
          time: new Date().toLocaleTimeString(),
          temperature: Number(temperature.toFixed(1)),
          money: Number(money.toFixed(0)),
        },
      ]);
      // Cooling system
      setTemperature((prev) => {
        const newTemp = prev + heat * 0.2 - cooling * 2;

        if (newTemp >= 100) {
          setGameOver(true);
        }

        return Math.max(20, newTemp);
      });

      // Random failures
      if (Math.random() < 0.1 && servers.length > 0) {
        setMessage("⚠ Server Failure Detected!");
      } else {
        setMessage("");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [servers, cooling]);

  // Game Over Screen
  if (gameOver) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-red-500">
        <h1 className="text-5xl font-bold mb-4">DATA CENTER FAILED 💥</h1>

        <button
          onClick={restartGame}
          className="bg-red-600 px-6 py-3 rounded-lg text-white"
        >
          Restart Game
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <h1 className="text-4xl font-bold mb-6">Data Center Simulator</h1>

      {/* Alerts */}
      {message && (
        <div className="bg-red-500 p-3 rounded-lg mb-4">{message}</div>
      )}

      {/* Notifications */}
      <div className="bg-gray-800 p-4 rounded-xl mb-6">
        <h2 className="text-xl mb-2">Notifications</h2>

        <div className="space-y-2 text-sm">
          {temperature > 70 && (
            <p className="text-red-400">⚠ High temperature detected</p>
          )}

          {money < 200 && (
            <p className="text-yellow-400">⚠ Low funds available</p>
          )}

          {servers.length > 10 && (
            <p className="text-blue-400">🚀 Data center scaling rapidly</p>
          )}

          {servers.length === 0 && (
            <p className="text-gray-400">No active servers running</p>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Server Room */}
        <div className="col-span-2 bg-gray-800 p-6 rounded-xl">
          <h2 className="text-2xl mb-4">Server Room</h2>

          {/* Rack Area */}
          <div className="bg-black min-h-[350px] rounded-lg flex flex-wrap gap-4 p-4">
            {servers.map((server, index) => (
              <ServerRack key={index} type={server} />
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-4 mt-6 flex-wrap">
            <button
              onClick={() => addServer("basic")}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
            >
              Buy Basic Server ($100)
            </button>

            <button
              onClick={() => addServer("advanced")}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              Buy Advanced Server ($300)
            </button>

            <button
              onClick={upgradeCooling}
              className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg"
            >
              Upgrade Cooling ($200)
            </button>
          </div>
        </div>

        {/* Dashboard */}
        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-2xl mb-4">Dashboard</h2>

          <div className="space-y-5 text-lg">
            {/* Temperature */}
            <div>
              <p>🌡 Temperature: {temperature.toFixed(1)}°C</p>

              <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
                <div
                  className={`h-4 rounded-full transition-all duration-300 ${
                    temperature > 70
                      ? "bg-red-500"
                      : temperature > 40
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${temperature}%` }}
                />
              </div>
            </div>

            <p>💰 Money: ${money.toFixed(0)}</p>

            <p>🖥 Servers: {servers.length}</p>

            <p>⚡ Electricity Usage: {electricity}</p>

            <p>❄ Cooling Level: {cooling}</p>

            <p>🌐 Active Clients: {servers.length * 3}</p>

            <p>📈 Revenue/sec: ${servers.length * 10}</p>

            <p className="text-green-400">🟢 Status: Operational</p>
          </div>
        </div>
      </div>
      <StatsChart data={chartData} />
    </div>
  );
}
