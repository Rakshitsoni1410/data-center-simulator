import { useEffect, useRef, useCallback } from "react";
import { BUILDINGS, GRID_COLS, GRID_ROWS } from "../data/gameData";
import { getRect, overlaps, inBounds, hitTest } from "../hooks/useGameState";

const BCOLORS = {
  SERVER: { w: "#14326e", t: "#1e4aaa", tr: "#4499ff", g: "#4499ff" },
  GPU: { w: "#360c5a", t: "#521590", tr: "#bb66ff", g: "#cc88ff" },
  STORAGE: { w: "#0a2816", t: "#124422", tr: "#44cc77", g: "#44ff88" },
  SWITCH: { w: "#0a2820", t: "#0e4038", tr: "#00ffbb", g: "#00ffcc" },
  COOLING: { w: "#0a1c3c", t: "#0c2c60", tr: "#00aaff", g: "#33ccff" },
  UPS: { w: "#281600", t: "#402400", tr: "#ffd700", g: "#ffee55" },
  SOLAR: { w: "#201a00", t: "#342c00", tr: "#ffdd00", g: "#ffee44" },
  FIREWALL: { w: "#280808", t: "#400e0e", tr: "#ff4455", g: "#ff6677" },
  GENERATOR: { w: "#1a1a00", t: "#2c2c00", tr: "#ffaa00", g: "#ffcc55" },
  HALON: { w: "#3a0808", t: "#520c0c", tr: "#ff6600", g: "#ff8833" },
};

function tempColor(t) {
  if (t > 65) return `rgba(255,20,40,${Math.min(0.8, ((t - 65) / 25) * 0.8)})`;
  if (t > 50) return `rgba(255,120,0,${((t - 50) / 20) * 0.55})`;
  if (t > 35) return `rgba(0,200,80,${((t - 35) / 20) * 0.3})`;
  if (t > 26) return `rgba(0,100,255,${((t - 26) / 12) * 0.25})`;
  return null;
}

export default function GameCanvas({ gameState }) {
  const {
    comps,
    heatMap,
    selectedId,
    tool,
    hoverCell,
    dragging,
    dragOff,
    profile,
    setSelectedId,
    setHoverCell,
    setDragging,
    setDragOff,
    tryPlace,
    demolish,
    moveComp,
    getCompTemp,
  } = gameState;

  const wrapRef = useRef(null);
  const bgRef = useRef(null);
  const uiRef = useRef(null);
  const hitRef = useRef(null);
  const animRef = useRef(0);
  const rafRef = useRef(null);
  const pktsRef = useRef([]);
  const cpsRef = useRef([]);
  const csRef = useRef(52);

  const dims = useRef({ W: 0, H: 0, cols: 0, rows: 0 });

  // ── Resize ─────────────────────────────────────────────────
  useEffect(() => {
    function resize() {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const W = wrap.clientWidth,
        H = wrap.clientHeight;
      const cs = Math.floor(Math.min(W / GRID_COLS, H / GRID_ROWS));
      csRef.current = Math.max(36, Math.min(cs, 56));
      const CS = csRef.current;
      dims.current = {
        W: GRID_COLS * CS,
        H: GRID_ROWS * CS,
        cols: GRID_COLS,
        rows: GRID_ROWS,
      };
      [bgRef, uiRef, hitRef].forEach((r) => {
        if (r.current) {
          r.current.width = GRID_COLS * CS;
          r.current.height = GRID_ROWS * CS;
        }
      });
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ── Input ──────────────────────────────────────────────────
  const cellFrom = useCallback((e) => {
    const CS = csRef.current;
    const rect = hitRef.current?.getBoundingClientRect();
    if (!rect) return { col: 0, row: 0 };
    return {
      col: Math.floor((e.clientX - rect.left) / CS),
      row: Math.floor((e.clientY - rect.top) / CS),
    };
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      const { col, row } = cellFrom(e);
      setHoverCell({ col, row });
      if (dragging) {
        const comp = comps.find((c) => c.id === dragging);
        if (comp) moveComp(dragging, col - dragOff.dc, row - dragOff.dr);
      }
    },
    [cellFrom, dragging, dragOff, comps, moveComp, setHoverCell],
  );

  const handleMouseDown = useCallback(
    (e) => {
      const { col, row } = cellFrom(e);
      if (e.button === 2) {
        const hit = hitTest(comps, col, row);
        if (hit) demolish(hit.id);
        return;
      }
      if (tool === "select") {
        const hit = hitTest(comps, col, row);
        if (hit) {
          setSelectedId(hit.id);
          setDragging(hit.id);
          setDragOff({ dc: col - hit.col, dr: row - hit.row });
        } else setSelectedId(null);
        return;
      }
      if (tool === "delete") {
        const hit = hitTest(comps, col, row);
        if (hit) demolish(hit.id);
        return;
      }
      if (BUILDINGS[tool]) tryPlace(tool, col, row);
    },
    [
      cellFrom,
      tool,
      comps,
      setSelectedId,
      setDragging,
      setDragOff,
      tryPlace,
      demolish,
      dragOff,
    ],
  );

  // ── Draw ────────────────────────────────────────────────────
  useEffect(() => {
    function drawFloor(ctx, CS, cols, rows) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * CS,
            y = r * CS;
          ctx.fillStyle = (r + c) % 2 === 0 ? "#0b130b" : "#0d160d";
          ctx.fillRect(x, y, CS, CS);
          ctx.strokeStyle = "#121c12";
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, CS - 1, CS - 1);
          ctx.fillStyle = "#182518";
          [
            [0, 0],
            [CS - 3, 0],
            [0, CS - 3],
            [CS - 3, CS - 3],
          ].forEach(([ox, oy]) => ctx.fillRect(x + ox, y + oy, 3, 3));
        }
      }
    }

    function drawHeat(ctx, hm, CS, cols, rows) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const t = hm[`${c},${r}`] || 20;
          const col = tempColor(t);
          if (col) {
            ctx.fillStyle = col;
            ctx.fillRect(c * CS, r * CS, CS, CS);
          }
        }
      }
    }

    function drawBuilding(ctx, comp, CS, isSel, anim, co) {
      const d = BUILDINGS[comp.type],
        cc = BCOLORS[comp.type];
      const x = comp.col * CS,
        y = comp.row * CS,
        bw = d.w * CS,
        bh = d.h * CS;
      const t = getCompTemp(comp),
        oh = t > 56 && comp.type !== "COOLING";

      // shadow
      ctx.fillStyle = "rgba(0,0,0,.55)";
      ctx.fillRect(x + 5, y + 5, bw - 5, bh - 5);

      // body
      const g = ctx.createLinearGradient(x, y, x + bw, y + bh);
      g.addColorStop(0, cc.t);
      g.addColorStop(0.6, cc.w);
      g.addColorStop(1, cc.w + "99");
      ctx.fillStyle = g;
      ctx.fillRect(x + 1, y + 1, bw - 2, bh - 2);

      // rack panel lines
      if (["SERVER", "GPU", "STORAGE"].includes(comp.type)) {
        ctx.fillStyle = "rgba(0,0,0,.22)";
        const rows = Math.floor((bh - 14) / 8);
        for (let ri = 0; ri < rows; ri++)
          ctx.fillRect(x + 6, y + 5 + ri * 8, bw - 12, 5);
        ctx.fillStyle = "rgba(0,0,0,.4)";
        for (let vi = 0; vi < 3; vi++)
          for (let vj = 0; vj < Math.floor(bw / 14); vj++)
            ctx.fillRect(x + 8 + vj * 14, y + bh - 22 + vi * 5, 8, 3);
      }

      // top highlight
      const tg = ctx.createLinearGradient(x, y, x, y + 6);
      tg.addColorStop(0, cc.tr + "66");
      tg.addColorStop(1, "transparent");
      ctx.fillStyle = tg;
      ctx.fillRect(x + 1, y + 1, bw - 2, 6);
      // left accent
      ctx.fillStyle = cc.tr;
      ctx.fillRect(x + 1, y + 4, 3, bh - 8);
      // border
      ctx.strokeStyle = cc.tr + "55";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, bw - 2, bh - 2);

      // CRAC fan
      if (comp.type === "COOLING") {
        const fcx = x + bw / 2,
          fcy = y + bh / 2 - 6;
        ctx.save();
        ctx.translate(fcx, fcy);
        ctx.rotate(anim * 0.15 * comp.load);
        ctx.strokeStyle = cc.tr;
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          ctx.save();
          ctx.rotate((i * Math.PI) / 2);
          ctx.beginPath();
          ctx.ellipse(9, 0, 9, 4.5, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
        const fg = ctx.createRadialGradient(fcx, fcy, 0, fcx, fcy, 22);
        fg.addColorStop(0, cc.g + "22");
        fg.addColorStop(1, "transparent");
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(fcx, fcy, 22, 0, Math.PI * 2);
        ctx.fill();
      }

      // solar shimmer + grid
      if (comp.type === "SOLAR") {
        ctx.fillStyle = `rgba(255,210,0,${0.04 + 0.07 * Math.abs(Math.sin(anim * 0.06))})`;
        ctx.fillRect(x + 1, y + 1, bw - 2, bh - 2);
        ctx.strokeStyle = "rgba(0,0,0,.3)";
        ctx.lineWidth = 1;
        const cw = (bw - 4) / 4,
          ch = (bh - 4) / 2;
        for (let ci = 0; ci <= 4; ci++) {
          ctx.beginPath();
          ctx.moveTo(x + 2 + ci * cw, y + 2);
          ctx.lineTo(x + 2 + ci * cw, y + bh - 2);
          ctx.stroke();
        }
        for (let ri = 0; ri <= 2; ri++) {
          ctx.beginPath();
          ctx.moveTo(x + 2, y + 2 + ri * ch);
          ctx.lineTo(x + bw - 2, y + 2 + ri * ch);
          ctx.stroke();
        }
      }

      // company watermark on server
      if (comp.type === "SERVER" && co) {
        ctx.font = `${Math.max(5, CS * 0.09)}px 'Press Start 2P', monospace`;
        ctx.fillStyle = "rgba(255,255,255,.1)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          co.substring(0, 6).toUpperCase(),
          x + bw / 2,
          y + bh * 0.58,
        );
      }

      // icon
      ctx.font = `${Math.min(bw, bh) * 0.32}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = 0.88;
      ctx.fillText(d.icon, x + bw / 2, y + bh * 0.36);
      ctx.globalAlpha = 1;

      // LEDs
      const ly = y + bh - 10,
        ln = Math.min(5, Math.floor(bw / 12));
      for (let li = 0; li < ln; li++) {
        const lx = x + 7 + li * 11,
          on = Math.sin(anim * 0.18 + comp.id * 0.9 + li * 1.5) > 0.1;
        ctx.fillStyle = on ? cc.tr : "#141e14";
        ctx.fillRect(lx, ly, 5, 4);
        if (on) {
          ctx.fillStyle = cc.g + "55";
          ctx.fillRect(lx - 2, ly - 2, 9, 8);
        }
      }

      // load bar
      const by = y + bh - 5;
      ctx.fillStyle = "#050a05";
      ctx.fillRect(x + 4, by, bw - 8, 4);
      ctx.fillStyle =
        comp.load > 0.85 ? "#ff2244" : comp.load > 0.65 ? "#ffe000" : "#39ff14";
      ctx.fillRect(x + 4, by, (bw - 8) * comp.load, 4);

      // level badge
      if (comp.level > 1) {
        ctx.fillStyle = cc.tr;
        ctx.font = `bold ${Math.max(5, CS * 0.11)}px 'Press Start 2P', monospace`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("★" + comp.level, x + 4, y + 2);
      }

      // overheat
      if (oh) {
        const p = 0.3 + 0.55 * Math.abs(Math.sin(anim * 0.24));
        ctx.strokeStyle = `rgba(255,30,50,${p})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x + 1, y + 1, bw - 2, bh - 2);
        ctx.setLineDash([]);
        ctx.font = "12px serif";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillText("🔥", x + bw - 1, y + 1);
      }

      // selection
      if (isSel) {
        const p = 0.35 + 0.4 * Math.sin(anim * 0.12);
        ctx.strokeStyle = `rgba(57,255,20,${p})`;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(x - 0.5, y - 0.5, bw + 1, bh + 1);
        ctx.strokeStyle = "#39ff14";
        ctx.lineWidth = 2;
        [
          [0, 0],
          [bw - 9, 0],
          [0, bh - 9],
          [bw - 9, bh - 9],
        ].forEach(([ox, oy]) => ctx.strokeRect(x + ox, y + oy, 9, 9));
      }
    }

    function drawPackets(ctx, comps, pkts, anim, CS) {
      const sws = comps.filter((c) => c.type === "SWITCH"),
        srvs = comps.filter((c) => ["SERVER", "GPU"].includes(c.type));
      if (!sws.length || !srvs.length) return;
      if (pkts.length < 40 && Math.random() < 0.15) {
        const sw = sws[Math.floor(Math.random() * sws.length)],
          srv = srvs[Math.floor(Math.random() * srvs.length)];
        const sd = BUILDINGS[sw.type];
        pkts.push({
          x: sw.col * CS + (sd.w * CS) / 2,
          y: sw.row * CS + (sd.h * CS) / 2,
          tx: srv.col * CS + (BUILDINGS[srv.type].w * CS) / 2,
          ty: srv.row * CS + (BUILDINGS[srv.type].h * CS) / 2,
          t: 0,
          s: 0.025 + Math.random() * 0.02,
        });
      }
      for (let i = pkts.length - 1; i >= 0; i--) {
        const p = pkts[i];
        p.t += p.s;
        if (p.t >= 1) {
          pkts.splice(i, 1);
          continue;
        }
        const px = p.x + (p.tx - p.x) * p.t,
          py = p.y + (p.ty - p.y) * p.t;
        ctx.strokeStyle = "rgba(0,170,255,.12)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.tx, p.ty);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#00ddff";
        ctx.shadowColor = "#00ddff";
        ctx.shadowBlur = 5;
        ctx.fillRect(px - 2, py - 2, 4, 4);
        ctx.shadowBlur = 0;
      }
    }

    function drawCoolParticles(ctx, comps, cps, anim, CS) {
      comps
        .filter((c) => c.type === "COOLING")
        .forEach((comp) => {
          if (anim % 4 === 0 && comp.load > 0.2 && cps.length < 45) {
            const d = BUILDINGS.COOLING;
            cps.push({
              x:
                comp.col * CS +
                (d.w * CS) / 2 +
                (Math.random() - 0.5) * CS * 0.5,
              y: comp.row * CS + d.h * CS,
              vy: -0.55 - Math.random() * 0.35,
              vx: (Math.random() - 0.5) * 0.25,
              life: 38,
              a: 0.65,
            });
          }
        });
      for (let i = cps.length - 1; i >= 0; i--) {
        const p = cps[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.a -= 0.017;
        if (p.life <= 0) {
          cps.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `rgba(0,185,255,${p.a})`;
        ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
      }
    }

    function frame() {
      animRef.current++;
      const anim = animRef.current;
      const CS = csRef.current;
      const { W, H, cols, rows } = dims.current;
      const bg = bgRef.current,
        ui = uiRef.current;
      if (!bg || !ui) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }
      const bgC = bg.getContext("2d"),
        uiC = ui.getContext("2d");

      bgC.clearRect(0, 0, W, H);
      drawFloor(bgC, CS, GRID_COLS, GRID_ROWS);
      drawHeat(bgC, heatMap, CS, GRID_COLS, GRID_ROWS);

      uiC.clearRect(0, 0, W, H);
      drawPackets(uiC, comps, pktsRef.current, anim, CS);
      drawCoolParticles(uiC, comps, cpsRef.current, anim, CS);
      comps.forEach((c) =>
        drawBuilding(
          uiC,
          c,
          CS,
          c.id === selectedId,
          anim,
          profile?.company || "",
        ),
      );

      // ghost placement
      if (hoverCell && BUILDINGS[tool]) {
        const { col, row } = hoverCell,
          d = BUILDINGS[tool];
        const ok =
          inBounds(tool, col, row) &&
          !comps.some((c) => overlaps(c, { type: tool, col, row }));
        uiC.setLineDash([5, 4]);
        uiC.strokeStyle = ok ? "#39ff1488" : "#ff224488";
        uiC.lineWidth = 2;
        uiC.strokeRect(col * CS + 1, row * CS + 1, d.w * CS - 2, d.h * CS - 2);
        uiC.setLineDash([]);
        if (ok) {
          uiC.fillStyle = "#39ff1410";
          uiC.fillRect(col * CS + 1, row * CS + 1, d.w * CS - 2, d.h * CS - 2);
          uiC.font = `5px 'Press Start 2P', monospace`;
          uiC.fillStyle = "#39ff14";
          uiC.textAlign = "center";
          uiC.fillText(
            "$" + BUILDINGS[tool].cost,
            col * CS + (d.w * CS) / 2,
            row * CS + (d.h * CS) / 2,
          );
        }
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [comps, heatMap, selectedId, tool, hoverCell, profile, getCompTemp]);

  const CS = csRef.current;

  return (
    <div
      ref={wrapRef}
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        background: "#050a05",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
      }}
    >
      <canvas
        ref={bgRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          imageRendering: "pixelated",
        }}
      />
      <canvas
        ref={uiRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          imageRendering: "pixelated",
          pointerEvents: "none",
        }}
      />
      <canvas
        ref={hitRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: 0,
          cursor:
            tool === "delete"
              ? "crosshair"
              : tool === "select"
                ? "default"
                : "cell",
        }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={() => setDragging(null)}
        onMouseLeave={() => {
          setDragging(null);
          setHoverCell(null);
        }}
        onContextMenu={(e) => e.preventDefault()}
      />
      {/* Delete overlay */}
      {tool === "delete" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "3px dashed #ff2244",
            background: "#ff224408",
            pointerEvents: "none",
          }}
        />
      )}
      {/* Company floor stamp */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          right: 12,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 6,
          color: "#141e14",
          pointerEvents: "none",
          letterSpacing: 2,
        }}
      >
        {profile?.company?.toUpperCase()} DATA DIVISION
      </div>
    </div>
  );
}
