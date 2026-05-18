import { useEffect, useMemo, useRef, useState } from "react";
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
  const [eventLog, setEventLog] = useState([]);
  const [clients, setClients] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [temperature, setTemperature] = useState(() => {
    const save = localStorage.getItem("dc-save");
    if (!save) return 20;
    try {
      const data = JSON.parse(save);
      return typeof data.temperature === "number" ? data.temperature : 20;
    } catch {
      return 20;
    }
  });
  const [money, setMoney] = useState(() => {
    const save = localStorage.getItem("dc-save");
    if (!save) return 1000;
    try {
      const data = JSON.parse(save);
      return typeof data.money === "number" ? data.money : 1000;
    } catch {
      return 1000;
    }
  });
  const [servers, setServers] = useState(() => {
    const save = localStorage.getItem("dc-save");
    if (!save) return [];
    try {
      const data = JSON.parse(save);
      return Array.isArray(data.servers) ? data.servers : [];
    } catch {
      return [];
    }
  });
  const [cooling, setCooling] = useState(() => {
    const save = localStorage.getItem("dc-save");
    if (!save) return 1;
    try {
      const data = JSON.parse(save);
      return typeof data.cooling === "number" ? data.cooling : 1;
    } catch {
      return 1;
    }
  });

  const [electricity, setElectricity] = useState(0);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);

  const temperatureRef = useRef(temperature);
  const moneyRef = useRef(money);
  const coolingRef = useRef(cooling);
  const serversRef = useRef(servers);
  const clientsRef = useRef(clients);

  useEffect(() => {
    temperatureRef.current = temperature;
  }, [temperature]);
  useEffect(() => {
    moneyRef.current = money;
  }, [money]);
  useEffect(() => {
    coolingRef.current = cooling;
  }, [cooling]);
  useEffect(() => {
    serversRef.current = servers;
  }, [servers]);
  useEffect(() => {
    clientsRef.current = clients;
  }, [clients]);

  const availableClients = useMemo(
    () => [
      { name: "StartupX", reward: 50, serversNeeded: 1 },
      { name: "StreamFlix", reward: 120, serversNeeded: 3 },
      { name: "GameHost Pro", reward: 250, serversNeeded: 5 },
    ],
    [],
  );

  // Auto save

  useEffect(() => {
    localStorage.setItem(
      "dc-save",
      JSON.stringify({ temperature, money, servers, cooling }),
    );
  }, [temperature, money, servers, cooling]);

  const addServer = (type) => {
    const costs = { basic: 100, advanced: 300 };
    if (!costs[type]) return;
    if (moneyRef.current < costs[type]) return;

    setServers((prev) => [...prev, type]);
    setMoney((prev) => prev - costs[type]);
  };

  const upgradeCooling = () => {
    const cost = 200;
    if (moneyRef.current < cost) return;

    setCooling((prev) => prev + 1);
    setMoney((prev) => prev - cost);
  };

  const acceptClient = (client) => {
    if (serversRef.current.length >= client.serversNeeded) {
      setClients((prev) => [...prev, client]);
      setMessage(`✅ Accepted ${client.name}`);
    } else {
      setMessage("❌ Not enough servers");
    }
  };

  const triggerRandomEvent = () => {
    const events = [
      {
        text: "⚡ Power outage increased temperature!",
        action: () => setTemperature((prev) => prev + 15),
      },
      {
        text: "💰 Investor funded your company!",
        action: () => setMoney((prev) => prev + 1000),
      },
      {
        text: "❄ Cooling system optimized!",
        action: () => setCooling((prev) => prev + 1),
      },
      {
        text: "💥 Hardware failure caused losses!",
        action: () => setMoney((prev) => prev - 500),
      },
      {
        text: "🛡 Cyber attack blocked successfully!",
        action: () => {},
      },
    ];

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    randomEvent.action();

    setEventLog((prev) => [
      {
        text: randomEvent.text,
        time: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 4),
    ]);

    setMessage(randomEvent.text);
  };

  const restartGame = () => {
    localStorage.removeItem("dc-save");
    window.location.reload();
  };

  // Main game loop (stable interval)
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      const currTemp = temperatureRef.current;
      const currMoney = moneyRef.current;
      const currCooling = coolingRef.current;
      const currServers = serversRef.current;
      const currClients = clientsRef.current;

      let income = 0;
      for (const client of currClients) income += client.reward;

      let heat = 0;
      let power = 0;

      for (const server of currServers) {
        if (server === "basic") {
          income += 10;
          heat += 2;
          power += 5;
        } else if (server === "advanced") {
          income += 25;
          heat += 5;
          power += 12;
        }
      }

      // Electricity bill
      const electricBill = power * 0.5;
      const nextMoneyRaw = currMoney + income - electricBill;
      const nextMoney = Number.isFinite(nextMoneyRaw) ? nextMoneyRaw : currMoney;

      const nextTempRaw = currTemp + heat * 0.2 - currCooling * 2;
      const nextTempClamped = Math.max(20, nextTempRaw);

      setElectricity(power);
      setMoney(nextMoney);
      setTemperature(nextTempClamped);

      setChartData((prev) => {
        const point = {
          time: new Date().toLocaleTimeString(),
          temperature: Number(nextTempClamped.toFixed(1)),
          money: Number(nextMoney.toFixed(0)),
        };
        return [...prev.slice(-9), point];
      });

      if (nextTempRaw >= 100) {
        setGameOver(true);
        setMessage("💥 DATA CENTER FAILED 💥");
        return;
      }

      // Random failures
      if (Math.random() < 0.05) {
        triggerRandomEvent();
      } else {
        setMessage("");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameOver]);

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
      {message && <div className="bg-red-500 p-3 rounded-lg mb-4">{message}</div>}

      {/* Notifications */}
      <div className="bg-gray-800 p-4 rounded-xl mb-6">
        <h2 className="text-xl mb-2">Notifications</h2>

        <div className="space-y-2 text-sm">
          {temperature > 70 && (
            <p className="text-red-400">⚠ High temperature detected</p>
          )}
          {money < 200 && <p className="text-yellow-400">⚠ Low funds available</p>}
          {servers.length > 10 && (
            <p className="text-blue-400">🚀 Data center scaling rapidly</p>
          )}
          {servers.length === 0 && (
            <p className="text-gray-400">No active servers running</p>
          )}
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-xl mb-6">
        <h2 className="text-xl mb-4">Event Log</h2>

        <div className="space-y-2">
          {eventLog.length === 0 && (
            <p className="text-gray-400">No recent events</p>
          )}

          {eventLog.map((event, index) => (
            <div key={index} className="bg-gray-700 p-3 rounded-lg">
              <p>{event.text}</p>
              <p className="text-xs text-gray-400 mt-1">{event.time}</p>
            </div>
          ))}
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

        <div className="bg-gray-800 p-6 rounded-xl mt-6">
          <h2 className="text-2xl mb-4">Hosting Clients</h2>

          <div className="space-y-3">
            {availableClients.map((client, index) => (
              <div
                key={index}
                className="bg-gray-700 p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-bold">{client.name}</p>
                  <p className="text-sm text-gray-300">
                    Requires {client.serversNeeded} servers
                  </p>
                  <p className="text-green-400">+${client.reward}/sec</p>
                </div>

                <button
                  onClick={() => acceptClient(client)}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
                >
                  Host
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard */}
        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-2xl mb-4">Dashboard</h2>

          <div className="space-y-5 text-lg">
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
            <p>🌐 Active Clients: {clients.length}</p>
            <p>📈 Revenue/sec: ${clients.reduce((sum, c) => sum + c.reward, 0)}</p>
            <p className="text-green-400">🟢 Status: Operational</p>
          </div>
        </div>
      </div>

      <StatsChart data={chartData} />
    </div>
  );
}

