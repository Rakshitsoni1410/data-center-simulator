import { BUILDINGS } from '../data/gameData';

const TOOLS = [
  { id:'select', icon:'↖', label:'SELECT', cost:null },
  { id:'delete', icon:'🔨', label:'DEMO',   cost:null },
];
const SECTIONS = [
  { label:'COMPUTE', tools:['SERVER','GPU','STORAGE','SWITCH'] },
  { label:'INFRA',   tools:['COOLING','UPS','SOLAR','FIREWALL'] },
];

export default function Toolbar({ tool, setTool }) {
  return (
    <div style={{
      width:'clamp(58px,7vw,82px)', background:'#0d150d', borderRight:'3px solid #141e14',
      display:'flex', flexDirection:'column', alignItems:'center',
      padding:'6px 0', gap:2, overflowY:'auto', flexShrink:0,
      fontFamily:"'Press Start 2P',monospace",
    }}>
      {/* Tool buttons */}
      <div style={{ fontSize:5, color:'#1e301e', letterSpacing:2, margin:'7px 0 3px', textAlign:'center', width:'100%' }}>TOOLS</div>
      {TOOLS.map(t => (
        <button key={t.id} onClick={() => setTool(t.id)} style={{
          width:'clamp(48px,6vw,66px)', height:'clamp(48px,6vw,66px)',
          background: tool === t.id ? '#091409' : '#0a120a',
          border:`2px solid ${tool===t.id?'#39ff14':'#141e14'}`,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          cursor:'pointer', gap:3, outline:'none', position:'relative',
          boxShadow: tool===t.id ? '0 0 0 1px #39ff14,inset 0 0 14px #39ff1408' : 'none',
        }}>
          {tool === t.id && <div style={{ position:'absolute', left:-2, top:'20%', width:3, height:'60%', background:'#39ff14' }} />}
          <div style={{ fontSize:18, lineHeight:1 }}>{t.icon}</div>
          <div style={{ fontSize:5, color: tool===t.id ? '#39ff14' : '#2a4a2a', letterSpacing:.5 }}>{t.label}</div>
        </button>
      ))}

      {/* Building sections */}
      {SECTIONS.map(sec => (
        <div key={sec.label} style={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
          <div style={{ fontSize:5, color:'#1e301e', letterSpacing:2, margin:'7px 0 3px', textAlign:'center', width:'100%' }}>{sec.label}</div>
          {sec.tools.map(id => {
            const d = BUILDINGS[id];
            return (
              <button key={id} onClick={() => setTool(id)} title={d.desc} style={{
                width:'clamp(48px,6vw,66px)', height:'clamp(48px,6vw,66px)',
                background: tool === id ? '#091409' : '#0a120a',
                border:`2px solid ${tool===id?'#39ff14':'#141e14'}`,
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                cursor:'pointer', gap:2, outline:'none', position:'relative',
                boxShadow: tool===id ? '0 0 0 1px #39ff14' : 'none',
              }}>
                {tool === id && <div style={{ position:'absolute', left:-2, top:'20%', width:3, height:'60%', background:'#39ff14' }} />}
                <div style={{ fontSize:18, lineHeight:1 }}>{d.icon}</div>
                <div style={{ fontSize:5, color: tool===id?'#39ff14':'#2a4a2a', textAlign:'center', lineHeight:1.2 }}>{d.label.split(' ')[0].toUpperCase()}</div>
                <div style={{ fontSize:5, color:'#ffe000' }}>${d.cost}</div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}