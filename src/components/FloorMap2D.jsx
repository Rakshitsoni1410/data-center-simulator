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

export default function FloorMap2D({
  servers = [],
  clients = [],
  employees = [],
  cooling = 1,
  security = 1,
  temperature = 20,
  darkMode = true,
}) {
  const canvasRef = useRef(null);
  const tickRef = useRef(0);
  const animRef = useRef(null);
  const stateRef = useRef({ servers, clients, employees, cooling, security, temperature });

  useEffect(() => {
    stateRef.current = { servers, clients, employees, cooling, security, temperature };
  }, [servers, clients, employees, cooling, security, temperature]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const BG = darkMode ? "#0f172a" : "#f8fafc";
    const FLOOR = darkMode ? "#0a1628" : "#f0f4f8";
    const FLOORBORDER = darkMode ? "#1e3a5f" : "#94a3b8";
    const TEXT = darkMode ? "#94a3b8" : "#475569";
    const TEXTBRIGHT = darkMode ? "#e2e8f0" : "#0f172a";

    function draw() {
      const ctx = canvas.getContext("2d");
      const W = canvas.width, H = canvas.height;
      const tick = tickRef.current;
      const { servers, clients, cooling, security, temperature } = stateRef.current;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      roundRect(ctx, 10, 10, W - 20, H - 20, 8, FLOOR, FLOORBORDER, 1);

      ctx.fillStyle = TEXTBRIGHT;
      ctx.font = "500 13px sans-serif";
      ctx.fillText("Datacenter Floor Map — Top View", 28, 34);

      const rowColors = ["#0369a1", "#1d4ed8", "#0369a1"];
      const rowLabels = ["Server Row A", "Server Row B", "Server Row C"];
      const rowYs = [48, 118, 188];

      rowYs.forEach((ry, ri) => {
        const rc = rowColors[ri];
        roundRect(ctx, 22, ry, W - 44, 58, 4, rc + "22", rc + "55", 1);
        const maxSlots = Math.min(13, Math.floor((W - 80) / 42));
        const rowServers = servers.slice(ri * maxSlots, (ri + 1) * maxSlots);
        for (let i = 0; i < maxSlots; i++) {
          const sx = 30 + i * 42, sy = ry + 7;
          const srv = rowServers[i];
          if (srv) {
            const pulse = Math.sin(tick * 0.06 + i * 0.5) > 0;
            roundRect(ctx, sx, sy, 36, 40, 3, rc + "55", rc + "99", 1);
            ctx.fillStyle = pulse ? rc + "cc" : rc + "55";
            ctx.beginPath(); ctx.arc(sx + 18, sy + 10, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = TEXT; ctx.font = "8px monospace";
            ctx.fillText("SRV", sx + 7, sy + 25);
            ctx.fillText(String(i + 1 + ri * maxSlots).padStart(2, "0"), sx + 9, sy + 34);
          } else {
            roundRect(ctx, sx, sy, 36, 40, 3, darkMode ? "#1e293b33" : "#e2e8f033", darkMode ? "#33415533" : "#cbd5e133", 1);
          }
        }
        ctx.fillStyle = rc; ctx.font = "500 10px sans-serif";
        ctx.fillText(rowLabels[ri], 30, ry + 54);
      });

      const units = [
        { x: 22, y: 262, w: 108, h: 52, label: "Cooling ×" + cooling, color: "#0369a1", icon: "❄" },
        { x: 138, y: 262, w: 108, h: 52, label: "Cooling B", color: "#0369a1", icon: "❄" },
        { x: 320, y: 262, w: 100, h: 52, label: "UPS Power", color: "#7c3aed", icon: "⚡" },
        { x: 428, y: 262, w: 100, h: 52, label: "UPS Backup", color: "#7c3aed", icon: "⚡" },
        { x: 22, y: 328, w: 100, h: 55, label: "Security ×" + security, color: "#b45309", icon: "🛡" },
        { x: 130, y: 328, w: 100, h: 55, label: "Net Core", color: "#15803d", icon: "🌐" },
        { x: 238, y: 328, w: 120, h: 55, label: "Generator", color: "#9f1239", icon: "🔋" },
        { x: 366, y: 328, w: 130, h: 55, label: "Fire Sys", color: "#92400e", icon: "🚿" },
        { x: 260, y: 262, w: 52, h: 52, label: "Temp", color: temperature > 70 ? "#ef4444" : temperature > 50 ? "#f59e0b" : "#22c55e", icon: "🌡" },
      ];

      units.forEach((u) => {
        const pulse = Math.sin(tick * 0.04) * 0.3 + 0.7;
        roundRect(ctx, u.x, u.y, u.w, u.h, 6, u.color + "22", u.color + (pulse > 0.8 ? "88" : "55"), 1);
        ctx.font = "16px serif"; ctx.fillText(u.icon, u.x + 7, u.y + 22);
        ctx.fillStyle = u.color; ctx.font = "500 9px sans-serif";
        ctx.fillText(u.label, u.x + 5, u.y + u.h - 7);
        if (u.label.includes("Temp")) {
          ctx.fillStyle = u.color; ctx.font = "500 10px monospace";
          ctx.fillText(Math.round(temperature) + "°", u.x + 10, u.y + 38);
        }
      });

      ctx.strokeStyle = darkMode ? "#22d3ee33" : "#0369a133";
      ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      const cableX = 22 + (W - 44) / 2;
      ctx.beginPath(); ctx.moveTo(cableX, 48); ctx.lineTo(cableX, 255); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = TEXT; ctx.font = "9px sans-serif";
      ctx.fillText("cable tray", cableX - 22, 46);

      const legend = [
        { label: `Clients: ${clients.length}`, color: "#8b5cf6" },
        { label: `Temp: ${Math.round(temperature)}°C`, color: temperature > 70 ? "#ef4444" : "#22c55e" },
        { label: `Cooling: ${cooling}`, color: "#0369a1" },
        { label: `Security: ${security}`, color: "#b45309" },
      ];
      legend.forEach((l, i) => {
        roundRect(ctx, 22 + i * 120, H - 28, 112, 18, 3, l.color + "22", l.color + "55", 1);
        ctx.fillStyle = l.color; ctx.font = "500 10px sans-serif";
        ctx.fillText(l.label, 30 + i * 120, H - 14);
      });

      tickRef.current++;
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [darkMode]);

  return (
    <canvas ref={canvasRef} width={580} height={400}
      style={{ width: "100%", borderRadius: 8, display: "block" }} />
  );
}