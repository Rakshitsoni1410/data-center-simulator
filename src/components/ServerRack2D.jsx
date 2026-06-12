import { useEffect, useRef } from "react";

const LEVEL_COLORS = {
  1: "#0ea5e9",
  2: "#8b5cf6",
  3: "#f59e0b",
  4: "#ec4899",
  5: "#14b8a6",
  6: "#f97316",
};

const LEVEL_NAMES = {
  1: "Basic",
  2: "Advanced",
  3: "Quantum",
  4: "Ultra",
  5: "Hyper",
  6: "GOD",
};

function healthColor(h) {
  if (h > 70) return "#22c55e";
  if (h > 40) return "#f59e0b";
  return "#ef4444";
}

function roundRect(ctx, x, y, w, h, r, fill, stroke, lineWidth = 1) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
}

export default function ServerRack2D({ servers = [], darkMode = true }) {
  const canvasRef = useRef(null);
  const tickRef = useRef(0);
  const animRef = useRef(null);
  const serversRef = useRef(servers);

  useEffect(() => { serversRef.current = servers; }, [servers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const BG = darkMode ? "#0f172a" : "#f8fafc";
    const GRID = darkMode ? "#1e293b" : "#e2e8f0";
    const TEXT = darkMode ? "#94a3b8" : "#475569";
    const TEXTBRIGHT = darkMode ? "#e2e8f0" : "#0f172a";
    const CARD = darkMode ? "#0c1525" : "#f1f5f9";
    const CARDBORDER = darkMode ? "#1e3a5f" : "#cbd5e1";

    function drawGrid(ctx, w, h) {
      ctx.strokeStyle = GRID;
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    }

    function draw() {
      const ctx = canvas.getContext("2d");
      const W = canvas.width, H = canvas.height;
      const tick = tickRef.current;
      const svs = serversRef.current;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);
      drawGrid(ctx, W, H);

      roundRect(ctx, 10, 10, W - 20, H - 20, 8, CARD, CARDBORDER, 1);

      ctx.fillStyle = TEXTBRIGHT;
      ctx.font = `500 13px sans-serif`;
      ctx.fillText(`Server Room — ${svs.length} unit${svs.length !== 1 ? "s" : ""} online`, 28, 34);

      if (svs.length === 0) {
        ctx.fillStyle = TEXT;
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("No servers yet. Buy one to get started!", W / 2, H / 2);
        ctx.textAlign = "left";
        tickRef.current++;
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const COLS = Math.min(6, svs.length);
      const GAP_X = 95, GAP_Y = 120;
      const PAD_X = 30, PAD_Y = 50;
      const W_BOX = 78, H_BOX = 90;

      svs.forEach((s, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = PAD_X + col * GAP_X;
        const y = PAD_Y + row * GAP_Y;
        const lc = LEVEL_COLORS[s.level] || "#0ea5e9";
        const pulse = Math.sin(tick * 0.05 + i * 0.7) * 0.12 + 0.88;
        const hc = healthColor(s.health);

        roundRect(ctx, x, y, W_BOX, H_BOX, 6, darkMode ? "#0f1f38" : "#e2eeff", lc + "88", 1);

        for (let u = 0; u < 4; u++) {
          const uy = y + 8 + u * 17;
          const usedRatio = (s.used || 0) / 100;
          const active = u / 4 < usedRatio;
          roundRect(ctx, x + 6, uy, W_BOX - 12, 12, 3,
            active ? lc + (darkMode ? "bb" : "88") : (darkMode ? "#1e293b" : "#cbd5e1"), null);
          if (active) {
            ctx.fillStyle = darkMode ? "#ffffff18" : "#ffffff55";
            ctx.fillRect(x + 6, uy, (W_BOX - 12) * pulse, 12);
          }
          const dotX = x + W_BOX - 10, dotY = uy + 6;
          ctx.beginPath();
          ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = active ? lc : (darkMode ? "#334155" : "#94a3b8");
          ctx.fill();
        }

        const barY = y + H_BOX - 16;
        roundRect(ctx, x + 6, barY, W_BOX - 12, 8, 2, hc + "33", null);
        roundRect(ctx, x + 6, barY, (W_BOX - 12) * (s.health / 100), 8, 2, hc, null);

        const blinkOn = Math.sin(tick * 0.12 + i) > 0.6;
        ctx.beginPath();
        ctx.arc(x + W_BOX - 8, y + 8, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = hc + (blinkOn ? "ff" : "66");
        ctx.fill();

        ctx.fillStyle = lc;
        ctx.font = "500 9px sans-serif";
        ctx.fillText(LEVEL_NAMES[s.level] || "L" + s.level, x + 6, y + H_BOX + 12);
        ctx.fillStyle = hc;
        ctx.font = "9px monospace";
        ctx.fillText(Math.round(s.health) + "%", x + W_BOX - 26, y + H_BOX + 12);
      });

      tickRef.current++;
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [darkMode]);

  const rows = Math.max(1, Math.ceil(servers.length / 6));
  const height = Math.max(200, 60 + rows * 120 + 20);

  return (
    <div>
      <canvas ref={canvasRef} width={580} height={height}
        style={{ width: "100%", borderRadius: 8, display: "block" }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
        {Object.entries(LEVEL_COLORS).map(([lvl, color]) => (
          <div key={lvl} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11,
            color: darkMode ? "#94a3b8" : "#475569" }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
            L{lvl} {LEVEL_NAMES[lvl]}
          </div>
        ))}
        {[["#22c55e", "Healthy"], ["#f59e0b", "Warn"], ["#ef4444", "Critical"]].map(([c, l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11,
            color: darkMode ? "#94a3b8" : "#475569" }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}