import { useState, useEffect, useRef, useCallback } from "react";

const GRID_COLS = 20;
const GRID_ROWS = 14;
const CELL_SIZE = 42;

const COMPONENT_TYPES = {
  SERVER: {
    id: "SERVER", label: "Server Rack", icon: "🖥", w: 1, h: 2,
    color: "#185FA5", heatColor: "#E24B4A", powerDraw: 2.5,
    desc: "Hosts compute workloads"
  },
  SWITCH: {
    id: "SWITCH", label: "Network Switch", icon: "⇄", w: 2, h: 1,
    color: "#0F6E56", heatColor: "#EF9F27", powerDraw: 0.8,
    desc: "Routes network traffic"
  },
  STORAGE: {
    id: "STORAGE", label: "Storage Array", icon: "◫", w: 2, h: 1,
    color: "#534AB7", heatColor: "#D85A30", powerDraw: 1.2,
    desc: "Persistent data storage"
  },
  COOLING: {
    id: "COOLING", label: "CRAC Unit", icon: "❄", w: 1, h: 2,
    color: "#1D9E75", heatColor: "#1D9E75", powerDraw: 3.5,
    desc: "Cooling / air conditioning"
  },
  UPS: {
    id: "UPS", label: "UPS", icon: "⚡", w: 1, h: 1,
    color: "#BA7517", heatColor: "#D85A30", powerDraw: 0.3,
    desc: "Uninterruptible power supply"
  },
};

const TOOLS = ["SELECT", "SERVER", "SWITCH", "STORAGE", "COOLING", "UPS", "DELETE"];

function lerp(a, b, t) { return a + (b - a) * t; }
function heatToColor(heat) {
  const r = Math.round(lerp(56, 226, heat));
  const g = Math.round(lerp(120, 35, heat));
  const b = Math.round(lerp(200, 35, heat));
  return `rgb(${r},${g},${b})`;
}

let nextId = 1;
function mkId() { return nextId++; }

const INITIAL_COMPONENTS = [
  { id: mkId(), type: "SERVER", col: 2, row: 1, load: 0.72, age: 4 },
  { id: mkId(), type: "SERVER", col: 4, row: 1, load: 0.85, age: 2 },
  { id: mkId(), type: "SERVER", col: 6, row: 1, load: 0.38, age: 6 },
  { id: mkId(), type: "SERVER", col: 2, row: 4, load: 0.91, age: 1 },
  { id: mkId(), type: "SERVER", col: 4, row: 4, load: 0.55, age: 3 },
  { id: mkId(), type: "SWITCH", col: 2, row: 7, load: 0.45, age: 3 },
  { id: mkId(), type: "SWITCH", col: 5, row: 7, load: 0.6, age: 2 },
  { id: mkId(), type: "STORAGE", col: 8, row: 1, load: 0.44, age: 5 },
  { id: mkId(), type: "STORAGE", col: 8, row: 3, load: 0.71, age: 2 },
  { id: mkId(), type: "COOLING", col: 12, row: 1, load: 0.9, age: 2 },
  { id: mkId(), type: "COOLING", col: 12, row: 4, load: 0.78, age: 3 },
  { id: mkId(), type: "UPS", col: 14, row: 1, load: 0.5, age: 4 },
  { id: mkId(), type: "UPS", col: 14, row: 3, load: 0.5, age: 4 },
];

function getComponentRect(c) {
  const t = COMPONENT_TYPES[c.type];
  return { col: c.col, row: c.row, w: t.w, h: t.h };
}

function collides(a, b) {
  const ar = getComponentRect(a), br = getComponentRect(b);
  return !(ar.col + ar.w <= br.col || br.col + br.w <= ar.col ||
           ar.row + ar.h <= br.row || br.row + br.h <= ar.row);
}

function computeHeatMap(components) {
  const map = {};
  for (let r = 0; r < GRID_ROWS; r++)
    for (let c = 0; c < GRID_COLS; c++)
      map[`${c},${r}`] = 0;

  components.forEach(comp => {
    const t = COMPONENT_TYPES[comp.type];
    const heat = comp.type === "COOLING" ? 0 : comp.load * 0.9;
    for (let dr = -3; dr <= t.h + 2; dr++) {
      for (let dc = -3; dc <= t.w + 2; dc++) {
        const cr = comp.row + dr, cc = comp.col + dc;
        if (cr < 0 || cr >= GRID_ROWS || cc < 0 || cc >= GRID_COLS) continue;
        const dist = Math.sqrt(Math.max(0, dr) ** 2 + Math.max(0, dc) ** 2);
        const spread = heat * Math.max(0, 1 - dist / 4);
        const key = `${cc},${cr}`;
        map[key] = Math.min(1, (map[key] || 0) + spread * 0.35);
      }
    }
    if (comp.type === "COOLING") {
      for (let dr = -4; dr <= t.h + 3; dr++) {
        for (let dc = -4; dc <= t.w + 3; dc++) {
          const cr = comp.row + dr, cc = comp.col + dc;
          if (cr < 0 || cr >= GRID_ROWS || cc < 0 || cc >= GRID_COLS) continue;
          const dist = Math.sqrt(Math.max(0, dr) ** 2 + Math.max(0, dc) ** 2);
          const cool = Math.max(0, 1 - dist / 5) * 0.5;
          const key = `${cc},${cr}`;
          map[key] = Math.max(0, (map[key] || 0) - cool);
        }
      }
    }
  });
  return map;
}

export default function DataCenterSimulator() {
  const [components, setComponents] = useState(INITIAL_COMPONENTS);
  const [tool, setTool] = useState("SELECT");
  const [selected, setSelected] = useState(null);
  const [showHeat, setShowHeat] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [heatMap, setHeatMap] = useState({});
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ dc: 0, dr: 0 });
  const [simRunning, setSimRunning] = useState(true);
  const [tick, setTick] = useState(0);
  const [alert, setAlert] = useState(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const loadsRef = useRef({});

  useEffect(() => {
    const map = computeHeatMap(components);
    setHeatMap(map);
  }, [components]);

  useEffect(() => {
    if (!simRunning) return;
    const id = setInterval(() => {
      setTick(t => t + 1);
      setComponents(prev => prev.map(c => {
        const t = COMPONENT_TYPES[c.type];
        const noise = (Math.random() - 0.5) * 0.06;
        const newLoad = Math.max(0.05, Math.min(0.99, c.load + noise));
        if (newLoad > 0.92 && c.type !== "COOLING") {
          setAlert(`⚠️ ${t.label} overloaded! Consider adding cooling or load balancing.`);
          setTimeout(() => setAlert(null), 3000);
        }
        return { ...c, load: parseFloat(newLoad.toFixed(3)) };
      }));
    }, 1200);
    return () => clearInterval(id);
  }, [simRunning]);

  const totalPower = components.reduce((s, c) => s + COMPONENT_TYPES[c.type].powerDraw * c.load, 0);
  const avgLoad = components.length ? components.reduce((s, c) => s + c.load, 0) / components.length : 0;
  const serverCount = components.filter(c => c.type === "SERVER").length;
  const coolingCount = components.filter(c => c.type === "COOLING").length;
  const pue = coolingCount > 0 ? 1 + (coolingCount * 3.5) / Math.max(1, totalPower - coolingCount * 3.5) : 2.2;

  const selectedComp = selected != null ? components.find(c => c.id === selected) : null;

  const handleCellClick = useCallback((col, row) => {
    if (tool === "SELECT") {
      const hit = components.find(c => {
        const r = getComponentRect(c);
        return col >= r.col && col < r.col + r.w && row >= r.row && row < r.row + r.h;
      });
      setSelected(hit ? hit.id : null);
      return;
    }
    if (tool === "DELETE") {
      const hit = components.find(c => {
        const r = getComponentRect(c);
        return col >= r.col && col < r.col + r.w && row >= r.row && row < r.row + r.h;
      });
      if (hit) {
        setComponents(prev => prev.filter(c => c.id !== hit.id));
        setSelected(null);
      }
      return;
    }
    const t = COMPONENT_TYPES[tool];
    if (!t) return;
    if (col + t.w > GRID_COLS || row + t.h > GRID_ROWS) return;
    const newComp = { id: mkId(), type: tool, col, row, load: 0.5, age: 0 };
    const overlaps = components.some(c => collides(c, newComp));
    if (!overlaps) {
      setComponents(prev => [...prev, newComp]);
    }
  }, [tool, components]);

  const handleDragStart = useCallback((e, compId) => {
    if (tool !== "SELECT") return;
    const comp = components.find(c => c.id === compId);
    if (!comp) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clickCol = Math.floor(x / CELL_SIZE);
    const clickRow = Math.floor(y / CELL_SIZE);
    setDragging(compId);
    setDragOffset({ dc: clickCol - comp.col, dr: clickRow - comp.row });
    setSelected(compId);
    e.preventDefault();
  }, [tool, components]);

  const handleDragMove = useCallback((e) => {
    if (dragging == null) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / CELL_SIZE) - dragOffset.dc;
    const row = Math.floor(y / CELL_SIZE) - dragOffset.dr;
    const comp = components.find(c => c.id === dragging);
    if (!comp) return;
    const t = COMPONENT_TYPES[comp.type];
    const nc = Math.max(0, Math.min(GRID_COLS - t.w, col));
    const nr = Math.max(0, Math.min(GRID_ROWS - t.h, row));
    const moved = { ...comp, col: nc, row: nr };
    const overlaps = components.some(c => c.id !== dragging && collides(c, moved));
    if (!overlaps) {
      setComponents(prev => prev.map(c => c.id === dragging ? { ...c, col: nc, row: nr } : c));
    }
  }, [dragging, dragOffset, components]);

  const handleDragEnd = useCallback(() => {
    setDragging(null);
  }, []);

  const canvasW = GRID_COLS * CELL_SIZE;
  const canvasH = GRID_ROWS * CELL_SIZE;

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", padding: "0 0 24px" }}>
      <h2 className="sr-only">2D Data Center Simulator — place and manage server racks, cooling units, and networking equipment on a grid</h2>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 500 }}>Data Center Simulator</div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
            Click to place • drag to move • select tool to manage
          </div>
        </div>
        <button
          onClick={() => setSimRunning(r => !r)}
          style={{ fontSize: 13, padding: "6px 14px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: simRunning ? "var(--color-background-success)" : "var(--color-background-secondary)", color: simRunning ? "var(--color-text-success)" : "var(--color-text-secondary)", cursor: "pointer" }}
        >
          {simRunning ? "⏸ Pause" : "▶ Resume"}
        </button>
      </div>

      {/* Alert */}
      {alert && (
        <div style={{ background: "var(--color-background-warning)", color: "var(--color-text-warning)", border: "0.5px solid var(--color-border-warning)", borderRadius: 8, padding: "8px 14px", fontSize: 13, marginBottom: 12 }}>
          {alert}
        </div>
      )}

      {/* Metrics row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 14 }}>
        {[
          { label: "Total Power", value: `${totalPower.toFixed(1)} kW` },
          { label: "Avg Utilisation", value: `${(avgLoad * 100).toFixed(0)}%`, warn: avgLoad > 0.8 },
          { label: "PUE", value: pue.toFixed(2), warn: pue > 1.8 },
          { label: "Components", value: components.length },
          { label: "Servers", value: serverCount },
          { label: "Cooling Units", value: coolingCount },
        ].map(m => (
          <div key={m.label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 20, fontWeight: 500, color: m.warn ? "var(--color-text-warning)" : "var(--color-text-primary)" }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
        {TOOLS.map(t => {
          const ct = COMPONENT_TYPES[t];
          const isActive = tool === t;
          return (
            <button
              key={t}
              onClick={() => { setTool(t); setSelected(null); }}
              title={ct ? ct.desc : t === "DELETE" ? "Remove component" : "Select / drag components"}
              style={{
                padding: "6px 12px", fontSize: 12, borderRadius: 8,
                border: isActive ? `2px solid var(--color-border-info)` : "0.5px solid var(--color-border-secondary)",
                background: isActive ? "var(--color-background-info)" : "var(--color-background-primary)",
                color: isActive ? "var(--color-text-info)" : "var(--color-text-secondary)",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6
              }}
            >
              {ct ? <span>{ct.icon}</span> : t === "DELETE" ? "🗑" : "↖"}
              <span style={{ fontWeight: isActive ? 500 : 400 }}>{ct ? ct.label : t === "DELETE" ? "Delete" : "Select"}</span>
            </button>
          );
        })}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "flex", gap: 6, alignItems: "center", cursor: "pointer" }}>
            <input type="checkbox" checked={showHeat} onChange={e => setShowHeat(e.target.checked)} />
            Heat map
          </label>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "flex", gap: 6, alignItems: "center", cursor: "pointer" }}>
            <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} />
            Grid
          </label>
        </div>
      </div>

      {/* Main canvas + sidebar */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {/* Grid canvas */}
        <div
          ref={canvasRef}
          style={{
            position: "relative", width: canvasW, height: canvasH,
            background: "var(--color-background-secondary)", borderRadius: 8,
            border: "0.5px solid var(--color-border-tertiary)", overflow: "hidden",
            cursor: tool === "DELETE" ? "crosshair" : tool === "SELECT" ? (dragging ? "grabbing" : "default") : "cell",
            flexShrink: 0, userSelect: "none"
          }}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          {/* Heat map layer */}
          {showHeat && Array.from({ length: GRID_ROWS }, (_, r) =>
            Array.from({ length: GRID_COLS }, (_, c) => {
              const h = heatMap[`${c},${r}`] || 0;
              if (h < 0.04) return null;
              return (
                <div key={`h${c},${r}`} style={{
                  position: "absolute",
                  left: c * CELL_SIZE, top: r * CELL_SIZE,
                  width: CELL_SIZE, height: CELL_SIZE,
                  background: heatToColor(h),
                  opacity: h * 0.55,
                  pointerEvents: "none"
                }} />
              );
            })
          )}

          {/* Grid lines */}
          {showGrid && (
            <svg style={{ position: "absolute", top: 0, left: 0, width: canvasW, height: canvasH, pointerEvents: "none" }}>
              {Array.from({ length: GRID_COLS + 1 }, (_, i) => (
                <line key={`vg${i}`} x1={i * CELL_SIZE} y1={0} x2={i * CELL_SIZE} y2={canvasH}
                  stroke="var(--color-border-tertiary)" strokeWidth="0.5" />
              ))}
              {Array.from({ length: GRID_ROWS + 1 }, (_, i) => (
                <line key={`hg${i}`} x1={0} y1={i * CELL_SIZE} x2={canvasW} y2={i * CELL_SIZE}
                  stroke="var(--color-border-tertiary)" strokeWidth="0.5" />
              ))}
            </svg>
          )}

          {/* Click overlay */}
          {Array.from({ length: GRID_ROWS }, (_, r) =>
            Array.from({ length: GRID_COLS }, (_, c) => (
              <div key={`cell${c},${r}`}
                style={{ position: "absolute", left: c * CELL_SIZE, top: r * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}
                onClick={() => handleCellClick(c, r)}
              />
            ))
          )}

          {/* Components */}
          {components.map(comp => {
            const ct = COMPONENT_TYPES[comp.type];
            const isSelected = selected === comp.id;
            const isDragged = dragging === comp.id;
            const loadColor = comp.load > 0.85 ? "#E24B4A" : comp.load > 0.65 ? "#EF9F27" : "#1D9E75";
            return (
              <div
                key={comp.id}
                onMouseDown={e => handleDragStart(e, comp.id)}
                style={{
                  position: "absolute",
                  left: comp.col * CELL_SIZE + 2,
                  top: comp.row * CELL_SIZE + 2,
                  width: ct.w * CELL_SIZE - 4,
                  height: ct.h * CELL_SIZE - 4,
                  background: ct.color + "22",
                  border: isSelected ? `2px solid ${ct.color}` : `1px solid ${ct.color}66`,
                  borderRadius: 6,
                  cursor: tool === "SELECT" ? (isDragged ? "grabbing" : "grab") : "inherit",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  boxShadow: isSelected ? `0 0 0 2px ${ct.color}44` : "none",
                  zIndex: isDragged ? 10 : 1,
                  transition: isDragged ? "none" : "left 0.05s, top 0.05s",
                  overflow: "hidden"
                }}
              >
                <div style={{ fontSize: ct.h > 1 ? 18 : 14 }}>{ct.icon}</div>
                {ct.h > 1 && <div style={{ fontSize: 9, color: ct.color, fontWeight: 500, textAlign: "center", lineHeight: 1.2, marginTop: 2 }}>{ct.label}</div>}
                {/* Load bar */}
                <div style={{ position: "absolute", bottom: 3, left: 3, right: 3, height: 3, background: "var(--color-border-tertiary)", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${comp.load * 100}%`, background: loadColor, borderRadius: 2, transition: "width 0.6s" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div style={{ flex: 1, minWidth: 180 }}>
          {selectedComp ? (
            <ComponentDetail
              comp={selectedComp}
              heatMap={heatMap}
              onLoadChange={(id, v) => setComponents(prev => prev.map(c => c.id === id ? { ...c, load: v } : c))}
              onDelete={id => { setComponents(prev => prev.filter(c => c.id !== id)); setSelected(null); }}
            />
          ) : (
            <LegendPanel />
          )}
        </div>
      </div>

      {/* Status bar */}
      <div style={{ marginTop: 10, fontSize: 11, color: "var(--color-text-secondary)", display: "flex", gap: 16 }}>
        <span>Tick: {tick}</span>
        <span>Components: {components.length}</span>
        <span style={{ color: avgLoad > 0.8 ? "var(--color-text-warning)" : undefined }}>
          Avg load: {(avgLoad * 100).toFixed(0)}%
        </span>
        <span>Power: {totalPower.toFixed(1)} kW</span>
        <span style={{ color: pue > 1.8 ? "var(--color-text-warning)" : "var(--color-text-success)" }}>
          PUE: {pue.toFixed(2)} {pue <= 1.5 ? "✓ excellent" : pue <= 1.8 ? "✓ good" : "⚠ poor"}
        </span>
      </div>
    </div>
  );
}

function ComponentDetail({ comp, heatMap, onLoadChange, onDelete }) {
  const ct = COMPONENT_TYPES[comp.type];
  const heat = (() => {
    let h = 0, n = 0;
    for (let dr = 0; dr < ct.h; dr++) for (let dc = 0; dc < ct.w; dc++) {
      h += heatMap[`${comp.col + dc},${comp.row + dr}`] || 0;
      n++;
    }
    return h / Math.max(1, n);
  })();
  const loadColor = comp.load > 0.85 ? "var(--color-text-danger)" : comp.load > 0.65 ? "var(--color-text-warning)" : "var(--color-text-success)";

  return (
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: ct.color + "22", border: `1px solid ${ct.color}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{ct.icon}</div>
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{ct.label}</div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>ID #{comp.id} · age {comp.age}y</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
        <Row label="Position" value={`col ${comp.col}, row ${comp.row}`} />
        <Row label="Load" value={<span style={{ color: loadColor }}>{(comp.load * 100).toFixed(0)}%</span>} />
        <Row label="Power draw" value={`${(ct.powerDraw * comp.load).toFixed(2)} kW`} />
        <Row label="Heat index" value={`${(heat * 100).toFixed(0)}%`} />
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 11, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Simulated load</label>
        <input type="range" min="5" max="99" step="1" value={Math.round(comp.load * 100)}
          onChange={e => onLoadChange(comp.id, parseFloat(e.target.value) / 100)}
          style={{ width: "100%" }} />
      </div>

      {comp.load > 0.85 && comp.type !== "COOLING" && (
        <div style={{ marginTop: 10, fontSize: 11, background: "var(--color-background-danger)", color: "var(--color-text-danger)", borderRadius: 6, padding: "6px 10px" }}>
          ⚠ High load — consider adding a CRAC cooling unit nearby
        </div>
      )}

      <button
        onClick={() => onDelete(comp.id)}
        style={{ marginTop: 12, width: "100%", padding: "7px", fontSize: 12, borderRadius: 8, border: "0.5px solid var(--color-border-danger)", color: "var(--color-text-danger)", background: "transparent", cursor: "pointer" }}
      >
        🗑 Remove component
      </button>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)" }}>
      <span>{label}</span>
      <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function LegendPanel() {
  return (
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "16px" }}>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Components</div>
      {Object.values(COMPONENT_TYPES).map(ct => (
        <div key={ct.id} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 6, background: ct.color + "22", border: `1px solid ${ct.color}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{ct.icon}</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{ct.label}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{ct.desc}</div>
          </div>
        </div>
      ))}

      <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 10, marginTop: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Load indicator</div>
        {[["#1D9E75", "< 65% — healthy"], ["#EF9F27", "65–85% — moderate"], ["#E24B4A", "> 85% — critical"]].map(([color, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 11, color: "var(--color-text-secondary)" }}>
            <div style={{ width: 20, height: 4, borderRadius: 2, background: color }} />
            {label}
          </div>
        ))}
      </div>

      <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 10, marginTop: 4 }}>
        <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
          Select a tool → click the grid to place. Switch to <strong>Select</strong> to drag components or inspect them.
        </div>
      </div>
    </div>
  );
}