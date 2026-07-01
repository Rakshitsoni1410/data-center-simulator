/**
 * Notification — sticky toast banner shown for ~3.5 seconds after events
 * type: "g" green, "b" red, "a" blue, "w" amber
 */
export default function Notification({ notification }) {
  if (!notification) return null;

  const colorMap = { g: "#4ade80", b: "#f87171", a: "#60a5fa", w: "#fbbf24" };
  const color = colorMap[notification.type] || "#94a3b8";

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        marginBottom: 8,
        padding: "8px 14px",
        background: "#1e293b",
        border: `1px solid ${color}44`,
        borderRadius: 8,
        fontSize: 13,
        color,
        fontWeight: 600,
        animation: "slidein .25s ease",
      }}
    >
      {notification.msg}
    </div>
  );
}
