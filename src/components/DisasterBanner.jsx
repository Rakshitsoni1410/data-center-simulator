import { BUILDINGS } from '../data/gameData';

export default function DisasterBanner({ gameState }) {
  const { activeDisaster, disasterTimer, respondToDisaster, comps, staff } = gameState;
  if (!activeDisaster) return null;

  const fixDef = activeDisaster.fix ? BUILDINGS[activeDisaster.fix] : null;
  const hasFixBuilding = activeDisaster.fix && comps.some(c => c.type === activeDisaster.fix);
  const fixStaffMap = { COOLER: 'cooling', SECURITY: 'security' };
  const hasFixStaff = staff.some(s => s.skill === 'repair' || s.skill === fixStaffMap[activeDisaster.fix]);
  const ready = hasFixBuilding || hasFixStaff;

  return (
    <div style={{
      position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
      zIndex: 20, display: 'flex', alignItems: 'center', gap: 12,
      background: '#1a0606', border: `2px solid ${activeDisaster.color}`,
      boxShadow: `0 0 16px ${activeDisaster.color}66`,
      padding: '10px 16px', fontFamily: "'Press Start 2P', monospace",
      animation: 'disasterPulse 1.2s infinite',
      maxWidth: '92%',
    }}>
      <div style={{ fontSize: 22, lineHeight: 1 }}>{activeDisaster.icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 8, color: activeDisaster.color, letterSpacing: 1, marginBottom: 3 }}>
          {activeDisaster.name.toUpperCase()}
        </div>
        <div style={{ fontSize: 5.5, color: '#cc8888', lineHeight: 1.6, marginBottom: 4 }}>
          {activeDisaster.desc}
        </div>
        <div style={{ fontSize: 5, color: ready ? '#39ff14' : '#ff6644' }}>
          {ready
            ? `Ready to resolve with ${fixDef?.label || 'staff'}`
            : `Need: ${fixDef?.label || 'right staff'}`}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <div style={{ fontSize: 14, color: activeDisaster.color, textShadow: `0 0 8px ${activeDisaster.color}` }}>
          {disasterTimer}s
        </div>
        <button
          onClick={respondToDisaster}
          disabled={!ready}
          style={{
            padding: '6px 10px', fontFamily: "'Press Start 2P', monospace", fontSize: 6,
            background: ready ? '#39ff14' : 'transparent',
            border: `2px solid ${ready ? '#39ff14' : '#3a2a2a'}`,
            color: ready ? '#000' : '#5a3a3a',
            cursor: ready ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap',
          }}
        >RESPOND</button>
      </div>
      <style>{`
        @keyframes disasterPulse {
          0%, 100% { box-shadow: 0 0 16px ${activeDisaster.color}66; }
          50% { box-shadow: 0 0 28px ${activeDisaster.color}aa; }
        }
      `}</style>
    </div>
  );
}