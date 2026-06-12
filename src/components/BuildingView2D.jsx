import { useEffect, useRef } from "react";

function roundRect(ctx, x, y, w, h, r, fill, stroke, lw = 1) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

export default function BuildingView2D({
  servers = [],
  money = 0,
  temperature = 20,
  cooling = 1,
  security = 1,
  electricity = 0,
  employees = [],
  clients = [],
  darkMode = true,
}) {
  const canvasRef = useRef(null);
  const tickRef = useRef(0);
  const animRef = useRef(null);
  const stateRef = useRef({ servers, money, temperature, cooling, security, electricity, employees, clients });

  useEffect(() => {
    stateRef.current = { servers, money, temperature, cooling, security, electricity, employees, clients };
  }, [servers, money, temperature, cooling, security, electricity, employees, clients]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const BG = darkMode ? "#0f172a" : "#f8fafc";
    const TEXT = darkMode ? "#94a3b8" : "#475569";
    const TEXTBRIGHT = darkMode ? "#e2e8f0" : "#0f172a";

    function draw() {
      const ctx = canvas.getContext("2d");
      const W = canvas.width, H = canvas.height;
      const tick = tickRef.current;
      const { servers, money, temperature, cooling, security, electricity, employees, clients } = stateRef.current;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      const FLOORS = [
        {
          y: 18, h: 75,
          color: "#1e3a5f", accent: "#0ea5e9",
          label: "Floor 3 — Server Rooms",
          sub: `${servers.length} servers · ${Math.round(temperature)}°C avg · ${clients.length} clients`,
          units: servers.slice(0, 11),
          unitColor: "#0ea5e9",
        },
        {
          y: 103, h: 75,
          color: "#0c4a6e", accent: "#38bdf8",
          label: "Floor 2 — Network / Admin / NOC",
          sub: `Security lv.${security} · ${employees.length} employees`,
          units: Array(8).fill({ active: true }),
          unitColor: "#38bdf8",
        },
        {
          y: 188, h: 75,
          color: "#14532d", accent: "#22c55e",
          label: "Floor 1 — Power / UPS / Generators",
          sub: `Electricity: ${Math.round(electricity)}kW · Cooling lv.${cooling}`,
          units: Array(6).fill({ active: true }),
          unitColor: "#22c55e",
        },
        {
          y: 273, h: 75,
          color: "#1c1917", accent: "#06b6d4",
          label: "Basement — Chillers / Cooling Plant",
          sub: `${cooling} active chillers · ${Math.round(temperature > 60 ? temperature * 1.2 : temperature)}°F ambient`,
          units: Array(4).fill({ active: temperature < 80 }),
          unitColor: "#06b6d4",
        },
      ];

      roundRect(ctx, 10, 10, W - 20, H - 45, 10, darkMode ? "#0a1628" : "#f0f4f8", darkMode ? "#1e3a5f" : "#94a3b8", 1);

      FLOORS.forEach((f, fi) => {
        roundRect(ctx, 18, f.y, W - 56, f.h, 4, f.color, f.accent + "55", 1);

        const maxUnits = Math.min(f.units.length, 11);
        const slotW = Math.floor((W - 120) / maxUnits);
        for (let i = 0; i < maxUnits; i++) {
          const ux = 26 + i * slotW, uy = f.y + 10;
          const srv = f.units[i];
          const isActive = srv && (srv.health === undefined ? true : srv.health > 0);
          const pulse = Math.sin(tick * 0.06 + i * 0.8 + fi * 1.2) > 0;

          roundRect(ctx, ux, uy, slotW - 4, f.h - 24, 3,
            isActive ? f.unitColor + "33" : (darkMode ? "#ffffff08" : "#00000008"),
            isActive ? f.unitColor + (pulse ? "88" : "44") : (darkMode ? "#33415533" : "#cbd5e133"), 1);

          if (isActive) {
            for (let led = 0; led < 3; led++) {
              const on = Math.sin(tick * 0.1 + i * 0.6 + led * 2.1 + fi) > 0.3;
              ctx.beginPath();
              ctx.arc(ux + (slotW - 4) / 2, uy + 8 + led * 10, 2.5, 0, Math.PI * 2);
              ctx.fillStyle = on ? f.unitColor : f.unitColor + "33";
              ctx.fill();
            }
            if (srv && srv.level) {
              ctx.fillStyle = f.unitColor; ctx.font = "7px monospace";
              ctx.fillText("L" + srv.level, ux + 2, uy + f.h - 28);
            }
          }
        }

        ctx.fillStyle = f.accent; ctx.font = "500 11px sans-serif";
        ctx.fillText(f.label, 28, f.y + f.h - 18);
        ctx.fillStyle = TEXT; ctx.font = "10px sans-serif";
        ctx.fillText(f.sub, 28, f.y + f.h - 6);

        ctx.fillStyle = f.accent + "cc"; ctx.font = "500 10px monospace";
        ctx.fillText("F" + (4 - fi), W - 42, f.y + f.h / 2 + 4);
      });

      roundRect(ctx, 18, 358, W - 56, 28, 4, darkMode ? "#374151" : "#e2e8f0", darkMode ? "#4b5563" : "#94a3b8", 1);
      ctx.fillStyle = TEXTBRIGHT; ctx.font = "500 11px sans-serif";
      ctx.fillText("Ground Level — Entry / Security / Loading", 30, 376);

      const pipeColors = ["#0369a1", "#7c3aed", "#22c55e"];
      pipeColors.forEach((pc, pi) => {
        const px = W - 36 + pi * 8;
        roundRect(ctx, px, 103, 6, 258, 3, pc + "44", pc + "88", 1);
        const flowY = ((tick * 2 + pi * 30) % 240) + 103;
        ctx.beginPath(); ctx.arc(px + 3, flowY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = pc; ctx.fill();
      });

      ctx.save(); ctx.translate(W - 22, 240); ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = TEXT; ctx.font = "9px sans-serif";
      ctx.fillText("power / data / cooling", 0, 0);
      ctx.restore();

      const statusItems = [
        { label: `$${Math.round(money).toLocaleString()}`, color: "#22c55e", icon: "💰" },
        { label: `${Math.round(temperature)}°C`, color: temperature > 70 ? "#ef4444" : temperature > 50 ? "#f59e0b" : "#22c55e", icon: "🌡" },
        { label: `${Math.round(electricity)}kW`, color: "#f59e0b", icon: "⚡" },
        { label: `${clients.length} clients`, color: "#8b5cf6", icon: "🌐" },
      ];
      statusItems.forEach((s, i) => {
        const sx = 18 + i * 130;
        roundRect(ctx, sx, H - 32, 122, 22, 3, s.color + "22", s.color + "44", 1);
        ctx.fillStyle = s.color; ctx.font = "500 10px sans-serif";
        ctx.fillText(s.icon + " " + s.label, sx + 8, H - 17);
      });

      tickRef.current++;
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [darkMode]);

  return (
    <div>
      <canvas ref={canvasRef} width={580} height={430}
        style={{ width: "100%", borderRadius: 8, display: "block" }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
        {[
          ["#1e3a5f", "Server Rooms (F3)"],
          ["#0c4a6e", "Network / Admin (F2)"],
          ["#14532d", "Power / UPS (F1)"],
          ["#1c1917", "Cooling Basement"],
        ].map(([c, l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11,
            color: darkMode ? "#94a3b8" : "#475569" }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: c, border: "1px solid #334155" }} />
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}