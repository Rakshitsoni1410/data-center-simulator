import { ENGINEERS } from "../data/engineers";

export const GRID_COLS = 8;
export const GRID_ROWS = 5;
export const GRID_SIZE = GRID_COLS * GRID_ROWS; // 40 cells
export const TICK_MS   = 4000;                  // 4 seconds per game tick

// Count how many of a given item type are on the grid
export function countItem(cells, type) {
  return cells.filter((c) => c === type).length;
}

// Heat = servers * 12 minus cooling capacity (each cooling unit powered by a power supply removes 20%)
export function calcHeat(cells) {
  const svr  = countItem(cells, "server");
  const cool = countItem(cells, "cooling");
  const pwr  = countItem(cells, "power");
  const cooled = Math.min(cool, pwr) * 20;
  return Math.max(0, Math.min(100, svr * 12 - cooled));
}

// Uptime % — affected by heat, UPS batteries, and James Obi (SysAdmin)
export function calcUptime(cells, engineers) {
  const heat = calcHeat(cells);
  const ups  = countItem(cells, "ups");
  let u = 100;
  if (heat > 80) u -= 30;
  else if (heat > 50) u -= 10;
  u += ups * 10;
  if (engineers.has("e4")) u += 10; // James Obi bonus
  return Math.min(100, Math.max(0, u));
}

// Check if current grid meets a client's requirements
export function meetsReq(req, cells) {
  return Object.entries(req).every(([k, v]) => countItem(cells, k) >= v);
}

// Total income per tick
export function calcIncome(cells, clients, engineers) {
  const svr    = countItem(cells, "server");
  const stor   = countItem(cells, "storage");
  const net    = countItem(cells, "network");
  const active = clients.filter((c) => c.status === "active");

  // Base: servers + storage
  let base = svr * 20 + stor * 5;

  // Kai Tanaka (ML Ops): double income on servers past 10
  if (engineers.has("e8") && svr > 10) base += (svr - 10) * 20;

  // Network switches earn per active client
  let netIncome = net * 8 * active.length;
  if (engineers.has("e3")) netIncome = Math.round(netIncome * 1.15); // Asel Kim

  // Storage bonus from Tomás Vega (Database)
  const storBonus = engineers.has("e6") ? Math.round(stor * 5 * 0.2) : 0;

  // Client contract payments
  const clientIncome = active.reduce((a, c) => a + c.pay, 0);

  // SLA bonus: 10% extra from clients whose SLA target we meet
  const uptime = calcUptime(cells, engineers);
  const slaBonus = active
    .filter((c) => uptime >= c.sla)
    .reduce((a, c) => a + Math.round(c.pay * 0.1), 0);

  return base + netIncome + storBonus + clientIncome + slaBonus;
}

// Total upkeep per tick
export function calcUpkeep(cells, engineers) {
  const base =
    countItem(cells, "cooling")  * 2 +
    countItem(cells, "power")    * 1 +
    countItem(cells, "security") * 3 +
    countItem(cells, "network")  * 2 +
    countItem(cells, "storage")  * 1 +
    countItem(cells, "firewall") * 4 +
    countItem(cells, "ups")      * 2;

  const engCost = Array.from(engineers).reduce((a, id) => {
    const e = ENGINEERS.find((x) => x.id === id);
    return a + (e ? e.salary : 0);
  }, 0);

  let total = base + engCost;
  if (engineers.has("e7")) total = Math.round(total * 0.9); // Sara Lindqvist
  return total;
}
