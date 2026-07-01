/**
 * HeatBar — stat tile that shows heat % with a colored progress bar
 */
export default function HeatBar({ heat }) {
  const color =
    heat > 80 ? "#ef4444" : heat > 50 ? "#f59e0b" : "#22c55e";

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
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span style={{ fontSize: 14 }}>🌡️</span>Heat
      </div>
      <div
        style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1.1 }}
      >
        {Math.round(heat)}%
      </div>
      <div
        style={{
          height: 4,
          background: "#0f172a",
          borderRadius: 2,
          marginTop: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: heat + "%",
            background: color,
            borderRadius: 2,
            transition: "width .4s",
          }}
        />
      </div>
    </div>
  );
}
