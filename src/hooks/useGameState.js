import { useState, useEffect, useCallback, useRef } from 'react';
import { BUILDINGS, EVENTS, DISASTERS, STOCKS, UPGRADES, GRID_COLS, GRID_ROWS } from '../data/gameData';

let _id = 1;
export const mkId = () => _id++;

// ── Geometry ──────────────────────────────────────────────────
export const getRect = c => { const d = BUILDINGS[c.type]; return { col: c.col, row: c.row, w: d.w, h: d.h }; };
export const overlaps = (a, b) => { const ar = getRect(a), br = getRect(b); return !(ar.col + ar.w <= br.col || br.col + br.w <= ar.col || ar.row + ar.h <= br.row || br.row + br.h <= ar.row); };
export const inBounds = (type, col, row) => { const d = BUILDINGS[type]; return col >= 0 && row >= 0 && col + d.w <= GRID_COLS && row + d.h <= GRID_ROWS; };
export const hitTest = (comps, col, row) => comps.find(c => { const r = getRect(c); return col >= r.col && col < r.col + r.w && row >= r.row && row < r.row + r.h; });

// ── Heat map ─────────────────────────────────────────────────
export function buildHeatMap(comps) {
  const m = {};
  for (let r = 0; r < GRID_ROWS; r++) for (let c = 0; c < GRID_COLS; c++) m[`${c},${r}`] = 20;
  comps.forEach(comp => {
    const d = BUILDINGS[comp.type];
    if (d.heat > 0) {
      const emit = d.heat * comp.load * comp.level;
      for (let dr = -6; dr <= d.h + 5; dr++) for (let dc = -6; dc <= d.w + 5; dc++) {
        const cr = comp.row + dr, cc = comp.col + dc;
        if (cr < 0 || cr >= GRID_ROWS || cc < 0 || cc >= GRID_COLS) continue;
        const dist = Math.hypot(Math.max(0, dr), Math.max(0, dc));
        m[`${cc},${cr}`] = (m[`${cc},${cr}`] || 20) + emit * Math.max(0, 1 - dist / 7) * 3.5;
      }
    }
    if (comp.type === 'COOLING') {
      const cool = BUILDINGS.COOLING.cool * comp.load * comp.level;
      for (let dr = -7; dr <= 2 + 6; dr++) for (let dc = -7; dc <= 1 + 6; dc++) {
        const cr = comp.row + dr, cc = comp.col + dc;
        if (cr < 0 || cr >= GRID_ROWS || cc < 0 || cc >= GRID_COLS) continue;
        const dist = Math.hypot(Math.max(0, dr), Math.max(0, dc));
        const key = `${cc},${cr}`;
        m[key] = Math.max(14, (m[key] || 20) - cool * Math.max(0, 1 - dist / 8) * 2.8);
      }
    }
  });
  return m;
}

// ── Metrics ──────────────────────────────────────────────────
export function calcMetrics(comps, upgrades, boosts) {
  const ups = new Set(upgrades);
  let rev = 0, power = 0, sec = 0;
  comps.forEach(c => {
    const d = BUILDINGS[c.type];
    let r = d.rev * c.load * c.level * c.uptime;
    if (c.type === 'SERVER' && ups.has('fiber')) r *= 1.25;
    if (c.type === 'GPU' && ups.has('turbo')) r *= 1.3;
    if (c.type === 'STORAGE' && ups.has('nvme')) r *= 1.15;
    rev += r; power += d.power * c.load; sec += d.sec * c.level;
  });
  if (ups.has('green')) rev += 500;
  boosts?.forEach(b => { if (b.type === 'rev') rev *= b.val; });
  const hm = buildHeatMap(comps);
  const temps = Object.values(hm);
  const temp = temps.reduce((a, b) => a + b, 0) / Math.max(1, temps.length);
  const itPow = comps.filter(c => ['SERVER', 'GPU', 'STORAGE', 'SWITCH'].includes(c.type)).reduce((s, c) => s + BUILDINGS[c.type].power * c.load, 0);
  const pue = itPow > 0 ? Math.max(1, power / itPow) : 2.5;
  const uptime = comps.length ? comps.reduce((a, c) => a + c.uptime, 0) / comps.length : 1;
  const score = Math.min(100, rev * 1.5 + sec * 3 - Math.max(0, temp - 28) * 2 - (pue - 1) * 8 + uptime * 10);
  const rating = score > 90 ? 'S+' : score > 75 ? 'A' : score > 60 ? 'B' : score > 45 ? 'C' : score > 30 ? 'D' : 'F';
  return { rev, power, pue, temp, sec, rating, score, uptime, heatMap: hm };
}

// ── Main hook ────────────────────────────────────────────────
export default function useGameState() {
  const [phase, setPhase] = useState('intro');
  const [profile, setProfile] = useState(null);

  // Core economy
  const [money, setMoney] = useState(5000);
  const [totalEarned, setTotalEarned] = useState(0);
  const [comps, setComps] = useState([]);
  const [upgrades, setUpgrades] = useState([]);
  const [boosts, setBoosts] = useState([]);
  const [speed, setSpeed] = useState(1);
  const [tick, setTick] = useState(0);

  // Staff
  const [staff, setStaff] = useState([]);
  const [staffWalkers, setStaffWalkers] = useState([]);

  // Contracts
  const [activeContracts, setActiveContracts] = useState([]);
  const [completedContracts, setCompletedContracts] = useState(0);

  // Disasters
  const [activeDisaster, setActiveDisaster] = useState(null);
  const [disasterTimer, setDisasterTimer] = useState(0);
  const [disasterDamage, setDisasterDamage] = useState(0);

  // Stocks
  const [stocks, setStocks] = useState(STOCKS.map(s => ({ ...s, price: s.basePrice, owned: 0, history: [s.basePrice] })));
  const [stockProfit, setStockProfit] = useState(0);

  // UI
  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState('select');
  const [hoverCell, setHoverCell] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [dragOff, setDragOff] = useState({ dc: 0, dr: 0 });

  // Animations
  const [coins, setCoins] = useState([]);   // flying coins
  const [cables, setCables] = useState([]);   // animated cables
  const [smoke, setSmoke] = useState([]);   // smoke particles

  // Log & toasts
  const [log, setLog] = useState([]);
  const [toasts, setToasts] = useState([]);

  const metrics = calcMetrics(comps, upgrades, boosts);

  // ── Logging ───────────────────────────────────────────────
  const addLog = useCallback((msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLog(l => [{ msg, type, ts, id: mkId() }, ...l].slice(0, 80));
  }, []);

  const addToast = useCallback((msg, type = '') => {
    const id = mkId();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  // ── Flying coins ─────────────────────────────────────────
  const spawnCoin = useCallback((amount) => {
    const id = mkId();
    setCoins(c => [...c, { id, amount, x: Math.random() * 60 + 20, y: 80, vy: -2, life: 60 }]);
    setTimeout(() => setCoins(c => c.filter(x => x.id !== id)), 2000);
  }, []);

  // ── Smoke particles ───────────────────────────────────────
  const spawnSmoke = useCallback((x, y) => {
    for (let i = 0; i < 3; i++) {
      const id = mkId();
      setSmoke(s => [...s, { id, x: x + (Math.random() - .5) * 20, y, vy: -1 - Math.random(), vx: (Math.random() - .5) * .5, life: 60, alpha: .7 }]);
      setTimeout(() => setSmoke(s => s.filter(p => p.id !== id)), 2500);
    }
  }, []);

  // ── Build cables ──────────────────────────────────────────
  const rebuildCables = useCallback((comps) => {
    const sws = comps.filter(c => c.type === 'SWITCH');
    const srvs = comps.filter(c => ['SERVER', 'GPU', 'STORAGE'].includes(c.type));
    const newCables = [];
    sws.forEach(sw => {
      srvs.forEach(srv => {
        const d1 = BUILDINGS[sw.type], d2 = BUILDINGS[srv.type];
        const x1 = sw.col + d1.w / 2, y1 = sw.row + d1.h / 2;
        const x2 = srv.col + d2.w / 2, y2 = srv.row + d2.h / 2;
        if (Math.hypot(x2 - x1, y2 - y1) < 10) newCables.push({ id: mkId(), x1, y1, x2, y2, phase: Math.random() * Math.PI * 2 });
      });
    });
    setCables(newCables);
  }, []);

  // ── Staff walkers ─────────────────────────────────────────
  const spawnWalker = useCallback((staffMember) => {
    const id = mkId();
    const walker = {
      id, staffId: staffMember.id, role: staffMember.role,
      x: Math.random() * GRID_COLS, y: Math.random() * GRID_ROWS,
      tx: Math.random() * GRID_COLS, ty: Math.random() * GRID_ROWS,
      speed: 0.04, facing: 'right',
    };
    setStaffWalkers(w => [...w, walker]);
  }, []);

  // ── Init ─────────────────────────────────────────────────
  const startGame = useCallback((prof) => {
    setProfile(prof);
    const startMoney = prof.bonus === 'startMoney' ? 8000 : 5000;
    setMoney(startMoney);
    setComps([]);
    setStaff([]);
    setStaffWalkers([]);
    setActiveContracts([]);
    setLog([]);
    setStocks(STOCKS.map(s => ({ ...s, price: s.basePrice, owned: 0, history: [s.basePrice] })));

    setTimeout(() => {
      const starter = [
        { id: mkId(), type: 'SERVER', col: 3, row: 1, load: .6, level: 1, uptime: 1 },
        { id: mkId(), type: 'SERVER', col: 3, row: 4, load: .5, level: 1, uptime: 1 },
        { id: mkId(), type: 'SWITCH', col: 5, row: 2, load: .4, level: 1, uptime: 1 },
        { id: mkId(), type: 'STORAGE', col: 7, row: 1, load: .5, level: 1, uptime: 1 },
        { id: mkId(), type: 'COOLING', col: 10, row: 1, load: .8, level: 1, uptime: 1 },
        { id: mkId(), type: 'UPS', col: 12, row: 1, load: .5, level: 1, uptime: 1 },
      ];
      setComps(starter);
      rebuildCables(starter);
    }, 0);
    setPhase('game');
    addLog(`Systems online. Welcome, ${prof.name}!`, 'good');
    addLog('Tip: Hire staff to boost performance.', 'info');
    addLog('Tip: Watch the stock market for profits!', 'info');
  }, [addLog, rebuildCables]);

  // ── Main sim tick ─────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'game') return;
    const iv = setInterval(() => {
      setTick(t => t + 1);

      // Update loads + uptime
      setComps(prev => prev.map(c => {
        const noise = (Math.random() - .5) * .04;
        const load = Math.max(.08, Math.min(.99, c.load + noise));
        const hm = buildHeatMap(prev);
        const d = BUILDINGS[c.type]; let s = 0, n = 0;
        for (let dr = 0; dr < d.h; dr++) for (let dc = 0; dc < d.w; dc++) { s += (hm[`${c.col + dc},${c.row + dr}`] || 20); n++; }
        const t = s / Math.max(1, n);
        const uptime = t > 62 && c.type !== 'COOLING' ? Math.max(.5, c.uptime - .003) : Math.min(1, c.uptime + .001);
        return { ...c, load, uptime };
      }));

      // Staff walk animation
      setStaffWalkers(prev => prev.map(w => {
        const dx = w.tx - w.x, dy = w.ty - w.y, dist = Math.hypot(dx, dy);
        if (dist < .3) return { ...w, tx: Math.random() * GRID_COLS, ty: Math.random() * GRID_ROWS };
        const nx = w.x + (dx / dist) * w.speed * speed;
        const ny = w.y + (dy / dist) * w.speed * speed;
        return { ...w, x: nx, y: ny, facing: dx > 0 ? 'right' : 'left' };
      }));

      // Smoke from hot servers
      setComps(prev => {
        prev.filter(c => c.type !== 'COOLING').forEach(c => {
          const hm = buildHeatMap(prev);
          const d = BUILDINGS[c.type]; let s = 0, n = 0;
          for (let dr = 0; dr < d.h; dr++) for (let dc = 0; dc < d.w; dc++) { s += (hm[`${c.col + dc},${c.row + dr}`] || 20); n++; }
          if (s / Math.max(1, n) > 55 && Math.random() < .2) spawnSmoke(c.col, c.row);
        });
        return prev;
      });

      // Stock price fluctuation
      setStocks(prev => prev.map(s => {
        const change = (Math.random() - .48) * s.volatility;
        const newPrice = Math.max(1, s.price * (1 + change));
        return { ...s, price: newPrice, history: [...s.history.slice(-30), newPrice] };
      }));

      // Disaster timer
      setDisasterTimer(t => {
        if (t > 0) return t - 1;
        return 0;
      });

      // Random disaster (every ~60 ticks)
      if (Math.random() < .004 * speed && !activeDisaster) {
        const dis = DISASTERS[Math.floor(Math.random() * DISASTERS.length)];
        setActiveDisaster(dis);
        setDisasterTimer(dis.duration);
        addLog(`🚨 DISASTER: ${dis.name}`, 'bad');
        addToast(`🚨 ${dis.name}`, 'bad');
      }

      // Random events
      if (Math.random() < .005 * speed) {
        const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
        handleEvent(ev);
      }

      // Expire boosts
      setBoosts(prev => prev.map(b => ({ ...b, rem: b.rem - 1 })).filter(b => b.rem > 0));

    }, 1000 / Math.max(1, speed));
    return () => clearInterval(iv);
  }, [phase, speed, activeDisaster, addLog, addToast, spawnSmoke]);

  // ── Disaster auto-resolve ─────────────────────────────────
  useEffect(() => {
    if (disasterTimer === 0 && activeDisaster) {
      // Apply damage
      if (activeDisaster.effect === 'damage') {
        setMoney(m => Math.max(0, m - 800));
        addLog(`💸 Disaster damage: -$800`, 'bad');
      } else if (activeDisaster.effect === 'revenue') {
        setMoney(m => Math.max(0, m - activeDisaster.val * 1000));
      }
      setActiveDisaster(null);
      addLog(`⚠️ Disaster resolved (with damage).`, 'warn');
    }
  }, [disasterTimer, activeDisaster, addLog]);

  // ── Earn money ───────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'game') return;
    const iv = setInterval(() => {
      const earned = Math.max(0, metrics.rev) * speed;
      if (earned > 0) {
        setMoney(m => m + earned);
        setTotalEarned(t => t + earned);
        if (Math.random() < .15) spawnCoin(Math.round(earned));
      }
      // Staff salaries
      setStaff(prev => { prev.forEach(() => { }); return prev; });
      const salary = staff.reduce((s, m) => s + (m.salary || 0), 0) * speed / 60;
      if (salary > 0) setMoney(m => Math.max(0, m - salary));

      // Contract progress
      setActiveContracts(prev => prev.map(c => ({ ...c, progress: Math.min(c.duration, (c.progress || 0) + speed) }))
        .filter(c => {
          if (c.progress >= c.duration) {
            const r = c.reward;
            setMoney(m => m + r);
            setTotalEarned(t => t + r);
            spawnCoin(r);
            addLog(`✅ Contract "${c.name}" done! +$${r}`, 'good');
            addToast(`✅ +$${r} from ${c.name}`);
            setCompletedContracts(n => n + 1);
            return false;
          }
          return true;
        })
      );
    }, 1000);
    return () => clearInterval(iv);
  }, [phase, speed, metrics.rev, staff, addLog, addToast, spawnCoin]);

  const handleEvent = useCallback((ev) => {
    addLog(ev.msg, ev.type);
    if (ev.type !== 'warn') addToast(ev.msg, ev.type === 'bad' ? 'bad' : '');
    if (ev.effect === 'bonus') { setMoney(m => m + ev.val); spawnCoin(ev.val); }
    if (ev.effect === 'load_up') setComps(p => p.map(c => c.type === 'SERVER' ? { ...c, load: Math.min(.99, c.load + ev.val) } : c));
    if (ev.effect === 'gpu_load') setComps(p => p.map(c => c.type === 'GPU' ? { ...c, load: Math.min(.99, c.load + ev.val) } : c));
    if (ev.effect === 'rev_boost') setBoosts(b => [...b, { type: 'rev', val: ev.val, rem: ev.dur || 10 }]);
  }, [addLog, addToast, spawnCoin]);

  // ── Build / demolish ─────────────────────────────────────
  const tryPlace = useCallback((type, col, row) => {
    if (!inBounds(type, col, row)) { addToast('Out of bounds!', 'warn'); return false; }
    if (comps.some(c => overlaps(c, { type, col, row }))) { addToast('Space occupied!', 'warn'); return false; }
    let cost = BUILDINGS[type].cost;
    if (type === 'COOLING' && profile?.bonus === 'coolingCost') cost = Math.floor(cost * .75);
    if (money < cost) { addToast(`Need $${cost}`, 'bad'); return false; }
    setMoney(m => m - cost);
    const nc = { id: mkId(), type, col, row, load: .4 + Math.random() * .3, level: 1, uptime: 1 };
    setComps(prev => { const next = [...prev, nc]; rebuildCables(next); return next; });
    setSelectedId(nc.id);
    addLog(`Built ${BUILDINGS[type].label} — $${cost}`, 'good');
    addToast(`✅ ${BUILDINGS[type].label}`);
    return true;
  }, [comps, money, profile, addLog, addToast, rebuildCables]);

  const demolish = useCallback((id) => {
    const c = comps.find(x => x.id === id); if (!c) return;
    setComps(prev => { const next = prev.filter(x => x.id !== id); rebuildCables(next); return next; });
    if (selectedId === id) setSelectedId(null);
    addLog(`Demolished ${BUILDINGS[c.type].label}`, 'warn');
    addToast('🔨 Demolished');
  }, [comps, selectedId, addLog, addToast, rebuildCables]);

  const upgradeComp = useCallback((id) => {
    const c = comps.find(x => x.id === id); if (!c || c.level >= 5) return;
    const cost = c.level * 900;
    if (money < cost) { addToast(`Need $${cost}`, 'bad'); return; }
    setMoney(m => m - cost);
    setComps(p => p.map(x => x.id === id ? { ...x, level: x.level + 1 } : x));
    addLog(`${BUILDINGS[c.type].label} upgraded to LV${c.level + 1}`, 'good');
    addToast(`⬆ Level ${c.level + 1}!`);
  }, [comps, money, addLog, addToast]);

  const buyUpgrade = useCallback((upg) => {
    if (upgrades.includes(upg.id)) return;
    if (money < upg.cost) { addToast(`Need $${upg.cost}`, 'bad'); return; }
    setMoney(m => m - upg.cost);
    setUpgrades(p => [...p, upg.id]);
    addLog(`Upgrade: ${upg.name}`, 'good');
    addToast(`🔬 ${upg.name} unlocked!`);
  }, [upgrades, money, addLog, addToast]);

  const acceptContract = useCallback((contract) => {
    if (activeContracts.find(c => c.id === contract.id)) return;
    if (activeContracts.length >= 3) { addToast('Max 3 contracts!', 'warn'); return; }
    let reward = contract.reward;
    if (profile?.bonus === 'contractVal') reward = Math.floor(reward * 1.5);
    if (upgrades.includes('backup')) reward *= 2;
    setActiveContracts(p => [...p, { ...contract, reward, progress: 0 }]);
    addLog(`Contract accepted: ${contract.name}`, 'good');
    addToast('📋 Contract accepted!');
  }, [activeContracts, profile, upgrades, addLog, addToast]);

  // ── Staff ────────────────────────────────────────────────
  const hireStaff = useCallback((role, roleDef) => {
    const hireCost = roleDef.salary * 10;
    if (money < hireCost) { addToast(`Need $${hireCost}`, 'bad'); return; }
    setMoney(m => m - hireCost);
    const member = { id: mkId(), role, ...roleDef };
    setStaff(p => [...p, member]);
    spawnWalker(member);
    addLog(`Hired ${roleDef.label}`, 'good');
    addToast(`👤 ${roleDef.label} hired!`);
  }, [money, addLog, addToast, spawnWalker]);

  const fireStaff = useCallback((id) => {
    setStaff(p => p.filter(s => s.id !== id));
    setStaffWalkers(p => p.filter(w => w.staffId !== id));
    addLog('Staff member fired', 'warn');
  }, [addLog]);

  const resolveDisaster = useCallback(() => {
    if (!activeDisaster) return;
    addLog(`✅ Disaster resolved!`, 'good');
    addToast('✅ Disaster contained!');
    setActiveDisaster(null);
    setDisasterTimer(0);
  }, [activeDisaster, addLog, addToast]);

  // ── Stocks ───────────────────────────────────────────────
  const buyStock = useCallback((stockId, qty = 1) => {
    const s = stocks.find(x => x.id === stockId); if (!s) return;
    const cost = Math.ceil(s.price * qty);
    if (money < cost) { addToast('Not enough funds', 'bad'); return; }
    setMoney(m => m - cost);
    setStocks(p => p.map(x => x.id === stockId ? { ...x, owned: x.owned + qty } : x));
    addLog(`Bought ${qty}x ${s.id} @ $${s.price.toFixed(0)}`, 'good');
  }, [stocks, money, addLog, addToast]);

  const sellStock = useCallback((stockId, qty = 1) => {
    const s = stocks.find(x => x.id === stockId); if (!s || s.owned < qty) return;
    const gain = Math.floor(s.price * qty);
    setMoney(m => m + gain);
    setTotalEarned(t => t + gain);
    setStockProfit(p => p + gain);
    setStocks(p => p.map(x => x.id === stockId ? { ...x, owned: x.owned - qty } : x));
    spawnCoin(gain);
    addLog(`Sold ${qty}x ${s.id} @ $${s.price.toFixed(0)} = +$${gain}`, 'good');
    addToast(`📈 +$${gain} from stocks!`);
  }, [stocks, addLog, addToast, spawnCoin]);

  const toggleSpeed = useCallback(() => setSpeed(s => s === 1 ? 2 : s === 2 ? 5 : 1), []);

  const moveComp = useCallback((id, col, row) => {
    setComps(prev => {
      const comp = prev.find(c => c.id === id); if (!comp) return prev;
      const d = BUILDINGS[comp.type];
      const nc = Math.max(0, Math.min(GRID_COLS - d.w, col));
      const nr = Math.max(0, Math.min(GRID_ROWS - d.h, row));
      const moved = { ...comp, col: nc, row: nr };
      if (prev.some(c => c.id !== id && overlaps(c, moved))) return prev;
      const next = prev.map(c => c.id === id ? { ...c, col: nc, row: nr } : c);
      rebuildCables(next);
      return next;
    });
  }, [rebuildCables]);

  const getCompTemp = useCallback((comp) => {
    const d = BUILDINGS[comp.type]; let s = 0, n = 0;
    for (let dr = 0; dr < d.h; dr++) for (let dc = 0; dc < d.w; dc++) { s += (metrics.heatMap[`${comp.col + dc},${comp.row + dr}`] || 20); n++; }
    return s / Math.max(1, n);
  }, [metrics.heatMap]);

  return {
    phase, profile, comps, money, totalEarned, upgrades, boosts, activeContracts, completedContracts,
    log, toasts, speed, tick, metrics, staff, staffWalkers, stocks, stockProfit,
    activeDisaster, disasterTimer, cables, coins, smoke,
    selectedId, selectedComp: comps.find(c => c.id === selectedId) || null,
    tool, hoverCell, dragging, dragOff,
    startGame, setTool, setSelectedId, setHoverCell, setDragging, setDragOff,
    tryPlace, demolish, upgradeComp, buyUpgrade, acceptContract,
    hireStaff, fireStaff, resolveDisaster,
    buyStock, sellStock, toggleSpeed, moveComp, getCompTemp,
    addToast, addLog,
  };
}