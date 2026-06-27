// ─── CHARACTERS ───────────────────────────────────────────────
export const CHARACTERS = [
    { id: 'alex', name: 'Alex', role: 'Tech Lead', gender: 'male', emoji: '👨‍💻', color: '#4499ff', bonus: 'serverRev', bonusDesc: '+20% Server Revenue', startMoney: 5000 },
    { id: 'rohan', name: 'Rohan', role: 'Engineer', gender: 'male', emoji: '🧑‍🔬', color: '#44cc77', bonus: 'coolingCost', bonusDesc: '-25% Cooling Costs', startMoney: 5000 },
    { id: 'priya', name: 'Priya', role: 'CEO', gender: 'female', emoji: '👩‍💼', color: '#ff66aa', bonus: 'startMoney', bonusDesc: '+$3000 Starting Funds', startMoney: 8000 },
    { id: 'sara', name: 'Sara', role: 'Founder', gender: 'female', emoji: '👩‍🚀', color: '#bb66ff', bonus: 'contractVal', bonusDesc: '+50% Contract Value', startMoney: 5000 },
];

// ─── BUILDINGS ────────────────────────────────────────────────
export const BUILDINGS = {
    SERVER: { label: 'Server Rack', icon: '🖥', w: 1, h: 2, cost: 500, rev: 8, power: 2.2, heat: 3, cool: 0, sec: 0, color: '#14326e', accent: '#4499ff', desc: 'General-purpose compute. Steady revenue, moderate heat.' },
    GPU: { label: 'GPU Cluster', icon: '🎮', w: 2, h: 2, cost: 1200, rev: 28, power: 6.5, heat: 8, cool: 0, sec: 0, color: '#360c5a', accent: '#bb66ff', desc: 'High revenue AI/render workloads. Runs very hot.' },
    STORAGE: { label: 'Storage Array', icon: '💾', w: 2, h: 1, cost: 300, rev: 3, power: 1.0, heat: 1.5, cool: 0, sec: 0, color: '#0a2816', accent: '#44cc77', desc: 'Cheap bulk storage. Low rev, low heat.' },
    SWITCH: { label: 'Net Switch', icon: '📡', w: 1, h: 1, cost: 200, rev: 1, power: 0.6, heat: 1, cool: 0, sec: 0, color: '#0a2820', accent: '#00ffbb', desc: 'Links racks together for packet traffic.' },
    COOLING: { label: 'CRAC Unit', icon: '❄️', w: 1, h: 2, cost: 800, rev: -1, power: 4.0, heat: -12, cool: 9, sec: 0, color: '#0a1c3c', accent: '#00aaff', desc: 'Cools nearby racks. Critical above 5+ servers.' },
    UPS: { label: 'UPS', icon: '⚡', w: 1, h: 1, cost: 400, rev: 0, power: -2, heat: 0.5, cool: 0, sec: 1, color: '#281600', accent: '#ffd700', desc: 'Battery backup. Keeps systems alive during outages.' },
    SOLAR: { label: 'Solar Panel', icon: '☀️', w: 2, h: 1, cost: 1500, rev: 0, power: -5, heat: 0, cool: 0, sec: 0, color: '#201a00', accent: '#ffdd00', desc: 'Offsets power draw with clean energy.' },
    FIREWALL: { label: 'Firewall', icon: '🛡️', w: 1, h: 1, cost: 600, rev: 0, power: 0.3, heat: 0.2, cool: 0, sec: 3, color: '#280808', accent: '#ff4455', desc: 'Raises security rating. Required for sensitive contracts.' },
    GENERATOR: { label: 'Generator', icon: '🔌', w: 2, h: 1, cost: 2000, rev: 0, power: -10, heat: 2, cool: 0, sec: 0, color: '#1a1a00', accent: '#ffaa00', desc: 'Backup diesel power. Big power offset during outages.' },
    HALON: { label: 'Fire Suppress', icon: '🧯', w: 1, h: 1, cost: 1200, rev: 0, power: 0.1, heat: 0, cool: 0, sec: 0, color: '#3a0808', accent: '#ff6600', desc: 'Auto-extinguishes server fires before they spread.' },
};

// ─── STAFF ROLES ──────────────────────────────────────────────
export const STAFF_ROLES = {
    ENGINEER: { label: 'Engineer', icon: '👷', salary: 50, speed: 1.2, color: '#4499ff', skill: 'repair', desc: 'Fixes overheating servers fast' },
    SECURITY: { label: 'Security Guard', icon: '💂', salary: 35, speed: 0.8, color: '#ff4455', skill: 'security', desc: 'Blocks DDoS & breach attempts' },
    COOLER: { label: 'Cooling Tech', icon: '🥶', salary: 45, speed: 1.0, color: '#00aaff', skill: 'cooling', desc: '+15% CRAC unit efficiency' },
    MANAGER: { label: 'IT Manager', icon: '🤵', salary: 80, speed: 0.9, color: '#ffd700', skill: 'boost', desc: '+10% revenue from all servers' },
    JANITOR: { label: 'Janitor', icon: '🧹', salary: 20, speed: 1.4, color: '#44cc77', skill: 'clean', desc: 'Prevents minor equipment failure' },
};

// ─── CONTRACTS ───────────────────────────────────────────────
export const CONTRACTS = [
    { id: 'startup', name: 'Startup Hosting', icon: '🚀', tier: 1, reward: 800, duration: 30, req: { servers: 2, temp: 50, uptime: 0.80 }, desc: 'Host a fintech startup.' },
    { id: 'ecom', name: 'E-commerce CDN', icon: '🛒', tier: 1, reward: 1200, duration: 45, req: { servers: 3, temp: 45, uptime: 0.85 }, desc: 'Power an online store.' },
    { id: 'bank', name: 'Bank Processing', icon: '🏦', tier: 2, reward: 3000, duration: 60, req: { servers: 5, temp: 40, uptime: 0.90, sec: 5 }, desc: 'Financial transactions.' },
    { id: 'ai_lab', name: 'AI Research Lab', icon: '🧬', tier: 2, reward: 4500, duration: 50, req: { gpu: 2, temp: 45, uptime: 0.85 }, desc: 'Train ML models.' },
    { id: 'gov', name: 'Government Cloud', icon: '🏛️', tier: 3, reward: 8000, duration: 90, req: { servers: 8, temp: 38, uptime: 0.95, sec: 10 }, desc: 'Classified workloads.' },
    { id: 'stream', name: 'Video Streaming', icon: '📺', tier: 2, reward: 3500, duration: 45, req: { storage: 3, temp: 42, uptime: 0.88 }, desc: 'Serve video to millions.' },
    { id: 'crypto', name: 'Crypto Exchange', icon: '₿', tier: 3, reward: 10000, duration: 60, req: { gpu: 4, temp: 40, uptime: 0.95, sec: 8 }, desc: 'High-frequency trading.' },
    { id: 'hospital', name: 'Healthcare Records', icon: '🏥', tier: 3, reward: 7000, duration: 75, req: { storage: 4, temp: 38, uptime: 0.98, sec: 12 }, desc: 'Patient health records.' },
];

// ─── DISASTERS ───────────────────────────────────────────────
export const DISASTERS = [
    { id: 'fire', name: 'Server Fire!', icon: '🔥', color: '#ff3300', duration: 15, effect: 'damage', val: 0.3, desc: 'A server rack is on fire! Deploy fire suppression!', fix: 'HALON' },
    { id: 'flood', name: 'Cooling Leak!', icon: '💧', color: '#0088ff', duration: 20, effect: 'cooling', val: 0.5, desc: 'Coolant leak detected! Send cooling tech!', fix: 'COOLER' },
    { id: 'ddos', name: 'DDoS Attack!', icon: '💀', color: '#ff2244', duration: 10, effect: 'revenue', val: 0.2, desc: 'Massive DDoS attack underway!', fix: 'SECURITY' },
    { id: 'powercut', name: 'Power Outage!', icon: '⚡', color: '#ffaa00', duration: 12, effect: 'power', val: 0, desc: 'Main power grid failed! Activate UPS!', fix: 'UPS' },
    { id: 'hack', name: 'Security Breach!', icon: '🔓', color: '#aa00ff', duration: 18, effect: 'security', val: 500, desc: 'Hackers in the system! Deploy security!', fix: 'SECURITY' },
    { id: 'overheat', name: 'Critical Overheat!', icon: '🌡️', color: '#ff6600', duration: 14, effect: 'heat', val: 2.0, desc: 'Multiple servers overheating critically!', fix: 'COOLER' },
];

// ─── STOCK MARKET ─────────────────────────────────────────────
export const STOCKS = [
    { id: 'NVDA', name: 'NvidiaCorp', icon: '🎮', basePrice: 280, volatility: 0.08, sector: 'chip', color: '#76b900' },
    { id: 'AMZN', name: 'CloudGiant', icon: '☁️', basePrice: 185, volatility: 0.05, sector: 'cloud', color: '#ff9900' },
    { id: 'TSLA', name: 'TeslaGrid', icon: '⚡', basePrice: 240, volatility: 0.12, sector: 'energy', color: '#cc0000' },
    { id: 'COOL', name: 'CoolTech Inc', icon: '❄️', basePrice: 45, volatility: 0.15, sector: 'cooling', color: '#00aaff' },
    { id: 'SECR', name: 'SecureBase', icon: '🛡️', basePrice: 92, volatility: 0.06, sector: 'security', color: '#ff4455' },
];

// ─── RANDOM EVENTS ───────────────────────────────────────────
export const EVENTS = [
    { id: 'client', msg: '🎉 New enterprise client!', type: 'good', effect: 'load_up', val: 0.20 },
    { id: 'ai_job', msg: '🤖 AI training job arrived!', type: 'good', effect: 'gpu_load', val: 0.25 },
    { id: 'peak', msg: '📈 Traffic peak! Rev +30% (15s)', type: 'good', effect: 'rev_boost', val: 1.3, dur: 15 },
    { id: 'investor', msg: '💰 Investor bonus! +$1500', type: 'good', effect: 'bonus', val: 1500 },
    { id: 'audit', msg: '✅ Audit passed! Bonus $800', type: 'good', effect: 'bonus', val: 800 },
    { id: 'green', msg: '🌱 Eco award! +$600', type: 'good', effect: 'bonus', val: 600 },
    { id: 'spike', msg: '⚡ Power spike! Load fluctuating', type: 'warn', effect: 'load_spike', val: 0.2 },
    { id: 'hardware', msg: '🔧 Minor hardware fault detected', type: 'warn', effect: 'uptime', val: 0.05 },
];

// ─── UPGRADES ────────────────────────────────────────────────
export const UPGRADES = [
    { id: 'nvme', name: 'NVMe SSDs', cost: 2000, icon: '💿', desc: '+15% Storage revenue', req: { STORAGE: 2 } },
    { id: 'liquid', name: 'Liquid Cooling', cost: 3500, icon: '💧', desc: '+40% Cooling efficiency', req: { COOLING: 2 } },
    { id: 'fiber', name: 'Fiber Network', cost: 2500, icon: '🔗', desc: '+25% Server revenue', req: { SWITCH: 2 } },
    { id: 'ai_bal', name: 'AI Load Balancer', cost: 4000, icon: '🤖', desc: 'Auto-optimises all load', req: { GPU: 1 } },
    { id: 'green', name: 'Green Cert', cost: 5000, icon: '🌱', desc: '+$500/s passive eco', req: { SOLAR: 2 } },
    { id: 'redteam', name: 'Red Team Sec', cost: 3000, icon: '🔒', desc: 'Immune to DDoS', req: { FIREWALL: 2 } },
    { id: 'turbo', name: 'Turbo Clocks', cost: 6000, icon: '⚡', desc: '+30% GPU revenue', req: { GPU: 2 } },
    { id: 'backup', name: 'Geo Redundancy', cost: 8000, icon: '🌐', desc: 'Contracts pay 2x', req: { SERVER: 5 } },
];

export const GRID_COLS = 22;
export const GRID_ROWS = 13;

// ─── MILESTONES ───────────────────────────────────────────────
// One-time achievements that grant a cash bonus + permanent small perk when reached.
export const MILESTONES = [
    { id: 'm_first_blood', name: 'First Profit', icon: '🪙', desc: 'Earn your first $1,000 total', check: s => s.totalEarned >= 1000, reward: 250 },
    { id: 'm_grid_5', name: 'Small Operation', icon: '🏗️', desc: 'Place 5 buildings', check: s => s.comps.length >= 5, reward: 400 },
    { id: 'm_grid_15', name: 'Growing Fast', icon: '🏢', desc: 'Place 15 buildings', check: s => s.comps.length >= 15, reward: 1500 },
    { id: 'm_contracts_3', name: 'Reliable Partner', icon: '📋', desc: 'Complete 3 contracts', check: s => s.completedContracts >= 3, reward: 1000 },
    { id: 'm_contracts_10', name: 'Enterprise Grade', icon: '🏛️', desc: 'Complete 10 contracts', check: s => s.completedContracts >= 10, reward: 4000 },
    { id: 'm_staff_3', name: 'Building a Team', icon: '👥', desc: 'Hire 3 staff members', check: s => s.staff.length >= 3, reward: 600 },
    { id: 'm_rating_a', name: 'Top Tier', icon: '⭐', desc: 'Reach an A rating or better', check: s => ['A', 'S+'].includes(s.metrics.rating), reward: 2000 },
    { id: 'm_earned_50k', name: 'Half Century', icon: '💵', desc: 'Earn $50,000 total', check: s => s.totalEarned >= 50000, reward: 5000 },
    { id: 'm_earned_250k', name: 'Quarter Million', icon: '💰', desc: 'Earn $250,000 total', check: s => s.totalEarned >= 250000, reward: 15000 },
    { id: 'm_disasters_5', name: 'Crisis Manager', icon: '🚨', desc: 'Survive 5 disasters', check: s => s.disastersHandled >= 5, reward: 2000 },
    { id: 'm_stocks_5k', name: 'Day Trader', icon: '📈', desc: 'Earn $5,000 from stock trading', check: s => s.stockProfit >= 5000, reward: 1500 },
    { id: 'm_upgrades_4', name: 'R&D Division', icon: '🔬', desc: 'Unlock 4 upgrades', check: s => s.upgrades.length >= 4, reward: 3000 },
];

// ─── PRESTIGE ──────────────────────────────────────────────────
// Acquiring a new data center resets the grid + money but keeps a permanent revenue
// multiplier that scales with how much net worth you banked before resetting.
export const PRESTIGE = {
    // Net worth required (money + totalEarned*0.1) to unlock the first prestige.
    baseRequirement: 20000,
    // Each prestige level adds this much permanent revenue multiplier (additive).
    multiplierPerLevel: 0.15,
    // Each prestige level raises the requirement for the next one by this factor.
    requirementGrowth: 1.8,
};