import { useEffect } from "react";
import {
  TICK_MS,
  calcHeat,
  calcUptime,
  calcIncome,
  calcUpkeep,
  countItem,
  meetsReq,
} from "../utils/gameLogic";
import { CLIENT_POOL } from "../data/clients";

/**
 * useGameTick
 * Drives the core game loop via requestAnimationFrame.
 * Reads current state from stateRef (so the loop never goes stale)
 * and applies all tick events: income, heat warnings, breaches,
 * server failures, auto-repair, client churn, and new client offers.
 */
export function useGameTick({
  stateRef,
  setCash,
  setBroken,
  setClients,
  setPendingClient,
  setTick,
  setProgress,
  addLog,
  notify,
}) {
  useEffect(() => {
    let start = null;
    let raf;

    function loop(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      setProgress(Math.min(100, (elapsed / TICK_MS) * 100));
      if (elapsed >= TICK_MS) {
        start = ts;
        runTick();
      }
      raf = requestAnimationFrame(loop);
    }

    function runTick() {
      const { cash, cells, broken, clients, pendingClient, engineers, tick } =
        stateRef.current;

      let newCash    = cash;
      let newBroken  = new Set(broken);
      let newClients = [...clients];
      let newPending = pendingClient;
      const newTick  = tick + 1;
      setTick(newTick);

      const svrs        = countItem(cells, "server");
      const heat        = calcHeat(cells);
      const uptime      = calcUptime(cells, engineers);
      const hasFirewall = countItem(cells, "firewall") > 0;

      // ── Income & upkeep ──────────────────────────────────────────
      if (svrs > 0) {
        const inc = calcIncome(cells, newClients, engineers);
        const upk = calcUpkeep(cells, engineers);
        const net = inc - upk;
        newCash = Math.max(0, newCash + net);
        if (newTick % 3 === 0) {
          addLog(
            `Tick ${newTick}: +$${inc} income · -$${upk} upkeep = ${net >= 0 ? "+" : ""}$${net}`,
            net >= 0 ? "g" : "b"
          );
        }
      }

      // ── Heat warning ─────────────────────────────────────────────
      if (heat > 80 && svrs > 0) {
        addLog("⚠️ Overheating! Add cooling or remove servers.", "b");
      }

      // ── Security breach ──────────────────────────────────────────
      // Firewall = 0% chance; Marco Ruiz (e2) = 2%; unprotected = 8%
      const breachChance = hasFirewall ? 0 : engineers.has("e2") ? 0.02 : 0.08;
      if (Math.random() < breachChance && svrs > 0) {
        const loss = Math.round(
          calcIncome(cells, newClients, engineers) * 0.35
        );
        newCash = Math.max(0, newCash - loss);
        addLog(`🔓 Security breach! Lost $${loss}. Add a firewall or hire Marco.`, "b");
        notify(`Security breach! -$${loss}`, "b");
      }

      // ── Server malfunction ───────────────────────────────────────
      const failChance = heat > 80 ? 0.2 : 0.07;
      if (Math.random() < failChance && svrs > 0) {
        const available = cells
          .map((c, i) => (c === "server" && !newBroken.has(i) ? i : null))
          .filter((x) => x !== null);
        if (available.length) {
          const idx = available[Math.floor(Math.random() * available.length)];
          if (engineers.has("e1")) {
            // Riya Shah auto-repairs
            newCash = Math.max(0, newCash - 50);
            addLog("🔧 Riya auto-repaired a failing server (-$50).", "w");
          } else {
            newBroken = new Set([...newBroken, idx]);
            addLog("💥 Server malfunction! Check the Floor tab.", "b");
            notify("Server malfunction on the floor!", "b");
          }
        }
      }

      // ── Auto-repair broken servers (costs $80 each) ───────────────
      const brokenCopy = new Set(newBroken);
      brokenCopy.forEach((idx) => {
        if (newCash >= 80) {
          newCash -= 80;
          newBroken.delete(idx);
          addLog("🔧 Auto-repaired broken server (-$80).", "w");
        }
      });

      // ── Client churn ─────────────────────────────────────────────
      newClients = newClients.filter((c) => {
        const ok = meetsReq(c.req, cells) && uptime >= c.sla;
        if (!ok) {
          addLog(`${c.name} cancelled contract — requirements not met.`, "b");
          notify(`${c.name} left!`, "b");
        }
        return ok;
      });

      // ── New client offer ─────────────────────────────────────────
      if (!newPending && Math.random() < 0.2 && svrs > 0) {
        const activeIds = new Set(newClients.map((c) => c.id));
        const eligible = CLIENT_POOL.filter((c) => {
          if (activeIds.has(c.id)) return false;
          if (c.requiresCloudArch && !engineers.has("e5")) return false;
          return true;
        });
        if (eligible.length) {
          const pick = {
            ...eligible[Math.floor(Math.random() * eligible.length)],
            status: "pending",
          };
          newPending = pick;
          addLog(`📩 ${pick.name} sent a contract offer! → Clients tab`, "a");
          notify(`New offer: ${pick.name}!`, "a");
        }
      }

      // ── Flush state ──────────────────────────────────────────────
      setBroken(newBroken);
      setClients(newClients);
      setPendingClient(newPending);
      setCash(newCash);
    }

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
