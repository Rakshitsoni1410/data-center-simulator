import { useState, useRef, useCallback } from "react";

import { ITEMS }                    from "../data/items";
import { ENGINEERS }                from "../data/engineers";
import { CLIENT_POOL }              from "../data/clients";
import {
  GRID_COLS,
  GRID_SIZE,
  countItem,
  calcHeat,
  calcUptime,
  calcIncome,
  calcUpkeep,
  meetsReq,
} from "../utils/gameLogic";
import { useGameTick }              from "../hooks/useGameTick";

import StatCard      from "./StatCard";
import HeatBar       from "./HeatBar";
import GridCell      from "./GridCell";
import ShopItem      from "./ShopItem";
import ClientCard    from "./ClientCard";
import EngineerCard  from "./EngineerCard";
import Notification  from "./Notification";

// ── Tab config ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "floor",     icon: "🏢", label: "Floor"     },
  { id: "clients",   icon: "🤝", label: "Clients"   },
  { id: "engineers", icon: "👩‍💻", label: "Engineers" },
  { id: "log",       icon: "📋", label: "Log"       },
];

// Log entry color map
const LOG_COLORS = {
  g: "#4ade80",
  b: "#f87171",
  a: "#60a5fa",
  w: "#fbbf24",
  n: "#94a3b8",
};

// ── Component ────────────────────────────────────────────────────────────────
export default function DataCenterTycoon() {
  // ── state ──
  const [cash,          setCash]          = useState(500);
  const [cells,         setCells]         = useState(Array(GRID_SIZE).fill(null));
  const [broken,        setBroken]        = useState(new Set());
  const [selected,      setSelected]      = useState("server");
  const [clients,       setClients]       = useState([]);
  const [pendingClient, setPendingClient] = useState(null);
  const [engineers,     setEngineers]     = useState(new Set());
  const [log,           setLog]           = useState([
    { msg: "Welcome! Place a server rack on the floor to start earning.", type: "a" },
    { msg: "Hire engineers for bonuses. Accept client contracts for big income.", type: "a" },
  ]);
  const [tick,         setTick]          = useState(0);
  const [progress,     setProgress]      = useState(0);
  const [activeTab,    setActiveTab]     = useState("floor");
  const [notification, setNotification]  = useState(null);

  // stateRef lets the tick loop read latest state without re-subscribing
  const stateRef = useRef({});
  stateRef.current = { cash, cells, broken, clients, pendingClient, engineers, tick };

  // ── helpers ──
  const addLog = useCallback((msg, type = "n") => {
    setLog((l) => [{ msg, type }, ...l].slice(0, 60));
  }, []);

  const notify = useCallback((msg, type = "a") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // ── game tick (drives all events) ──
  useGameTick({
    stateRef,
    setCash,
    setBroken,
    setClients,
    setPendingClient,
    setTick,
    setProgress,
    addLog,
    notify,
  });

  // ── derived values ──
  const income  = calcIncome(cells, clients, engineers);
  const upkeep  = calcUpkeep(cells, engineers);
  const net     = income - upkeep;
  const heat    = calcHeat(cells);
  const uptime  = calcUptime(cells, engineers);
  const active  = clients.filter((c) => c.status === "active").length;
  const selItem = ITEMS.find((x) => x.id === selected);

  // ── actions ──
  function handlePlace(i) {
    if (cells[i]) {
      // Remove existing item
      const nc = [...cells];
      nc[i] = null;
      const nb = new Set(broken);
      nb.delete(i);
      setCells(nc);
      setBroken(nb);
      addLog("Removed item.", "n");
    } else {
      // Place selected item
      if (!selItem) return;
      if (cash < selItem.cost) {
        addLog(`Not enough cash for ${selItem.label}.`, "b");
        notify(`Need $${selItem.cost}!`, "b");
        return;
      }
      const nc = [...cells];
      nc[i] = selItem.id;
      setCells(nc);
      setCash((c) => c - selItem.cost);
      addLog(`Placed ${selItem.label} (-$${selItem.cost}).`, "g");
    }
  }

  function acceptClient(id) {
    if (!pendingClient || pendingClient.id !== id) return;
    if (!meetsReq(pendingClient.req, cells)) {
      addLog(`Can't accept ${pendingClient.name} — missing requirements.`, "b");
      notify("Missing requirements!", "b");
      return;
    }
    const signed = { ...pendingClient, status: "active" };
    setClients((cl) => [...cl, signed]);
    setPendingClient(null);
    addLog(`✅ Signed ${signed.name} as a client! +$${signed.pay}/tick`, "g");
    notify(`${signed.name} signed!`, "g");
  }

  function hireEng(id) {
    const e = ENGINEERS.find((x) => x.id === id);
    if (!e || engineers.has(id)) return;
    const cost = e.salary * 6;
    if (cash < cost) {
      addLog(`Not enough cash to hire ${e.name}.`, "b");
      return;
    }
    setCash((c) => c - cost);
    setEngineers((s) => new Set([...s, id]));
    addLog(`👩‍💻 Hired ${e.name} (${e.skill}) for $${cost}.`, "g");
    notify(`${e.name} joined your team!`, "g");
  }

  // ── render ──
  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        color: "#f1f5f9",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: 12,
      }}
    >
      {/* Toast notification */}
      <Notification notification={notification} />

      {/* Header + stats */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 800 }}>
            🖥️ Data Center Tycoon
          </span>
          <span
            style={{
              fontSize: 11,
              color: "#475569",
              background: "#1e293b",
              padding: "2px 8px",
              borderRadius: 20,
            }}
          >
            Tick {tick}
          </span>
        </div>

        {/* Tick progress bar */}
        <div
          style={{
            height: 3,
            background: "#1e293b",
            borderRadius: 2,
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              height: "100%",
              width: progress + "%",
              background: "#3b82f6",
              borderRadius: 2,
              transition: "width .1s linear",
            }}
          />
        </div>

        {/* Stat tiles */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap: 6,
          }}
        >
          <StatCard
            icon="💰"
            label="Cash"
            value={"$" + cash.toLocaleString()}
            color={cash < 100 ? "#f87171" : "#4ade80"}
          />
          <StatCard
            icon="📈"
            label="Net/tick"
            value={(net >= 0 ? "+" : "") + "$" + net}
            color={net >= 0 ? "#4ade80" : "#f87171"}
            sub={`+$${income} / -$${upkeep}`}
          />
          <StatCard
            icon="🤝"
            label="Clients"
            value={active}
            sub={pendingClient ? "1 offer pending" : undefined}
          />
          <StatCard
            icon="👩‍💻"
            label="Engineers"
            value={engineers.size + "/" + ENGINEERS.length}
          />
          <StatCard
            icon="⬆️"
            label="Uptime"
            value={Math.round(uptime) + "%"}
            color={
              uptime >= 95 ? "#4ade80" : uptime >= 80 ? "#f59e0b" : "#f87171"
            }
          />
          <HeatBar heat={heat} />
        </div>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 2,
          marginBottom: 10,
          background: "#1e293b",
          borderRadius: 10,
          padding: 3,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1,
              padding: "7px 4px",
              borderRadius: 8,
              border: "none",
              background: activeTab === t.id ? "#3b82f6" : "transparent",
              color: activeTab === t.id ? "#fff" : "#94a3b8",
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
              transition: "background .15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {/* Badges */}
            {t.id === "clients" && pendingClient && (
              <span
                style={{
                  background: "#f59e0b",
                  color: "#000",
                  fontSize: 10,
                  padding: "0 5px",
                  borderRadius: 10,
                  fontWeight: 700,
                }}
              >
                !
              </span>
            )}
            {t.id === "floor" && broken.size > 0 && (
              <span
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: 10,
                  padding: "0 5px",
                  borderRadius: 10,
                  fontWeight: 700,
                }}
              >
                {broken.size}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── FLOOR TAB ── */}
      {activeTab === "floor" && (
        <div>
          <div
            style={{
              background: "#1e293b",
              borderRadius: 12,
              padding: 10,
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>
              Click empty cell to place selected item · Click placed item to
              remove it
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                gap: 5,
              }}
            >
              {cells.map((c, i) => (
                <GridCell
                  key={i}
                  cell={c}
                  idx={i}
                  broken={broken.has(i)}
                  selected={selected}
                  onPlace={handlePlace}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              fontSize: 11,
              color: "#64748b",
              marginBottom: 6,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".05em",
            }}
          >
            Build
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 6,
            }}
          >
            {ITEMS.map((item) => (
              <ShopItem
                key={item.id}
                item={item}
                selected={selected}
                canAfford={cash >= item.cost}
                onSelect={() => setSelected(item.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── CLIENTS TAB ── */}
      {activeTab === "clients" && (
        <div>
          <div
            style={{
              fontSize: 11,
              color: "#64748b",
              marginBottom: 6,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".05em",
            }}
          >
            Contracts
          </div>

          {!clients.length && !pendingClient && (
            <div
              style={{
                background: "#1e293b",
                borderRadius: 12,
                padding: 24,
                textAlign: "center",
                color: "#475569",
                fontSize: 13,
                marginBottom: 12,
              }}
            >
              No clients yet. Build servers and wait for contract offers.
            </div>
          )}

          <div
            style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}
          >
            {pendingClient && (
              <ClientCard
                client={pendingClient}
                canAccept={meetsReq(pendingClient.req, cells)}
                onAccept={() => acceptClient(pendingClient.id)}
              />
            )}
            {clients.map((c) => (
              <ClientCard
                key={c.id}
                client={c}
                canAccept={false}
                onAccept={null}
              />
            ))}
          </div>

          {/* All contracts reference table */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: 10,
              padding: "10px 14px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#64748b",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              All available contracts (reference)
            </div>
            {CLIENT_POOL.map((c) => {
              const reqStr = Object.entries(c.req)
                .map(([k, v]) => `${v}×${k}`)
                .join(", ");
              const isActive = clients.find((x) => x.id === c.id);
              return (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "5px 0",
                    borderBottom: "1px solid #0f172a",
                    fontSize: 12,
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ color: "#94a3b8", minWidth: 0, flex: 1 }}>
                    {c.name}
                  </span>
                  <span
                    style={{
                      color: "#64748b",
                      fontSize: 11,
                      flex: 1,
                      textAlign: "center",
                    }}
                  >
                    {reqStr}
                  </span>
                  <span style={{ color: "#4ade80", fontWeight: 700 }}>
                    +${c.pay}/tick
                  </span>
                  {isActive && (
                    <span style={{ fontSize: 10, color: "#4ade80" }}>✓</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ENGINEERS TAB ── */}
      {activeTab === "engineers" && (
        <div>
          <div
            style={{
              fontSize: 11,
              color: "#64748b",
              marginBottom: 6,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".05em",
            }}
          >
            Hire team
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ENGINEERS.map((e) => (
              <EngineerCard
                key={e.id}
                eng={e}
                hired={engineers.has(e.id)}
                canAfford={cash >= e.salary * 6}
                onHire={() => hireEng(e.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── LOG TAB ── */}
      {activeTab === "log" && (
        <div>
          <div
            style={{
              fontSize: 11,
              color: "#64748b",
              marginBottom: 6,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".05em",
            }}
          >
            Event log
          </div>
          <div
            style={{
              background: "#1e293b",
              borderRadius: 10,
              padding: "10px 12px",
              maxHeight: 480,
              overflowY: "auto",
            }}
          >
            {log.map((e, i) => (
              <div
                key={i}
                style={{
                  fontSize: 12,
                  color: LOG_COLORS[e.type] || LOG_COLORS.n,
                  padding: "2px 0",
                  borderBottom: "1px solid #0f172a",
                  paddingBottom: 3,
                  marginBottom: 3,
                }}
              >
                {e.msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
