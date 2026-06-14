// ─── CHARACTERS ───────────────────────────────────────────────
export const CHARACTERS = [
    { id: 'alex', name: 'Alex', role: 'Tech Lead', gender: 'male', emoji: '👨‍💻', bonus: 'server', bonusDesc: '+20% Server revenue', startBonus: { type: 'serverRev', val: 1.2 } },
    { id: 'rohan', name: 'Rohan', role: 'Engineer', gender: 'male', emoji: '🧑‍🔬', bonus: 'cooling', bonusDesc: '-25% Cooling costs', startBonus: { type: 'coolingCost', val: 0.75 } },
    { id: 'priya', name: 'Priya', role: 'CEO', gender: 'female', emoji: '👩‍💼', bonus: 'money', bonusDesc: '+$2000 starting funds', startBonus: { type: 'startMoney', val: 2000 } },
    { id: 'sara', name: 'Sara', role: 'Founder', gender: 'female', emoji: '👩‍🚀', bonus: 'contract', bonusDesc: '+50% Contract value', startBonus: { type: 'contractVal', val: 1.5 } },
];

// ─── BUILDING DEFINITIONS ─────────────────────────────────────
export const BUILDINGS = {
    SERVER: { label: 'Server Rack', icon: '🖥', w: 1, h: 2, cost: 500, baseCost: 500, rev: 8, power: 2.2, heat: 3, cool: 0, sec: 0, color: '#1a3f8a', accent: '#4499ff', desc: 'Core compute. Main revenue.' },
    GPU: { label: 'GPU Cluster', icon: '🎮', w: 2, h: 2, cost: 1200, baseCost: 1200, rev: 28, power: 6.5, heat: 8, cool: 0, sec: 0, color: '#4a1080', accent: '#bb66ff', desc: 'AI/ML workloads. High revenue + heat.' },
    STORAGE: { label: 'Storage Array', icon: '💾', w: 2, h: 1, cost: 300, baseCost: 300, rev: 3, power: 1.0, heat: 1.5, cool: 0, sec: 0, color: '#0d4020', accent: '#44cc77', desc: 'Persistent storage. Steady income.' },
    SWITCH: { label: 'Net Switch', icon: '📡', w: 1, h: 1, cost: 200, baseCost: 200, rev: 1, power: 0.6, heat: 1, cool: 0, sec: 0, color: '#0a3030', accent: '#00ffbb', desc: 'Routes traffic. Boosts nearby servers.' },
    COOLING: { label: 'CRAC Unit', icon: '❄️', w: 1, h: 2, cost: 800, baseCost: 800, rev: -1, power: 4.0, heat: -12, cool: 9, sec: 0, color: '#0a2050', accent: '#00aaff', desc: 'Cools servers. Essential for uptime.' },
    UPS: { label: 'UPS', icon: '⚡', w: 1, h: 1, cost: 400, baseCost: 400, rev: 0, power: -2, heat: 0.5, cool: 0, sec: 1, color: '#3a2000', accent: '#ffd700', desc: 'Backup power. Prevents outages.' },
    SOLAR: { label: 'Solar Panel', icon: '☀️', w: 2, h: 1, cost: 1500, baseCost: 1500, rev: 0, power: -5, heat: 0, cool: 0, sec: 0, color: '#2a2000', accent: '#ffee44', desc: 'Free clean power. Reduces PUE.' },
    FIREWALL: { label: 'Firewall', icon: '🛡️', w: 1, h: 1, cost: 600, baseCost: 600, rev: 0, power: 0.3, heat: 0.2, cool: 0, sec: 3, color: '#3a0808', accent: '#ff4455', desc: 'Security appliance. Stops attacks.' },
};

// ─── UPGRADES ────────────────────────────────────────────────
export const UPGRADES = [
    { id: 'nvme', name: 'NVMe SSDs', cost: 2000, icon: '💿', desc: '+15% Storage revenue', req: { STORAGE: 2 }, effect: { storageRev: 1.15 } },
    { id: 'liquid', name: 'Liquid Cooling', cost: 3500, icon: '💧', desc: '+40% Cooling efficiency', req: { COOLING: 2 }, effect: { coolingEff: 1.4 } },
    { id: 'fiber', name: 'Fiber Network', cost: 2500, icon: '🔗', desc: '+25% all Server revenue', req: { SWITCH: 2 }, effect: { allRev: 1.25 } },
    { id: 'ai', name: 'AI Load Balancer', cost: 4000, icon: '🤖', desc: 'Auto-optimises load', req: { GPU: 1 }, effect: { autoBalance: true } },
    { id: 'green', name: 'Green Cert', cost: 5000, icon: '🌱', desc: '+$500/s eco bonus', req: { SOLAR: 2 }, effect: { ecoBonus: 500 } },
    { id: 'red', name: 'Red Team Sec', cost: 3000, icon: '🔒', desc: 'Immune to DDoS attacks', req: { FIREWALL: 2 }, effect: { ddosImmune: true } },
    { id: 'turbo', name: 'Turbo Clocks', cost: 6000, icon: '⚡', desc: '+30% GPU revenue', req: { GPU: 2 }, effect: { gpuRev: 1.3 } },
    { id: 'backup', name: 'Geo Redundancy', cost: 8000, icon: '🌐', desc: 'Contracts pay 2x', req: { SERVER: 5 }, effect: { contractMult: 2 } },
];

// ─── CONTRACTS ───────────────────────────────────────────────
export const CONTRACTS = [
    { id: 'startup', name: 'Startup Hosting', icon: '🚀', tier: 1, reward: 800, duration: 30, req: { servers: 2, temp: 50, uptime: 0.8 }, desc: 'Host a fintech startup.' },
    { id: 'ecom', name: 'E-commerce CDN', icon: '🛒', tier: 1, reward: 1200, duration: 45, req: { servers: 3, temp: 45, uptime: 0.85 }, desc: 'Power an online store.' },
    { id: 'bank', name: 'Bank Processing', icon: '🏦', tier: 2, reward: 3000, duration: 60, req: { servers: 5, temp: 40, uptime: 0.9, sec: 5 }, desc: 'Financial transaction processing.' },
    { id: 'ai_lab', name: 'AI Research Lab', icon: '🧬', tier: 2, reward: 4500, duration: 50, req: { gpu: 2, temp: 45, uptime: 0.85 }, desc: 'Train machine learning models.' },
    { id: 'gov', name: 'Government Cloud', icon: '🏛️', tier: 3, reward: 8000, duration: 90, req: { servers: 8, temp: 38, uptime: 0.95, sec: 10 }, desc: 'Classified government workloads.' },
    { id: 'stream', name: 'Video Streaming', icon: '📺', tier: 2, reward: 3500, duration: 45, req: { storage: 3, temp: 42, uptime: 0.88 }, desc: 'Serve video to millions.' },
    { id: 'crypto', name: 'Crypto Exchange', icon: '₿', tier: 3, reward: 10000, duration: 60, req: { gpu: 4, temp: 40, uptime: 0.95, sec: 8 }, desc: 'High-frequency crypto trading.' },
    { id: 'healthcare', name: 'Healthcare Records', icon: '🏥', tier: 3, reward: 7000, duration: 75, req: { storage: 4, temp: 38, uptime: 0.98, sec: 12 }, desc: 'Store patient health records.' },
];

// ─── RANDOM EVENTS ───────────────────────────────────────────
export const EVENTS = [
    { id: 'new_client', msg: '🎉 New enterprise client signed! Load +20%', type: 'good', effect: 'load_up', val: 0.2 },
    { id: 'ai_job', msg: '🤖 AI training job arrived! GPU demand up.', type: 'good', effect: 'gpu_load', val: 0.25 },
    { id: 'peak', msg: '📈 Traffic peak hour! Revenue +30% for 10s.', type: 'good', effect: 'rev_boost', val: 1.3, duration: 10 },
    { id: 'ddos', msg: '💀 DDoS attack! Lost funds.', type: 'bad', effect: 'lose_money', val: 500 },
    { id: 'power_spike', msg: '⚡ Power grid spike! Load fluctuating.', type: 'warn', effect: 'load_spike', val: 0.2 },
    { id: 'hardware', msg: '🔧 Hardware failure! Server offline briefly.', type: 'bad', effect: 'downtime', val: 0.2 },
    { id: 'investor', msg: '💰 Investor interest! Bonus $1000.', type: 'good', effect: 'bonus_money', val: 1000 },
    { id: 'hack', msg: '🔓 Security breach attempted! (Blocked)', type: 'warn', effect: 'sec_check', val: 0 },
    { id: 'audit', msg: '✅ Infrastructure audit passed! Rating boost.', type: 'good', effect: 'rating_up', val: 5 },
    { id: 'green_award', msg: '🌱 Eco award received! Green press coverage.', type: 'good', effect: 'bonus_money', val: 800 },
];

// ─── ACHIEVEMENTS ────────────────────────────────────────────
export const ACHIEVEMENTS = [
    { id: 'first_server', name: 'First Server', icon: '🖥', desc: 'Place your first server', check: (g) => g.comps.some(c => c.type === 'SERVER') },
    { id: 'hot_stuff', name: 'Hot Stuff', icon: '🌡️', desc: 'Reach 60°C average temp', check: (g) => g.metrics.temp > 60 },
    { id: 'cool_operator', name: 'Cool Operator', icon: '❄️', desc: 'Keep temp below 25°C', check: (g) => g.metrics.temp < 25 && g.comps.length > 3 },
    { id: 'millionaire', name: 'Millionaire', icon: '💰', desc: 'Earn $1,000,000', check: (g) => g.totalEarned >= 1000000 },
    { id: 'empire', name: 'Data Empire', icon: '🏢', desc: 'Have 10+ buildings', check: (g) => g.comps.length >= 10 },
    { id: 'contract_king', name: 'Contract King', icon: '📋', desc: 'Complete 5 contracts', check: (g) => g.completedContracts >= 5 },
    { id: 's_plus', name: 'S+ Rating', icon: '⭐', desc: 'Reach S+ datacenter rating', check: (g) => g.metrics.rating === 'S+' },
    { id: 'eco_friendly', name: 'Eco Friendly', icon: '🌱', desc: 'Have 3+ solar panels', check: (g) => g.comps.filter(c => c.type === 'SOLAR').length >= 3 },
];

export const GRID_COLS = 22;
export const GRID_ROWS = 13;