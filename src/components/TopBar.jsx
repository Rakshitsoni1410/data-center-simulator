const fm = (n) => n >= 1e6 ? `$${(n/1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${Math.floor(n)}`;

function StatChip({ icon, label, value, warn, bad }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0 12px', borderRight:'2px solid #141e14', flexShrink:0, height:'100%' }}>
      <span style={{ fontSize:15 }}>{icon}</span>
      <div>
        <div style={{ fontSize:5, color:'#2a4a2a', letterSpacing:.5, marginBottom:1 }}>{label}</div>
        <div style={{
          fontFamily:"'Press Start 2P',monospace",
          fontSize:'clamp(8px,1.3vw,11px)',
          color: bad ? '#ff2244' : warn ? '#ffe000' : '#39ff14',
          textShadow: bad ? '0 0 6px #ff224433' : warn ? '0 0 6px #ffe00033' : '0 0 6px #39ff1433',
          animation: bad ? 'badBlink .5s infinite' : 'none',
        }}>{value}</div>
      </div>
    </div>
  );
}

export default function TopBar({ gameState }) {
  const { profile, money, metrics, speed, toggleSpeed, prestigeLevel, netWorth, prestigeRequirement, canPrestige, doPrestige } = gameState;
  const { rev, power, temp, pue, rating } = metrics;
  const prestigePct = Math.min(100, (netWorth / prestigeRequirement) * 100);

  return (
    <div style={{
      height:52, background:'#0d150d', borderBottom:'3px solid #1e301e',
      display:'flex', alignItems:'center', flexShrink:0, position:'relative',
      fontFamily:"'Press Start 2P',monospace",
    }}>
      {/* glow line */}
      <div style={{ position:'absolute', bottom:-1, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,#39ff14,transparent)' }} />

      {/* Brand */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0 14px', borderRight:'2px solid #141e14', height:'100%', minWidth:'clamp(140px,18vw,180px)' }}>
        <div style={{ fontSize:20, color:'#39ff14', textShadow:'0 0 10px #39ff14', animation:'logoPulse 3s infinite' }}>⬡</div>
        <div>
          <div style={{ fontSize:'clamp(6px,1.2vw,9px)', color:'#39ff14', letterSpacing:1, textShadow:'0 0 6px #39ff1488', lineHeight:1.4 }}>
            {profile?.company?.toUpperCase() || 'COMPANY'}
          </div>
          <div style={{ fontSize:5, color:'#2a4a2a', marginTop:1 }}>CEO: {profile?.name || '—'} {prestigeLevel > 0 && <span style={{ color:'#ffd700' }}>★{prestigeLevel}</span>}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'flex', flex:1, overflowX:'auto', height:'100%' }}>
        <StatChip icon="💰" label="FUNDS"   value={fm(money)} />
        <StatChip icon="📈" label="REV/S"   value={`${fm(rev)}/S`} />
        <StatChip icon="🔋" label="POWER"   value={`${power.toFixed(1)}kW`} warn={power>30} />
        <StatChip icon="🌡" label="TEMP"    value={`${temp.toFixed(0)}°C`} warn={temp>36} bad={temp>50} />
        <StatChip icon="📊" label="PUE"     value={pue.toFixed(2)} warn={pue>1.5} bad={pue>2} />
        <StatChip icon="⭐" label="RATING"  value={rating} bad={rating==='F'} warn={rating==='D'||rating==='C'} />
      </div>

      {/* Prestige */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'0 12px', borderRight:'2px solid #141e14', flexShrink:0, minWidth:130 }}>
        <button onClick={doPrestige} disabled={!canPrestige} title="Acquire a new Data Center for a permanent revenue boost" style={{
          padding:'5px 9px', fontFamily:"'Press Start 2P',monospace", fontSize:6, whiteSpace:'nowrap',
          background: canPrestige ? '#1a1400' : 'transparent',
          border:`2px solid ${canPrestige ? '#ffd700' : '#2a2a1a'}`,
          color: canPrestige ? '#ffd700' : '#4a4a3a',
          cursor: canPrestige ? 'pointer' : 'not-allowed',
          boxShadow: canPrestige ? '0 0 8px #ffd70044' : 'none',
        }}>🌟 NEW DATA CENTER</button>
        <div style={{ width:'100%', height:4, background:'#050a05', border:'1px solid #141e14' }}>
          <div style={{ height:'100%', width:`${prestigePct}%`, background: canPrestige ? '#ffd700' : '#3a5a3a', transition:'width .5s' }} />
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0 12px', flexShrink:0 }}>
        <div style={{ width:34, height:34, border:'2px solid #39ff14', background:'#0a120a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, boxShadow:'0 0 8px #39ff1433' }}>
          {profile?.emoji || '?'}
        </div>
        <button onClick={toggleSpeed} style={{
          padding:'5px 10px', fontFamily:"'Press Start 2P',monospace", fontSize:7,
          background: speed > 1 ? '#141000' : 'transparent',
          border:`2px solid ${speed>1?'#ffe000':'#1e301e'}`,
          color: speed > 1 ? '#ffe000' : '#3a5a3a', cursor:'pointer', transition:'.2s',
        }}>▶▶ {speed}X</button>
      </div>

      <style>{`
        @keyframes logoPulse { 0%,100%{text-shadow:0 0 8px #39ff14}50%{text-shadow:0 0 20px #39ff14,0 0 40px #39ff1466} }
        @keyframes badBlink { 50%{opacity:.3} }
      `}</style>
    </div>
  );
}