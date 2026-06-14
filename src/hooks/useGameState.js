import { useState, useEffect, useRef, useCallback } from 'react';
import { BUILDINGS, EVENTS, ACHIEVEMENTS, GRID_COLS, GRID_ROWS } from '../data/gameData';

let _idCounter = 1;
const mkId = () => _idCounter++;

// ─── Geometry helpers ─────────────────────────────────────────
export function getRect(comp) {
  const d = BUILDINGS[comp.type];
  return { col: comp.col, row: comp.row, w: d.w, h: d.h };
}

export function overlaps(a, b) {
  const ar = getRect(a), br = getRect(b);
  return !(ar.col + ar.w <= br.col || br.col + br.w <= ar.col ||
           ar.row + ar.h <= br.row || br.row + br.h <= ar.row);
}

export function inBounds(type, col, row) {
  const d = BUILDINGS[type];
  return col >= 0 && row >= 0 && col + d.w <= GRID_COLS && row + d.h <= GRID_ROWS;
}

export function hitTest(comps, col, row) {
  return comps.find(c => {
    const r = getRect(c);
    return col >= r.col && col < r.col + r.w && row >= r.row && row < r.row + r.h;
  });
}

// ─── Heat map ─────────────────────────────────────────────────
export function buildHeatMap(comps) {
  const m = {};
  for (let r = 0; r < GRID_ROWS; r++)
    for (let c = 0; c < GRID_COLS; c++)
      m[`${c},${r}`] = 20;

  comps.forEach(comp => {
    const d = BUILDINGS[comp.type];
    if (d.heat > 0) {
      const emit = d.heat * comp.load * comp.level;
      for (let dr = -6; dr <= d.h + 5; dr++) {
        for (let dc = -6; dc <= d.w + 5; dc++) {
          const cr = comp.row + dr, cc = comp.col + dc;
          if (cr < 0 || cr >= GRID_ROWS || cc < 0 || cc >= GRID_COLS) continue;
          const dist = Math.hypot(Math.max(0, dr), Math.max(0, dc));
          m[`${cc},${cr}`] = (m[`${cc},${cr}`] || 20) + emit * Math.max(0, 1 - dist / 7) * 3.5;
        }
      }
    }
    if (comp.type === 'COOLING') {
      const cool = d.cool * comp.load * comp.level;
      for (let dr = -7; dr <= d.h + 6; dr++) {
        for (let dc = -7; dc <= d.w + 6; dc++) {
          const cr = comp.row + dr, cc = comp.col + dc;
          if (cr < 0 || cr >= GRID_ROWS || cc < 0 || cc >= GRID_COLS) continue;
          const dist = Math.hypot(Math.max(0, dr), Math.max(0, dc));
          const key = `${cc},${cr}`;
          m[key] = Math.max(14, (m[key] || 20) - cool * Math.max(0, 1 - dist / 8) * 2.8);
        }
      }
    }
  });
  return m;
}

// ─── Metrics calculation ──────────────────────────────────────
export function calcMetrics(comps, upgrades, activeBoosts) {
  let rev = 0, power = 0, sec = 0;
  const ups = new Set(upgrades);

  comps.forEach(c => {
    const d = BUILDINGS[c.type];
    let r = d.rev * c.load * c.level * c.uptime;

    if (c.type === 'SERVER' && ups.has('fiber')) r *= 1.25;
    if (c.type === 'GPU' && ups.has('turbo')) r *= 1.3;
    if (c.type === 'STORAGE' && ups.has('nvme')) r *= 1.15;
    if (ups.has('fiber') && ['SERVER', 'GPU'].includes(c.type)) r *= 1.25;

    rev += r;
    power += d.power * c.load;
    sec += d.sec * c.level;
  });

  if (ups.has('green')) rev += 500;
  activeBoosts?.forEach(b => { if (b.type === 'rev_boost') rev *= b.val; });

  const heatMap = buildHeatMap(comps);
  const temps = Object.values(heatMap);
  const avgTemp = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : 20;

  const itPow = comps
    .filter(c => ['SERVER', 'GPU', 'STORAGE', 'SWITCH'].includes(c.type))
    .reduce((s, c) => s + BUILDINGS[c.type].power * c.load, 0);
  const pue = itPow > 0 ? Math.max(1, power / itPow) : 2.5;

  const avgUptime = comps.length ? comps.reduce((a, c) => a + c.uptime, 0) / comps.length : 1;
  const score = Math.min(100,
    rev * 1.5 + sec * 3 - Math.max(0, avgTemp - 28) * 2 - (pue - 1) * 8 + avgUptime * 10
  );
  const rating = score > 90 ? 'S+' : score > 75 ? 'A' : score > 60 ? 'B' : score > 45 ? 'C' : score > 30 ? 'D' : 'F';

  return { rev, power, pue, temp: avgTemp, sec, rating, score, avgUptime, heatMap };
}

// ─── Main hook ────────────────────────────────────────────────
export default function useGameState() {
  const [phase, setPhase] = useState('intro'); // intro | game
  const [profile, setProfile] = useState(null);

  const [comps, setComps] = useState([]);
  const [money, setMoney] = useState(5000);
  const [totalEarned, setTotalEarned] = useState(0);
  const [upgrades, setUpgrades] = useState([]);
  const [activeContracts, setActiveContracts] = useState([]);
  const [completedContracts, setCompletedContracts] = useState(0);
  const [log, setLog] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [events, setEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [activeBoosts, setActiveBoosts] = useState([]);
  const [speed, setSpeed] = useState(1);
  const [tick, setTick] = useState(0);

  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState('select');
  const [hoverCell, setHoverCell] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [dragOff, setDragOff] = useState({ dc: 0, dr: 0 });

  const metrics = calcMetrics(comps, upgrades, activeBoosts);
  const heatMap = metrics.heatMap;

  // ─── Logging ──────────────────────────────────────────────
  const addLog = useCallback((msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLog(l => [{ msg, type, ts, id: mkId() }, ...l].slice(0, 60));
  }, []);

  const addToast = useCallback((msg, type = '') => {
    const id = mkId();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  // ─── Place component ──────────────────────────────────────
  const placeComp = useCallback((type, col, row) => {
    const d = BUILDINGS[type];
    const c = { id: mkId(), type, col, row, load: 0.4 + Math.random() * 0.3, level: 1, uptime: 1 };
    setComps(prev => [...prev, c]);
    return c;
  }, []);

  // ─── Init game ────────────────────────────────────────────
  const startGame = useCallback((prof) => {
    setProfile(prof);
    let startMoney = 5000;
    if (prof.startBonus?.type === 'startMoney') startMoney += prof.startBonus.val;

    setMoney(startMoney);
    setComps([]);
    setUpgrades([]);
    setActiveContracts([]);
    setLog([]);
    setTick(0);

    // Starter pack
    setTimeout(() => {
      setComps([
        { id: mkId(), type: 'SERVER',  col: 3,  row: 1,  load: 0.6, level: 1, uptime: 1 },
        { id: mkId(), type: 'SERVER',  col: 3,  row: 4,  load: 0.5, level: 1, uptime: 1 },
        { id: mkId(), type: 'SWITCH',  col: 5,  row: 2,  load: 0.4, level: 1, uptime: 1 },
        { id: mkId(), type: 'STORAGE', col: 7,  row: 1,  load: 0.5, level: 1, uptime: 1 },
        { id: mkId(), type: 'COOLING', col: 10, row: 1,  load: 0.8, level: 1, uptime: 1 },
        { id: mkId(), type: 'UPS',     col: 12, row: 1,  load: 0.5, level: 1, uptime: 1 },
      ]);
    }, 0);

    setPhase('game');
    addLog(`Systems online. Welcome, ${prof.name}!`, 'good');
    addLog('Tip: Keep servers cool with CRAC units.', 'info');
    addLog('Right-click any building to demolish.', 'info');
  }, [addLog]);

  // ─── Simulation tick ─────────────────────────────────────
  useEffect(() => {
    if (phase !== 'game') return;
    const interval = setInterval(() => {
      setTick(t => t + 1);

      setComps(prev => prev.map(c => {
        const noise = (Math.random() - 0.5) * 0.04;
        const load = Math.max(0.08, Math.min(0.99, c.load + noise));
        const temp = (() => {
          const hm = buildHeatMap(prev);
          const d = BUILDINGS[c.type]; let s = 0, n = 0;
          for (let dr = 0; dr < d.h; dr++)
            for (let dc = 0; dc < d.w; dc++) { s += hm[`${c.col+dc},${c.row+dr}`] || 20; n++; }
          return s / Math.max(1, n);
        })();
        const uptime = temp > 62 && c.type !== 'COOLING'
          ? Math.max(0.5, c.uptime - 0.003)
          : Math.min(1, c.uptime + 0.001);
        return { ...c, load, uptime };
      }));

      setMoney(prev => {
        const m = calcMetrics([], [], []);
        return prev;
      });

      // random events
      if (Math.random() < 0.004 * speed) {
        const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
        triggerEvent(ev);
      }
    }, 1000 / speed);
    return () => clearInterval(interval);
  }, [phase, speed]);

  // Earn money every second
  useEffect(() => {
    if (phase !== 'game') return;
    const interval = setInterval(() => {
      const earned = Math.max(0, metrics.rev) * speed;
      setMoney(m => m + earned);
      setTotalEarned(t => t + earned);

      // Contract progress
      setActiveContracts(prev => prev.map(c => ({
        ...c,
        progress: Math.min(c.duration, (c.progress || 0) + speed),
      })).filter(c => {
        if (c.progress >= c.duration) {
          const reward = c.reward * (upgrades.includes('backup') ? 2 : 1);
          setMoney(m => m + reward);
          setTotalEarned(t => t + reward);
          addLog(`✅ Contract "${c.name}" completed! +$${reward}`, 'good');
          addToast(`✅ +$${reward} from ${c.name}`, '');
          setCompletedContracts(n => n + 1);
          return false;
        }
        return true;
      }));

      // Boosts timer
      setActiveBoosts(prev => prev
        .map(b => ({ ...b, remaining: b.remaining - speed }))
        .filter(b => b.remaining > 0)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, speed, metrics.rev, upgrades, addLog, addToast]);

  const triggerEvent = useCallback((ev) => {
    addLog(ev.msg, ev.type);
    addToast(ev.msg, ev.type === 'bad' ? 'bad' : ev.type === 'warn' ? 'warn' : '');

    if (ev.effect === 'lose_money') {
      setMoney(m => Math.max(0, m - ev.val));
    } else if (ev.effect === 'bonus_money') {
      setMoney(m => m + ev.val);
    } else if (ev.effect === 'load_up') {
      setComps(prev => prev.map(c =>
        c.type === 'SERVER' ? { ...c, load: Math.min(0.99, c.load + ev.val) } : c
      ));
    } else if (ev.effect === 'gpu_load') {
      setComps(prev => prev.map(c =>
        c.type === 'GPU' ? { ...c, load: Math.min(0.99, c.load + ev.val) } : c
      ));
    } else if (ev.effect === 'rev_boost' && ev.duration) {
      setActiveBoosts(prev => [...prev, { type: 'rev_boost', val: ev.val, remaining: ev.duration }]);
    }
  }, [addLog, addToast]);

  // ─── Build placement ──────────────────────────────────────
  const tryPlace = useCallback((type, col, row) => {
    const d = BUILDINGS[type];
    if (!inBounds(type, col, row)) { addToast('Out of bounds!', 'warn'); return false; }
    if (comps.some(c => overlaps(c, { type, col, row }))) { addToast('Space occupied!', 'warn'); return false; }
    let cost = d.cost;
    if (type === 'COOLING' && profile?.startBonus?.type === 'coolingCost') cost *= profile.startBonus.val;
    if (money < cost) { addToast(`Need $${cost}`, 'bad'); return false; }
    setMoney(m => m - cost);
    const nc = placeComp(type, col, row);
    setSelectedId(nc.id);
    addLog(`Built ${d.label} — $${cost}`, 'good');
    addToast(`✅ ${d.label} placed`);
    return true;
  }, [comps, money, profile, placeComp, addLog, addToast]);

  const demolish = useCallback((id) => {
    const c = comps.find(x => x.id === id);
    if (!c) return;
    setComps(prev => prev.filter(x => x.id !== id));
    if (selectedId === id) setSelectedId(null);
    addLog(`Demolished ${BUILDINGS[c.type].label}`, 'warn');
    addToast(`🔨 Demolished`);
  }, [comps, selectedId, addLog, addToast]);

  const upgradeComp = useCallback((id) => {
    const c = comps.find(x => x.id === id);
    if (!c || c.level >= 5) return;
    const cost = c.level * 900;
    if (money < cost) { addToast(`Need $${cost}`, 'bad'); return; }
    setMoney(m => m - cost);
    setComps(prev => prev.map(x => x.id === id ? { ...x, level: x.level + 1 } : x));
    addLog(`${BUILDINGS[c.type].label} upgraded to LV${c.level + 1}`, 'good');
    addToast(`⬆ Upgraded to Level ${c.level + 1}!`);
  }, [comps, money, addLog, addToast]);

  const buyUpgrade = useCallback((upg) => {
    if (upgrades.includes(upg.id)) return;
    if (money < upg.cost) { addToast(`Need $${upg.cost}`, 'bad'); return; }
    setMoney(m => m - upg.cost);
    setUpgrades(prev => [...prev, upg.id]);
    addLog(`Purchased upgrade: ${upg.name}`, 'good');
    addToast(`🔬 ${upg.name} unlocked!`);
  }, [upgrades, money, addLog, addToast]);

  const acceptContract = useCallback((contract) => {
    if (activeContracts.find(c => c.id === contract.id)) return;
    if (activeContracts.length >= 3) { addToast('Max 3 active contracts!', 'warn'); return; }
    let reward = contract.reward;
    if (profile?.startBonus?.type === 'contractVal') reward = Math.floor(reward * profile.startBonus.val);
    setActiveContracts(prev => [...prev, { ...contract, reward, progress: 0 }]);
    addLog(`Accepted contract: ${contract.name}`, 'good');
    addToast(`📋 Contract accepted!`);
  }, [activeContracts, profile, addLog, addToast]);

  const toggleSpeed = useCallback(() => {
    setSpeed(s => s === 1 ? 2 : s === 2 ? 5 : 1);
  }, []);

  const moveComp = useCallback((id, col, row) => {
    setComps(prev => {
      const comp = prev.find(c => c.id === id);
      if (!comp) return prev;
      const d = BUILDINGS[comp.type];
      const nc = Math.max(0, Math.min(GRID_COLS - d.w, col));
      const nr = Math.max(0, Math.min(GRID_ROWS - d.h, row));
      const moved = { ...comp, col: nc, row: nr };
      if (prev.some(c => c.id !== id && overlaps(c, moved))) return prev;
      return prev.map(c => c.id === id ? { ...c, col: nc, row: nr } : c);
    });
  }, []);

  const getCompTemp = useCallback((comp) => {
    const d = BUILDINGS[comp.type]; let s = 0, n = 0;
    for (let dr = 0; dr < d.h; dr++)
      for (let dc = 0; dc < d.w; dc++) { s += heatMap[`${comp.col+dc},${comp.row+dr}`] || 20; n++; }
    return s / Math.max(1, n);
  }, [heatMap]);

  const selectedComp = comps.find(c => c.id === selectedId) || null;

  return {
    // state
    phase, profile, comps, money, totalEarned, upgrades, activeContracts,
    completedContracts, log, toasts, speed, tick, metrics, heatMap,
    selectedId, selectedComp, tool, hoverCell, dragging, dragOff, activeBoosts,
    // actions
    startGame, setTool, setSelectedId, setHoverCell, setDragging, setDragOff,
    tryPlace, demolish, upgradeComp, buyUpgrade, acceptContract, toggleSpeed, moveComp,
    getCompTemp, addToast, addLog,
  };
}