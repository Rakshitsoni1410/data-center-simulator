/**
 * ShopItem — a buildable item card in the Build panel
 * Props: item, selected (id), canAfford (bool), onSelect callback
 */
export default function ShopItem({ item, selected, canAfford, onSelect }) {
  const active = selected === item.id;

  return (
    <div
      onClick={onSelect}
      onMouseEnter={(e) => {
        if (canAfford) e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
      style={{
        background: active ? item.color + "33" : "#1e293b",
        border: active
          ? `1.5px solid ${item.border}`
          : "1px solid #1e3a5f",
        borderRadius: 10,
        padding: "10px 12px",
        cursor: "pointer",
        opacity: canAfford ? 1 : 0.45,
        transition: "border-color .15s, transform .1s",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 3,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>
          {item.icon} {item.label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#4ade80" }}>
          ${item.cost}
        </span>
      </div>
      <div style={{ fontSize: 11, color: "#64748b" }}>{item.desc}</div>
    </div>
  );
}
