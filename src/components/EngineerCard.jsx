/**
 * EngineerCard — shows one engineer with hire button or "Hired" badge
 * Props:
 *   eng       – engineer object from data/engineers.js
 *   hired     – bool
 *   canAfford – bool
 *   onHire    – callback
 */
export default function EngineerCard({ eng, hired, canAfford, onHire }) {
  return (
    <div
      style={{
        background: "#1e293b",
        border: hired ? `1.5px solid ${eng.fg}` : "1px solid #1e3a5f",
        borderRadius: 12,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: eng.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 13,
          color: eng.fg,
          flexShrink: 0,
        }}
      >
        {eng.initials}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 3,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>
            {eng.name}
          </span>
          <span
            style={{
              fontSize: 10,
              padding: "1px 7px",
              borderRadius: 20,
              background: eng.bg,
              color: eng.fg,
              fontWeight: 600,
            }}
          >
            {eng.skill}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "#64748b" }}>{eng.bonus}</div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
          Upkeep: ${eng.salary}/tick · Hire cost: ${eng.salary * 6}
        </div>
      </div>

      {/* Action */}
      {hired ? (
        <span
          style={{
            fontSize: 11,
            padding: "3px 8px",
            borderRadius: 6,
            background: eng.bg,
            color: eng.fg,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          Hired ✓
        </span>
      ) : (
        <button
          onClick={onHire}
          disabled={!canAfford}
          style={{
            fontSize: 11,
            padding: "5px 12px",
            borderRadius: 6,
            background: canAfford ? "#6d28d9" : "#1e293b",
            border: `1px solid ${canAfford ? "#7c3aed" : "#1e3a5f"}`,
            color: canAfford ? "#fff" : "#475569",
            cursor: canAfford ? "pointer" : "not-allowed",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          Hire
        </button>
      )}
    </div>
  );
}
