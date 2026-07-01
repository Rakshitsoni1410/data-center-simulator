/**
 * StatCard — top-bar stat display tile
 * Props: icon (emoji), label, value, sub (optional small text), color (optional)
 */
export default function StatCard({ icon, label, value, sub, color }) {
  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: 10,
        padding: "10px 14px",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#94a3b8",
          marginBottom: 2,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span style={{ fontSize: 14 }}>{icon}</span>
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: color || "#f1f5f9",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{sub}</div>
      )}
    </div>
  );
}
