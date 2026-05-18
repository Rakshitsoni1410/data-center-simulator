import { useEffect, useMemo, useRef, useState } from "react";
import StatsChart from "./components/StatsChart";

/* ---------------- SERVER RACK ---------------- */
function ServerRack({ server }) {
  return (
    <div
      className={`relative w-full min-h-[170px] rounded-xl p-3 border shadow-2xl transition-all duration-300 hover:scale-[1.03] ${
        server.level === 1
          ? "bg-green-700 shadow-green-500/40"
          : server.level === 2
            ? "bg-blue-700 shadow-blue-500/40"
            : "bg-purple-700 shadow-purple-500/40"
      }`}
    >
      {/* HEADER */}
      <div className="text-center font-bold text-white mb-2">
        Server L{server.level}
      </div>

      {/* SERVER BARS */}
      <div className="space-y-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-3 rounded ${
              server.level === 1
                ? "bg-green-400"
                : server.level === 2
                  ? "bg-blue-400"
                  : "bg-purple-400"
            }`}
          />
        ))}
      </div>

      {/* DATA FLOW */}
      <div className="mt-2 h-1 bg-gray-900 rounded overflow-hidden">
        <div className="h-full bg-cyan-400 animate-pulse w-3/4" />
      </div>

      {/* LEDS */}
      <div className="flex justify-center gap-1 mt-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
      </div>

      {/* FAN */}
      <div className="flex justify-center mt-2">
        <div className="w-4 h-4 border-2 border-gray-200 rounded-full animate-spin" />
      </div>

      {/* HEALTH */}
      <div className="mt-2 text-[10px] text-center text-white">
        ❤️ {server.health}%
      </div>
    </div>
  );
}

/* ---------------- MAIN APP ---------------- */
export default function App() {
  const [servers, setServers] = useState([]);
  const [money, setMoney] = useState(1000);
  const [temperature, setTemperature] = useState(20);
  const [cooling, setCooling] = useState(1);
  const [security, setSecurity] = useState(1);
  const [electricity, setElectricity] = useState(0);
  const [clients, setClients] = useState([]);
  const [message, setMessage] = useState("");
  const [eventLog, setEventLog] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  /* ---------------- REFS ---------------- */
  const serversRef = useRef(servers);
  const moneyRef = useRef(money);
  const tempRef = useRef(temperature);
  const coolingRef = useRef(cooling);
  const securityRef = useRef(security);
  const clientsRef = useRef(clients);

  useEffect(() => {
    serversRef.current = servers;
  }, [servers]);

  useEffect(() => {
    moneyRef.current = money;
  }, [money]);

  useEffect(() => {
    tempRef.current = temperature;
  }, [temperature]);

  useEffect(() => {
    coolingRef.current = cooling;
  }, [cooling]);

  useEffect(() => {
    securityRef.current = security;
  }, [security]);

  useEffect(() => {
    clientsRef.current = clients;
  }, [clients]);

  /* ---------------- SAVE SYSTEM ---------------- */
  useEffect(() => {
    localStorage.setItem(
      "dc-save",
      JSON.stringify({
        servers,
        money,
        temperature,
        cooling,
        security,
        clients,
      }),
    );
  }, [servers, money, temperature, cooling, security, clients]);

  /* ---------------- CLIENTS ---------------- */
  const availableClients = useMemo(
    () => [
      { name: "StartupX", reward: 50, serversNeeded: 1 },
      { name: "StreamFlix", reward: 120, serversNeeded: 3 },
      { name: "GameHost Pro", reward: 250, serversNeeded: 5 },
      { name: "CloudNet AI", reward: 400, serversNeeded: 6 },
      { name: "CyberVault", reward: 550, serversNeeded: 8 },
      { name: "Quantum Hosting", reward: 800, serversNeeded: 10 },
      { name: "MetaVerse Grid", reward: 1200, serversNeeded: 14 },
      { name: "Galaxy Compute", reward: 1800, serversNeeded: 18 },
      { name: "Titan Servers", reward: 2500, serversNeeded: 22 },
      { name: "Neural Cloud", reward: 3500, serversNeeded: 28 },
      { name: "Infinity Systems", reward: 5000, serversNeeded: 35 },
      { name: "HyperCore Labs", reward: 7000, serversNeeded: 42 },
    ],
    [],
  );

  /* ---------------- ADD SERVER ---------------- */
  const addServer = (level = 1) => {
    const costs = {
      1: 100,
      2: 500,
      3: 1200,
    };

    if (moneyRef.current < costs[level]) {
      setMessage("❌ Not enough money");
      return;
    }

    setServers((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        level,
        health: 100,
      },
    ]);

    setMoney((p) => p - costs[level]);

    setMessage(`✅ Level ${level} Server Purchased`);
  };

  /* ---------------- MERGE ---------------- */
  const mergeServers = () => {
    let arr = [...serversRef.current];

    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i].level === arr[j].level && arr[i].level < 3) {
          arr[i] = {
            ...arr[i],
            level: arr[i].level + 1,
            health: 100,
          };

          arr.splice(j, 1);

          setServers(arr);

          setMessage("🔗 Servers Merged Successfully!");
          return;
        }
      }
    }

    setMessage("⚠ No matching servers found");
  };

  /* ---------------- COOLING ---------------- */
  const upgradeCooling = () => {
    if (moneyRef.current < 300) return;

    setCooling((p) => p + 1);
    setMoney((p) => p - 300);

    setMessage("❄ Cooling Upgraded");
  };

  /* ---------------- SECURITY ---------------- */
  const upgradeSecurity = () => {
    if (moneyRef.current < 250) return;

    setSecurity((p) => p + 1);
    setMoney((p) => p - 250);

    setMessage("🛡 Security Upgraded");
  };

  /* ---------------- CLIENT HOST ---------------- */
  const acceptClient = (client) => {
    if (clientsRef.current.some((c) => c.name === client.name)) {
      setMessage("⚠ Client already hosted");
      return;
    }

    if (serversRef.current.length < client.serversNeeded) {
      setMessage("❌ Not enough servers");
      return;
    }

    setClients((prev) => [...prev, client]);

    setMessage(`✅ Hosting ${client.name}`);
  };

  /* ---------------- RANDOM EVENTS ---------------- */
  const triggerRandomEvent = () => {
    const events = [
      {
        text: "⚡ Power Surge Increased Heat!",
        action: () => setTemperature((p) => p + 10),
      },
      {
        text: "💰 Investor Funding Received!",
        action: () => setMoney((p) => p + 1000),
      },
      {
        text: "🛡 Security Patch Installed!",
        action: () => setSecurity((p) => p + 1),
      },
      {
        text: "❄ Cooling Optimized!",
        action: () => setCooling((p) => p + 1),
      },
      {
        text: "💥 Hardware Failure!",
        action: () =>
          setServers((prev) =>
            prev.map((s) => ({
              ...s,
              health: Math.max(20, s.health - 20),
            })),
          ),
      },
    ];

    const random = events[Math.floor(Math.random() * events.length)];

    random.action();

    setEventLog((prev) => [
      {
        text: random.text,
        time: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 7),
    ]);

    setMessage(random.text);
  };

  /* ---------------- GAME LOOP ---------------- */
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      const servers = serversRef.current;
      const money = moneyRef.current;
      const temp = tempRef.current;
      const cooling = coolingRef.current;
      const security = securityRef.current;
      const clients = clientsRef.current;

      const load = servers.reduce((sum, s) => sum + s.level, 0);

      let income = load * 15;
      let heat = load * 0.8;
      let power = load * 5;

      clients.forEach((c) => {
        income += c.reward;
      });

      /* CYBER ATTACK */
      if (Math.random() < 0.08) {
        const damage = Math.max(50 - security * 10, 5);

        setMoney((p) => p - damage);
        setTemperature((p) => p + 5);

        setMessage("⚠ Cyber Attack Detected!");
      }

      /* OVERLOAD */
      if (load > 15) {
        heat *= 1.4;
        setMessage("⚠ Servers Overloaded!");
      }

      /* ELECTRIC BILL */
      const bill = power * 0.5;

      const nextMoney = money + income - bill;

      const nextTemp = Math.max(20, temp + heat * 0.2 - cooling * 2);

      setMoney(nextMoney);
      setTemperature(nextTemp);
      setElectricity(power);

      /* SERVER DAMAGE */
      setServers((prev) =>
        prev.map((s) => ({
          ...s,
          health: Math.max(0, s.health - (nextTemp > 70 ? 2 : 0)),
        })),
      );

      /* CHART */
      setChartData((prev) => [
        ...prev.slice(-20),
        {
          time: new Date().toLocaleTimeString(),
          money: nextMoney,
          temperature: nextTemp,
        },
      ]);

      /* RANDOM EVENTS */
      if (Math.random() < 0.05) {
        triggerRandomEvent();
      }

      /* GAME OVER */
      if (nextTemp >= 100) {
        setGameOver(true);
        setMessage("💥 DATA CENTER FAILED 💥");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameOver]);

  /* ---------------- GAME OVER ---------------- */
  if (gameOver) {
    return (
      <div className="h-screen bg-black text-red-500 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl md:text-5xl font-bold mb-6 text-center">
          💥 DATA CENTER FAILED 💥
        </h1>

        <button
          onClick={() => {
            localStorage.removeItem("dc-save");
            window.location.reload();
          }}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg transition-all"
        >
          Restart Game
        </button>
      </div>
    );
  }

  const load = servers.reduce((sum, s) => sum + s.level, 0);

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-900 text-white p-3 sm:p-4 md:p-6 overflow-x-hidden">
      {/* HEADER */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-center md:text-left">
        Data Center Simulator 🚀
      </h1>
      {/* MESSAGE */}
      {message && (
        <div className="bg-red-600 p-3 rounded-lg mb-4 break-words">
          {message}
        </div>
      )}
      {/* COOLING PIPES */}
      <div className="flex gap-2 mb-4">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="h-3 flex-1 bg-cyan-400 rounded-full animate-pulse"
          />
        ))}
      </div>
      <div className="grid grid-cols-2 md:flex gap-3 mb-6">
        <button
          onClick={() => addServer(1)}
          className="w-full md:w-auto bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg text-sm sm:text-base transition-all"
        >
          Basic Server ($100)
        </button>

        <button
          onClick={() => addServer(2)}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg text-sm sm:text-base transition-all"
        >
          Advanced Server ($500)
        </button>

        <button
          onClick={() => addServer(3)}
          className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg text-sm sm:text-base transition-all"
        >
          Quantum Server ($1200)
        </button>

        <button
          onClick={mergeServers}
          className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-600 px-4 py-3 rounded-lg text-sm sm:text-base transition-all"
        >
          Merge 🔗
        </button>

        <button
          onClick={upgradeCooling}
          className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-600 px-4 py-3 rounded-lg text-sm sm:text-base transition-all"
        >
          Cooling ❄
        </button>

        <button
          onClick={upgradeSecurity}
          className="w-full md:w-auto bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg text-sm sm:text-base transition-all"
        >
          Security 🛡
        </button>
      </div>{" "}
      {/* CONTROLS */}
      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* SERVER ROOM */}
        <div className="xl:col-span-2 bg-gray-800 p-4 md:p-6 rounded-xl relative overflow-hidden min-h-[400px]">
          <h2 className="text-xl md:text-2xl mb-4">Server Room</h2>
          {/* NETWORK CABLES */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg className="w-full h-full">
              {servers.map((_, i) => {
                if (i === 0) return null;

                const col = i % 6;
                const row = Math.floor(i / 6);

                const x1 = col * 150 - 80;
                const y1 = row * 190 + 90;

                const x2 = col * 150 + 40;
                const y2 = row * 190 + 90;

                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#00ffff"
                    strokeWidth="4"
                    strokeDasharray="8 6"
                    className="animate-pulse"
                  />
                );
              })}
            </svg>
          </div>

          {/* SERVER GRID */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {servers.map((server) => (
              <ServerRack key={server.id} server={server} />
            ))}
          </div>
        </div>

        {/* DASHBOARD */}
        <div className="bg-gray-800 p-4 md:p-6 rounded-xl space-y-3 h-fit sticky top-4">
          <h2 className="text-xl md:text-2xl mb-4">Dashboard</h2>

          <p>💰 Money: ${money.toFixed(0)}</p>

          <div>
            <p>🌡 Temperature: {temperature.toFixed(1)}°C</p>

            <div className="w-full bg-gray-700 rounded-full h-3 sm:h-4 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
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

          <p>🖥 Servers: {servers.length}</p>
          <p>🔌 Load: {load}</p>
          <p>⚡ Electricity: {electricity}</p>
          <p>❄ Cooling: {cooling}</p>
          <p>🛡 Security: {security}</p>
          <p>🌐 Clients: {clients.length}</p>

          <p className="text-green-400">
            📈 Revenue/sec: ${clients.reduce((sum, c) => sum + c.reward, 0)}
          </p>

          <p className="text-green-400">🟢 Operational</p>
        </div>
      </div>
      {/* CLIENTS */}
      <div className="bg-gray-800 p-4 md:p-6 rounded-xl mt-6">
        <h2 className="text-xl md:text-2xl mb-4">Hosting Clients</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {availableClients.map((client, index) => (
            <div
              key={index}
              className="bg-gray-700 p-4 rounded-xl hover:scale-[1.02] transition-all duration-300 break-words"
            >
              <p className="font-bold text-lg">{client.name}</p>

              <p className="text-sm text-gray-300">
                Requires {client.serversNeeded} servers
              </p>

              <p className="text-green-400">+${client.reward}/sec</p>

              <button
                onClick={() => acceptClient(client)}
                className="mt-3 bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg w-full transition-all"
              >
                Host Client
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* EVENT LOG */}
      <div className="bg-gray-800 p-4 md:p-6 rounded-xl mt-6">
        <h2 className="text-xl md:text-2xl mb-4">Event Log</h2>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {eventLog.length === 0 && (
            <p className="text-gray-400">No recent events</p>
          )}

          {eventLog.map((event, index) => (
            <div key={index} className="bg-gray-700 p-3 rounded-lg break-words">
              <p>{event.text}</p>

              <p className="text-xs text-gray-400 mt-1">{event.time}</p>
            </div>
          ))}
        </div>
      </div>
      {/* CHART */}
      <div className="mt-6 w-full overflow-x-auto bg-gray-800 p-3 md:p-6 rounded-xl">
        <StatsChart data={chartData} />
      </div>
    </div>
  );
}
