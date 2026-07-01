# 🖥️ Data Center Tycoon

A React idle/tycoon game where you build and manage a data center.

## Quick Start

```bash
npm install
npm start
```

Then open http://localhost:3000

---

## Folder Structure

```
datacenter-tycoon/
├── public/
│   └── index.html              # HTML shell
├── src/
│   ├── index.js                # React entry point
│   ├── index.css               # Global styles + animations
│   ├── App.jsx                 # Root component
│   │
│   ├── data/
│   │   ├── items.js            # All 8 buildable floor items
│   │   ├── engineers.js        # All 8 hireable engineers
│   │   └── clients.js          # All 10 client contracts + tier colors
│   │
│   ├── utils/
│   │   └── gameLogic.js        # Pure functions: heat, uptime, income, upkeep
│   │
│   ├── hooks/
│   │   └── useGameTick.js      # RAF game loop — runs every 4 seconds
│   │
│   └── components/
│       ├── DataCenterTycoon.jsx  # Main game orchestrator (state + layout)
│       ├── StatCard.jsx          # Top-bar stat tile
│       ├── HeatBar.jsx           # Heat stat tile with progress bar
│       ├── GridCell.jsx          # Single floor grid cell
│       ├── ShopItem.jsx          # Build panel item card
│       ├── ClientCard.jsx        # Client contract card
│       ├── EngineerCard.jsx      # Engineer hire card
│       └── Notification.jsx      # Toast notification banner
├── package.json
└── README.md
```

---

## Game Systems

### Floor
- 8×5 grid (40 cells)
- Place / remove items by clicking
- 8 item types: Server rack, Cooling unit, Power supply, Security node, Network switch, Storage array, Firewall, UPS battery

### Economy (every 4s tick)
- **Income** = servers + storage + network-per-client + client contracts + SLA bonuses
- **Upkeep** = equipment maintenance + engineer salaries
- **Heat** = servers × 12 minus cooling capacity; throttles income above 50%, 80%

### Clients (10 total, 3 tiers)
- Tier 1: Startup, Gaming
- Tier 2: SaaS, Analytics, Fintech, Media
- Tier 3: Healthcare, Enterprise, Finance, AI/ML (need Priya Nair hired)
- Clients cancel if you stop meeting their hardware requirements or SLA uptime

### Engineers (8 total)
| Name           | Skill      | Bonus                              |
|----------------|------------|------------------------------------|
| Riya Shah      | DevOps     | Auto-repairs broken servers        |
| Marco Ruiz     | Security   | Breach chance −70%                 |
| Asel Kim       | Networking | Network income +15%                |
| James Obi      | SysAdmin   | Uptime +10%                        |
| Priya Nair     | Cloud Arch | Unlocks Tier 3 enterprise clients  |
| Tomás Vega     | Database   | Storage income +20%                |
| Sara Lindqvist | Finance    | Upkeep −10%                        |
| Kai Tanaka     | ML Ops     | Double income on servers past 10   |

### Events (each tick)
- Security breach (steal 35% income) — prevented by Firewall or Marco
- Server malfunction — auto-repaired by Riya or costs $80
- Overheating warning when heat > 80%

---

## Adding to Unity

The game logic in `src/utils/gameLogic.js` maps directly to C# scripts:
- `calcHeat()` → `HeatManager.cs`
- `calcIncome()` → `IncomeManager.cs`
- `calcUptime()` → `UptimeManager.cs`
- Grid = 2D array of `CellType` enums
- Tick loop = `InvokeRepeating("GameTick", 4f, 4f)`
