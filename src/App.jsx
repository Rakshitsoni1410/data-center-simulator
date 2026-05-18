import { useEffect, useRef, useState } from "react";
import { EMPLOYEES } from "./data/employees";
import StatsChart from "./components/StatsChart";
import ServerRack from "./components/ServerRack";

import { clients as availableClients } from "./data/clients";
import { SERVER_LEVELS } from "./data/serverLevels";
import { UPGRADES } from "./data/upgrades";
import { randomEvents } from "./systems/events";
import { calculateEconomy } from "./systems/economy";
import { calculateCooling } from "./systems/cooling";
import { runCyberAttack } from "./systems/attacks";
import { useGameLoop } from "./hooks/useGameLoop";
export default function App() {
  const [servers, setServers] = useState([]);
  const [money, setMoney] = useState(1000);
  const [temperature, setTemperature] = useState(20);
  const [cooling, setCooling] = useState(1);
  const [security, setSecurity] = useState(1);
  const [electricity, setElectricity] = useState(0);

  /* FIXED */
  const [clients, setClients] = useState([]);
  /* EMPLOYEES */
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState("");
  const [eventLog, setEventLog] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [purchasedUpgrades, setPurchasedUpgrades] = useState([]);
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

  /* ---------------- THEME ---------------- */

  const bgMain = darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black";

  const cardTheme = darkMode
    ? "bg-gray-800"
    : "bg-white border border-gray-300";

  const innerCardTheme = darkMode
    ? "bg-gray-700 text-white"
    : "bg-gray-200 text-black";

  const sectionTitle = darkMode ? "text-white" : "text-gray-900";

  /* ---------------- SAVE ---------------- */

  useEffect(() => {
    localStorage.setItem(
      "dc-save",
      JSON.stringify({
        servers,
        money,
        temperature,
        cooling,
        security,
        electricity,
        clients,
        employees,
        purchasedUpgrades,
        darkMode,
        chartData,
        eventLog,
      }),
    );
  }, [
    servers,
    money,
    temperature,
    cooling,
    security,
    electricity,
    clients,
    employees,
    purchasedUpgrades,
    darkMode,
    chartData,
    eventLog,
  ]);
  /* ---------------- LOAD SAVE ---------------- */

  useEffect(() => {
    const save = JSON.parse(localStorage.getItem("dc-save"));

    if (!save) return;

    setServers(save.servers || []);
    setMoney(save.money || 1000);
    setTemperature(save.temperature || 20);
    setCooling(save.cooling || 1);
    setSecurity(save.security || 1);
    setElectricity(save.electricity || 0);

    setClients(save.clients || []);
    setEmployees(save.employees || []);

    setPurchasedUpgrades(save.purchasedUpgrades || []);

    setDarkMode(save.darkMode ?? true);

    setChartData(save.chartData || []);
    setEventLog(save.eventLog || []);

    setMessage("💾 Save Loaded");
  }, []);
  /* ---------------- CAPACITY ---------------- */

  const totalCapacity = servers.reduce((sum, s) => sum + s.capacity, 0);

  const usedCapacity = clients.reduce((sum, c) => sum + c.bandwidth, 0);

  const freeCapacity = totalCapacity - usedCapacity;
  /* --add employee-- */
  const hireEmployee = (employee) => {
    if (moneyRef.current < employee.salary) {
      setMessage("❌ Not enough money");

      return;
    }

    setEmployees((prev) => [...prev, employee]);

    setMoney((p) => p - employee.salary);

    setMessage(`${employee.emoji} Hired ${employee.name}`);
  };

  const buyUpgrade = (upgrade) => {
    if (purchasedUpgrades.some((u) => u.id === upgrade.id)) {
      setMessage("⚠ Upgrade already purchased");

      return;
    }

    if (moneyRef.current < upgrade.cost) {
      setMessage("❌ Not enough money");

      return;
    }

    setMoney((p) => p - upgrade.cost);

    setPurchasedUpgrades((prev) => [...prev, upgrade]);

    setMessage(`${upgrade.emoji} ${upgrade.name} unlocked`);
  };
  /* ---------------- ADD SERVER ---------------- */

  const addServer = (level = 1) => {
    const config = SERVER_LEVELS[level];

    if (!config) return;

    if (moneyRef.current < config.cost) {
      setMessage("❌ Not enough money");
      return;
    }

    setServers((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        level,
        health: 100,
        capacity: config.capacity,
        used: 0,
      },
    ]);

    setMoney((p) => p - config.cost);

    setMessage(`✅ Level ${level} Server Purchased`);
  };

  /* ---------------- MERGE ---------------- */

  const mergeServers = () => {
    let arr = [...serversRef.current];

    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i].level === arr[j].level && arr[i].level < 6) {
          const newLevel = arr[i].level + 1;

          arr[i] = {
            ...arr[i],
            level: newLevel,
            health: 100,
            capacity: SERVER_LEVELS[newLevel].capacity,
          };

          arr.splice(j, 1);

          setServers(arr);

          setMessage(`🔗 Level ${newLevel} Server Created!`);

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

  /* ---------------- REPAIR ---------------- */

  const repairServers = () => {
    const damagedServers = serversRef.current.filter((s) => s.health < 100);

    if (damagedServers.length === 0) {
      setMessage("✅ All servers healthy");
      return;
    }

    const repairCost = damagedServers.length * 150;

    if (moneyRef.current < repairCost) {
      setMessage("❌ Not enough money for repairs");

      return;
    }

    setMoney((p) => p - repairCost);

    setServers((prev) =>
      prev.map((s) => ({
        ...s,
        health: 100,
      })),
    );

    setMessage(`🔧 Repaired ${damagedServers.length} servers`);
  };

  /* ---------------- HOST CLIENT ---------------- */

  const acceptClient = (client) => {
    if (clientsRef.current.some((c) => c.name === client.name)) {
      setMessage("⚠ Client already hosted");

      return;
    }

    if (freeCapacity < client.bandwidth) {
      setMessage("❌ Not enough server capacity");

      return;
    }

    setClients((prev) => [...prev, client]);

    setMessage(`✅ Hosting ${client.name}`);
  };

  /* ---------------- EVENTS ---------------- */

  const triggerRandomEvent = () => {
    const random =
      randomEvents[Math.floor(Math.random() * randomEvents.length)];

    switch (random.type) {
      case "heat":
        setTemperature((p) => p + random.value);
        break;

      case "money":
        setMoney((p) => p + random.value);
        break;

      case "security":
        setSecurity((p) => p + random.value);
        break;

      case "cooling":
        setCooling((p) => p + random.value);
        break;

      case "damage":
        setServers((prev) =>
          prev.map((s) => ({
            ...s,
            health: Math.max(20, s.health - random.value),
          })),
        );
        break;

      default:
        break;
    }

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
  const engineerCount = employees.filter((e) => e.effect === "repair").length;

  const coolingBonus = employees.filter((e) => e.effect === "cooling").length;

  const securityBonus = employees.filter((e) => e.effect === "security").length;
  useGameLoop(
    () => {
      const servers = serversRef.current;
      const money = moneyRef.current;
      const temp = tempRef.current;
      const cooling = coolingRef.current;
      const security = securityRef.current;
      const clients = clientsRef.current;
      const coolingUpgrade = purchasedUpgrades.find(
        (u) => u.effect === "cooling",
      );

      const repairUpgrade = purchasedUpgrades.find(
        (u) => u.effect === "repair",
      );

      const electricityUpgrade = purchasedUpgrades.find(
        (u) => u.effect === "electricity",
      );

      /* REMOVE DEAD SERVERS */

      setServers((prev) => prev.filter((s) => s.health > 0));

      /* ECONOMY */

      const { income, electricity, electricBill, nextTemperature, load } =
        calculateEconomy({
          servers,
          clients,
          cooling: (cooling + coolingBonus) * (coolingUpgrade?.value || 1),
          temperature: temp,
        });

      /* COOLING */

      const { finalTemperature, usageRatio } = calculateCooling({
        nextTemperature,
        cooling,
        usedCapacity,
        totalCapacity,
      });

      /* ATTACKS */

      runCyberAttack({
        security: security + securityBonus,
        setMoney,
        setTemperature,
        setMessage,
      });

      /* MONEY */

      const reducedBill = electricBill * (electricityUpgrade?.value || 1);

      const nextMoney = money + income - reducedBill;
      setMoney(nextMoney);

      /* TEMP */

      setTemperature(finalTemperature);

      /* ELECTRICITY */

      setElectricity(electricity);

      /* DAMAGE */

      setServers((prev) =>
        prev.map((s) => ({
          ...s,
          health: Math.max(0, s.health - (finalTemperature > 70 ? 2 : 0)),
        })),
      );

      /* AUTO REPAIR */

      if (engineerCount > 0) {
        setServers((prev) =>
          prev.map((s) => ({
            ...s,
            health: Math.min(
              100,
              s.health + engineerCount * 0.3 * (repairUpgrade?.value || 1),
            ),
          })),
        );
      }

      /* CHART */

      setChartData((prev) => [
        ...prev.slice(-20),
        {
          time: new Date().toLocaleTimeString(),
          money: nextMoney,
          temperature: finalTemperature,
        },
      ]);

      /* EVENTS */

      if (Math.random() < 0.05) {
        triggerRandomEvent();
      }

      /* GAME OVER */

      if (finalTemperature >= 100) {
        setGameOver(true);

        setMessage("💥 DATA CENTER FAILED 💥");
      }
    },
    1000,
    !gameOver,
  );

  const load = servers.reduce((sum, s) => sum + s.level, 0);

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

  /* ---------------- UI ---------------- */

  return (
    <div
      className={`min-h-screen p-3 sm:p-4 md:p-6 overflow-x-hidden ${bgMain}`}
    >
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          Data Center Simulator 🚀
        </h1>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="bg-indigo-600 hover:bg-indigo-700 px-4 py-3 rounded-lg"
        >
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {message && (
        <div className="bg-red-600 p-3 rounded-lg mb-4 break-words">
          {message}
        </div>
      )}

      {/* CONTROLS */}

      <div className="grid grid-cols-2 md:flex gap-3 mb-6">
        <button
          onClick={() => addServer(1)}
          className="w-full md:w-auto bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg"
        >
          Basic Server
        </button>

        <button
          onClick={() => addServer(2)}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg"
        >
          Advanced Server
        </button>

        <button
          onClick={() => addServer(3)}
          className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg"
        >
          Quantum Server
        </button>

        <button
          onClick={mergeServers}
          className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-600 px-4 py-3 rounded-lg"
        >
          Merge 🔗
        </button>

        <button
          onClick={upgradeCooling}
          className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-600 px-4 py-3 rounded-lg"
        >
          Cooling ❄
        </button>

        <button
          onClick={upgradeSecurity}
          className="w-full md:w-auto bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg"
        >
          Security 🛡
        </button>

        <button
          onClick={repairServers}
          className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 px-4 py-3 rounded-lg"
        >
          Repair 🔧
        </button>
        <button
          onClick={() => {
            localStorage.setItem(
              "dc-save",
              JSON.stringify({
                servers,
                money,
                temperature,
                cooling,
                security,
                electricity,
                clients,
                employees,
                purchasedUpgrades,
                darkMode,
                chartData,
                eventLog,
              }),
            );

            setMessage("💾 Game Saved");
          }}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 px-4 py-3 rounded-lg"
        >
          Save 💾
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("dc-save");

            window.location.reload();
          }}
          className="w-full md:w-auto bg-gray-700 hover:bg-gray-800 px-4 py-3 rounded-lg"
        >
          Reset 🗑
        </button>
      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* SERVER ROOM */}

        <div
          className={`xl:col-span-2 ${cardTheme} p-4 md:p-6 rounded-xl relative overflow-hidden min-h-[400px]`}
        >
          <h2 className="text-xl md:text-2xl mb-4">Server Room</h2>

          {/* CABLES */}

          <div className="absolute inset-0 pointer-events-none z-0">
            <svg className="w-full h-full">
              {servers.map((_, i) => {
                if (i === 0) return null;

                const col = i % 6;
                const row = Math.floor(i / 6);

                return (
                  <line
                    key={i}
                    x1={col * 150 - 80}
                    y1={row * 190 + 90}
                    x2={col * 150 + 40}
                    y2={row * 190 + 90}
                    stroke="#00ffff"
                    strokeWidth="4"
                    strokeDasharray="8 6"
                    className="animate-pulse"
                  />
                );
              })}
            </svg>
          </div>

          {/* SERVERS */}

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {servers.map((server) => (
              <ServerRack key={server.id} server={server} />
            ))}
          </div>
        </div>

        {/* DASHBOARD */}

        <div
          className={`${cardTheme} p-4 md:p-6 rounded-xl space-y-3 h-fit sticky top-4`}
        >
          <h2 className="text-xl md:text-2xl mb-4">Dashboard</h2>

          <p>💰 Money: ${money.toFixed(0)}</p>

          <p>
            🌡 Temperature:
            {temperature.toFixed(1)}°C
          </p>

          <p>
            📡 Capacity:
            {usedCapacity}/{totalCapacity}
          </p>

          <p>🖥 Servers: {servers.length}</p>

          <p>🔌 Load: {load}</p>

          <p>
            ⚡ Electricity:
            {electricity}
          </p>

          <p>❄ Cooling: {cooling}</p>

          <p>🛡 Security: {security}</p>

          <p>🌐 Clients: {clients.length}</p>

          <p>👨‍🔧 Employees: {employees.length}</p>
        </div>
      </div>

      {/* CLIENTS */}

      <div className={`${cardTheme} p-4 md:p-6 rounded-xl mt-6`}>
        <h2 className="text-xl md:text-2xl mb-4">Hosting Clients</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {availableClients.map((client, index) => (
            <div key={index} className={`${innerCardTheme} p-4 rounded-xl`}>
              <p className="font-bold text-lg">{client.name}</p>

              <p>Uses {client.bandwidth} TB</p>

              <p>+${client.reward}/sec</p>

              <button
                onClick={() => acceptClient(client)}
                className="mt-3 bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg w-full"
              >
                Host Client
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* EMPLOYEES */}

      <div className={`${cardTheme} p-4 md:p-6 rounded-xl mt-6`}>
        <h2 className="text-xl md:text-2xl mb-4">Employees</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {EMPLOYEES.map((employee) => (
            <div
              key={employee.id}
              className={`${innerCardTheme} p-4 rounded-xl`}
            >
              <p className="font-bold text-lg">
                {employee.emoji} {employee.name}
              </p>

              <p className="text-gray-300">Salary: ${employee.salary}</p>

              <p className="text-cyan-300 mt-1">Effect: {employee.effect}</p>

              <button
                onClick={() => hireEmployee(employee)}
                className="mt-3 bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg w-full transition-all"
              >
                Hire
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* UPGRADES */}

      <div className={`${cardTheme} p-4 md:p-6 rounded-xl mt-6`}>
        <h2 className="text-2xl mb-4">Upgrade Tree</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {UPGRADES.map((upgrade) => {
            const purchased = purchasedUpgrades.some(
              (u) => u.id === upgrade.id,
            );

            return (
              <div
                key={upgrade.id}
                className={`p-4 rounded-xl ${
                  purchased ? "bg-green-700 text-white" : innerCardTheme
                }`}
              >
                <p className="font-bold text-lg">
                  {upgrade.emoji} {upgrade.name}
                </p>

                <p className="text-sm text-gray-300 mt-1">
                  {upgrade.description}
                </p>

                <p className="mt-2">💰 ${upgrade.cost}</p>

                <button
                  disabled={purchased}
                  onClick={() => buyUpgrade(upgrade)}
                  className={`mt-3 px-4 py-2 rounded-lg w-full ${
                    purchased
                      ? "bg-green-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {purchased ? "Purchased" : "Buy Upgrade"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      {/* EVENT LOG */}

      <div className={`${cardTheme} p-4 md:p-6 rounded-xl mt-6`}>
        <h2 className="text-xl md:text-2xl mb-4">Event Log</h2>

        <div className="space-y-2">
          {eventLog.map((event, index) => (
            <div key={index} className={`${innerCardTheme} p-3 rounded-lg`}>
              <p>{event.text}</p>

              <p className="text-xs text-gray-400">{event.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CHART */}

      <div
        className={`${cardTheme} mt-6 w-full overflow-x-auto p-3 md:p-6 rounded-xl`}
      >
        <StatsChart data={chartData} />
      </div>
    </div>
  );
}
