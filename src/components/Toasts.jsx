export default function Toasts({ toasts }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 62,
        right: 12,
        display: "flex",
        flexDirection: "column",
        gap: 5,
        zIndex: 9999,
        pointerEvents: "none",
        fontFamily: "'Press Start 2P',monospace",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            fontSize: 6,
            padding: "8px 12px",
            letterSpacing: 0.5,
            borderLeft: `3px solid ${t.type === "bad" ? "#ff2244" : t.type === "warn" ? "#ffe000" : "#39ff14"}`,
            background: "#0d150d",
            color:
              t.type === "bad"
                ? "#ff2244"
                : t.type === "warn"
                  ? "#ffe000"
                  : "#39ff14",
            boxShadow: "0 2px 12px #00000099",
            animation: "toastIn .25s ease",
          }}
        >
          {t.msg}
        </div>
      ))}
      <style>{`
        @keyframes toastIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  );
}
