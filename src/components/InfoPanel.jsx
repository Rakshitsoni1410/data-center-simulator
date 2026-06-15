import { useState } from 'react';
import { BUILDINGS, UPGRADES, CONTRACTS } from '../data/gameData';

const fm = (n) => n >= 1e6 ? `$${(n/1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${Math.floor(n)}`;

const BCOLORS = {
  SERVER:'#4499ff', GPU:'#bb66ff', STORAGE:'#44cc77', SWITCH:'#00ffbb',
  COOLING:'#00aaff', UPS:'#ffd700', SOLAR:'#ffdd00', FIREWALL:'#ff4455',
};

function InfoRow({ label, value, valueClass }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', fontSize:7, color:'#2a4a2a', marginBottom:4 }}>
      <span>{label}</span>
      <span style={{ color: valueClass === 'good' ? '#39ff14' : valueClass === 'warn' ? '#ffe000' : valueClass === 'bad' ? '#ff2244' : '#8aaa8a' }}>{value}</span>
    </div>
  );
}

function BuildingDetail({ comp, money, getCompTemp, onUpgrade, onDemolish }) {
  if (!comp) return (
    <div style={{ padding:'10px 14px' }}>
      <div style={{ fontSize:7, color:'#00ffee', letterSpacing:2, marginBottom:8, borderBottom:'1px solid #141e14', paddingBottom:4 }}>SELECT A BUILDING</div>
      <div style={{ fontSize:6, color:'#1e301e', lineHeight:2.2 }}>
        CLICK TO INSPECT<br/>
        RIGHT-CLICK TO DEMOLISH<br/>
        DRAG BUILDINGS TO MOVE<br/>
        USE TOOLBAR TO BUILD
      </div>
    </div>
  );

  const d = BUILDINGS[comp.type];
  const temp = getCompTemp(comp);
  const upCost = comp.level * 900;
  const canUp = money >= upCost && comp.level < 5;
  const lc = comp.load > .85 ? 'bad' : comp.load > .65 ? 'warn' : 'good';
  const tc = temp > 55 ? 'bad' : temp > 38 ? 'warn' : 'good';
  const uc = comp.uptime < .8 ? 'bad' : comp.uptime < .95 ? 'warn' : 'good';

  return (
    <div style={{ padding:'10px 14px', overflowY:'auto', height:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <div style={{ width:32, height:32, background:'#0a120a', border:`2px solid ${BCOLORS[comp.type]}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{d.icon}</div>
        <div>
          <div style={{ fontSize:8, color: BCOLORS[comp.type], letterSpacing:1 }}>{d.label.toUpperCase()}</div>
          <div style={{ fontSize:5, color:'#3a5a3a', marginTop:1 }}>{d.desc}</div>
        </div>
      </div>
      <InfoRow label="LEVEL"   value={`★ ${comp.level} / 5`} valueClass={comp.level >= 5 ? 'good' : 'warn'} />
      <InfoRow label="LOAD"    value={`${(comp.load*100).toFixed(0)}%`} valueClass={lc} />
      <InfoRow label="TEMP"    value={`${temp.toFixed(0)}°C`} valueClass={tc} />
      <InfoRow label="REV/S"   value={`+${fm(d.rev * comp.load * comp.level)}`} />
      <InfoRow label="POWER"   value={`${(d.power * comp.load).toFixed(1)} kW`} />
      <InfoRow label="UPTIME"  value={`${(comp.uptime*100).toFixed(0)}%`} valueClass={uc} />

      {comp.level < 5 ? (
        <button onClick={() => onUpgrade(comp.id)} disabled={!canUp} style={{
          marginTop:8, width:'100%', padding:'6px 4px',
          fontFamily:"'Press Start 2P',monospace", fontSize:6,
          background:'transparent', border:`2px solid ${canUp ? '#ffe000' : '#2a3a2a'}`,
          color: canUp ? '#ffe000' : '#2a3a2a', cursor: canUp ? 'pointer' : 'not-allowed', letterSpacing:.5,
        }}>⬆ UPGRADE LV{comp.level+1} — {fm(upCost)}</button>
      ) : (
        <div style={{ fontSize:6, color:'#ffe000', marginTop:8, textAlign:'center' }}>★ MAX LEVEL</div>
      )}
      <button onClick={() => onDemolish(comp.id)} style={{
        marginTop:6, width:'100%', padding:'5px 4px',
        fontFamily:"'Press Start 2P',monospace", fontSize:5,
        background:'transparent', border:'1px solid #ff224444', color:'#ff224488', cursor:'pointer',
      }}>🔨 DEMOLISH</button>
    </div>
  );
}

function UpgradesTab({ upgrades, money, comps, onBuy }) {
  return (
    <div style={{ padding:'8px 12px', overflowY:'auto', height:'100%' }}>
      {UPGRADES.map(upg => {
        const owned = upgrades.includes(upg.id);
        const canAfford = money >= upg.cost;
        const reqMet = Object.entries(upg.req).every(([type, cnt]) =>
          comps.filter(c => c.type === type).length >= cnt
        );
        const reqLabel = Object.entries(upg.req).map(([t,n]) => `${n}x ${BUILDINGS[t]?.label}`).join(', ');

        return (
          <div key={upg.id} style={{
            background: owned ? '#0a1a0a' : '#0a100a',
            border: `1px solid ${owned ? '#39ff1433' : '#1a2a1a'}`,
            padding:'8px 10px', marginBottom:6,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
              <span style={{ fontSize:14 }}>{upg.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:7, color: owned ? '#39ff14' : '#8aaa8a', letterSpacing:.5 }}>{upg.name}</div>
                <div style={{ fontSize:5, color:'#3a5a3a', marginTop:1 }}>{upg.desc}</div>
              </div>
              {owned ? (
                <div style={{ fontSize:6, color:'#39ff14' }}>✓ OWNED</div>
              ) : (
                <div style={{ fontSize:6, color: canAfford ? '#ffe000' : '#3a3a3a' }}>{fm(upg.cost)}</div>
              )}
            </div>
            {!owned && (
              <>
                <div style={{ fontSize:5, color:'#2a4a2a', marginBottom:4 }}>REQ: {reqLabel}</div>
                <button
                  onClick={() => onBuy(upg)}
                  disabled={!canAfford || !reqMet}
                  style={{
                    width:'100%', padding:'4px', fontFamily:"'Press Start 2P',monospace", fontSize:5,
                    background: canAfford && reqMet ? '#39ff14' : 'transparent',
                    border:`1px solid ${canAfford && reqMet ? '#39ff14' : '#1a2a1a'}`,
                    color: canAfford && reqMet ? '#000' : '#2a4a2a',
                    cursor: canAfford && reqMet ? 'pointer' : 'not-allowed',
                  }}
                >
                  {!reqMet ? '🔒 BUILD MORE' : !canAfford ? '💸 NOT ENOUGH' : '⬆ PURCHASE'}
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ContractsTab({ activeContracts, money, comps, metrics, onAccept }) {
  return (
    <div style={{ padding:'8px 12px', overflowY:'auto', height:'100%' }}>
      {/* Active */}
      {activeContracts.length > 0 && (
        <>
          <div style={{ fontSize:6, color:'#00ffee', letterSpacing:1, marginBottom:6 }}>ACTIVE ({activeContracts.length}/3)</div>
          {activeContracts.map(c => (
            <div key={c.id} style={{ background:'#0a1a14', border:'1px solid #1a3a2a', padding:'7px 9px', marginBottom:6 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <div style={{ fontSize:7, color:'#44cc77' }}>{c.icon} {c.name}</div>
                <div style={{ fontSize:6, color:'#ffe000' }}>+{fm(c.reward)}</div>
              </div>
              <div style={{ background:'#050a05', height:5, borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${((c.progress||0)/c.duration)*100}%`, background:'#39ff14', transition:'width .5s' }} />
              </div>
              <div style={{ fontSize:5, color:'#2a4a2a', marginTop:3 }}>{Math.round(c.progress||0)}s / {c.duration}s</div>
            </div>
          ))}
        </>
      )}

      <div style={{ fontSize:6, color:'#00ffee', letterSpacing:1, marginBottom:6, marginTop:activeContracts.length?8:0 }}>AVAILABLE CONTRACTS</div>
      {CONTRACTS.map(c => {
        const active = activeContracts.find(a => a.id === c.id);
        if (active) return null;
        const srvs = comps.filter(x=>x.type==='SERVER').length;
        const gpus = comps.filter(x=>x.type==='GPU').length;
        const stgs = comps.filter(x=>x.type==='STORAGE').length;
        const secOk = !c.req.sec || metrics.sec >= c.req.sec;
        const srvOk = !c.req.servers || srvs >= c.req.servers;
        const gpuOk = !c.req.gpu || gpus >= c.req.gpu;
        const stgOk = !c.req.storage || stgs >= c.req.storage;
        const tmpOk = metrics.temp <= c.req.temp;
        const upOk = metrics.avgUptime >= c.req.uptime;
        const canTake = srvOk && gpuOk && stgOk && secOk && tmpOk && upOk && activeContracts.length < 3;
        const tierColor = c.tier === 3 ? '#ff4455' : c.tier === 2 ? '#ffe000' : '#39ff14';

        return (
          <div key={c.id} style={{ background:'#0a0f0a', border:`1px solid ${canTake?'#1a3a1a':'#111811'}`, padding:'8px 10px', marginBottom:6, opacity: canTake ? 1 : .6 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
              <div style={{ fontSize:7, color:'#c0d0c0' }}>{c.icon} {c.name}</div>
              <div style={{ fontSize:6, color:tierColor }}>T{c.tier}</div>
            </div>
            <div style={{ fontSize:5, color:'#3a5a3a', marginBottom:5, lineHeight:1.7 }}>{c.desc}</div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
              <div style={{ fontSize:5, color:'#ffe000' }}>+{fm(c.reward)}</div>
              <div style={{ fontSize:5, color:'#2a4a2a' }}>{c.duration}s</div>
            </div>
            {/* Requirements */}
            <div style={{ fontSize:5, color:'#2a4a2a', marginBottom:5, lineHeight:1.8 }}>
              {c.req.servers && <span style={{ color: srvOk?'#39ff1466':'#ff224466' }}>🖥 {c.req.servers} Servers  </span>}
              {c.req.gpu    && <span style={{ color: gpuOk?'#39ff1466':'#ff224466' }}>🎮 {c.req.gpu} GPUs  </span>}
              {c.req.storage&& <span style={{ color: stgOk?'#39ff1466':'#ff224466' }}>💾 {c.req.storage} Storage  </span>}
              {c.req.sec    && <span style={{ color: secOk?'#39ff1466':'#ff224466' }}>🛡 Sec≥{c.req.sec}  </span>}
              {<span style={{ color: tmpOk?'#39ff1466':'#ff224466' }}>🌡 ≤{c.req.temp}°C  </span>}
              {<span style={{ color: upOk?'#39ff1466':'#ff224466' }}>⏱ ≥{Math.round(c.req.uptime*100)}% up</span>}
            </div>
            <button
              onClick={() => canTake && onAccept(c)}
              disabled={!canTake}
              style={{
                width:'100%', padding:'4px', fontFamily:"'Press Start 2P',monospace", fontSize:5,
                background: canTake ? '#39ff14' : 'transparent',
                border:`1px solid ${canTake?'#39ff14':'#1a2a1a'}`,
                color: canTake ? '#000' : '#2a4a2a',
                cursor: canTake ? 'pointer' : 'not-allowed',
              }}
            >{canTake ? '📋 ACCEPT' : '🔒 REQUIREMENTS NOT MET'}</button>
          </div>
        );
      })}
    </div>
  );
}

export default function InfoPanel({ gameState }) {
  const [tab, setTab] = useState('info');
  const { selectedComp, money, comps, metrics, upgrades, activeContracts, getCompTemp, upgradeComp, demolish, buyUpgrade, acceptContract } = gameState;

  const tabs = [
    { id:'info',      label:'INFO' },
    { id:'upgrades',  label:'UPGRADES' },
    { id:'contracts', label:'CONTRACTS' },
  ];

  return (
    <div style={{ height:148, background:'#0d150d', borderTop:'3px solid #141e14', display:'flex', flexShrink:0, fontFamily:"'Press Start 2P',monospace" }}>
      {/* Tab bar + content */}
      <div style={{ display:'flex', flexDirection:'column', width:220, borderRight:'2px solid #141e14', flexShrink:0 }}>
        <div style={{ display:'flex', borderBottom:'2px solid #141e14' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex:1, padding:'5px 2px', fontFamily:"'Press Start 2P',monospace", fontSize:5,
              background: tab===t.id ? '#0d1a0d' : 'transparent',
              border:'none', borderBottom: tab===t.id ? '2px solid #39ff14' : '2px solid transparent',
              color: tab===t.id ? '#39ff14' : '#2a4a2a', cursor:'pointer', letterSpacing:.5,
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{ flex:1, overflow:'hidden' }}>
          {tab === 'info' && <BuildingDetail comp={selectedComp} money={money} getCompTemp={getCompTemp} onUpgrade={upgradeComp} onDemolish={demolish} />}
          {tab === 'upgrades' && <UpgradesTab upgrades={upgrades} money={money} comps={comps} onBuy={buyUpgrade} />}
          {tab === 'contracts' && <ContractsTab activeContracts={activeContracts} money={money} comps={comps} metrics={metrics} onAccept={acceptContract} />}
        </div>
      </div>

      {/* Metrics sparklines */}
      <div style={{ flex:1, padding:'10px 14px', borderRight:'2px solid #141e14', overflow:'hidden' }}>
        <div style={{ fontSize:7, color:'#00ffee', letterSpacing:2, marginBottom:8 }}>METRICS</div>
        {(() => {
          const srvs = comps.filter(c=>c.type==='SERVER');
          const gpus = comps.filter(c=>c.type==='GPU');
          const cpuL = srvs.length ? srvs.reduce((a,c)=>a+c.load,0)/srvs.length : 0;
          const gpuL = gpus.length ? gpus.reduce((a,c)=>a+c.load,0)/gpus.length : 0;
          const tmpN = Math.min(1, Math.max(0, (metrics.temp-15)/65));
          const secN = Math.min(1, metrics.sec/20);
          const uptN = metrics.avgUptime;
          return [
            { n:'CPU LOAD',  v:cpuL, c: cpuL>.85?'#ff2244':cpuL>.65?'#ffe000':'#39ff14' },
            { n:'GPU LOAD',  v:gpuL, c: gpuL>.85?'#ff2244':gpuL>.65?'#ffe000':'#aa55ff' },
            { n:'AVG TEMP',  v:tmpN, c: metrics.temp>55?'#ff2244':metrics.temp>36?'#ffe000':'#39ff14' },
            { n:'SECURITY',  v:secN, c:'#ffe000' },
            { n:'AVG UPTIME',v:uptN, c: uptN<.8?'#ff2244':uptN<.95?'#ffe000':'#39ff14' },
          ].map(s => (
            <div key={s.n} style={{ marginBottom:5 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                <div style={{ fontSize:5, color:'#2a4a2a', letterSpacing:.5 }}>{s.n}</div>
                <div style={{ fontSize:5, color:s.c, fontFamily:"'Press Start 2P',monospace" }}>{(s.v*100).toFixed(0)}%</div>
              </div>
              <div style={{ height:6, background:'#050a05', border:'1px solid #141e14', position:'relative' }}>
                <div style={{ height:'100%', width:`${(s.v*100).toFixed(0)}%`, background:s.c, transition:'width .7s' }} />
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Event Log */}
      <div style={{ width:200, padding:'10px 12px', overflowY:'auto', flexShrink:0 }}>
        <div style={{ fontSize:7, color:'#00ffee', letterSpacing:2, marginBottom:6 }}>EVENT LOG</div>
        {gameState.log.slice(0,20).map(l => (
          <div key={l.id} style={{ display:'flex', gap:4, fontSize:5, lineHeight:1.8 }}>
            <span style={{ color:'#141e14', flexShrink:0 }}>{l.ts}</span>
            <span style={{ color: l.type==='good'?'#39ff14':l.type==='warn'?'#ffe000':l.type==='bad'?'#ff2244':'#2a5a5a' }}>{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}