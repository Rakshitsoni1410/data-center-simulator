import { useEffect, useState } from "react";

const STYLES = {
  bad: { color: "#ff2244", icon: "✕" },
  warn: { color: "#ffe000", icon: "!" },
  good: { color: "#39ff14", icon: "✓" },
};
const styleFor = (type) => STYLES[type] || STYLES.good;

const MAX_VISIBLE = 5;
const EXIT_MS = 220;

/**
 * Each toast manages its own enter/exit animation locally. `useGameState`
 * removes a toast from the `toasts` array the instant its 3200ms lifetime is
 * up — instead of disappearing with a hard cut, this toast schedules its own
 * exit animation slightly before that, on its own timer set once at mount,
 * so there's no parent-side diffing or render-time state derivation.
 */
export default function Toasts({ toasts }) {
  const visible = toasts.slice(-MAX_VISIBLE);
  const overflowCount = Math.max(0, toasts.length - visible.length);

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
        maxWidth: "min(320px, 86vw)",
        alignItems: "flex-end",
      }}
    >
      {overflowCount > 0 && (
        <div style={{ fontSize: 5, color: "#3a5a3a", letterSpacing: 0.5, padding: "2px 4px" }}>
          +{overflowCount} more
        </div>
      )}
      {visible.map((t) => (
        <Toast key={t.id} toast={t} />
      ))}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: none; max-height: 60px; }
          to   { opacity: 0; transform: translateX(16px) scale(.96); max-height: 0; }
        }
      `}</style>
    </div>
  );
}

function Toast({ toast }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setExiting(true), 3200 - EXIT_MS);
    return () => clearTimeout(t);
  }, []);

  const s = styleFor(toast.type);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 7,
        fontSize: 6,
        lineHeight: 1.6,
        padding: "8px 12px",
        letterSpacing: 0.5,
        borderLeft: `3px solid ${s.color}`,
        background: "#0d150d",
        color: s.color,
        boxShadow: "0 2px 12px #00000099",
        width: "100%",
        boxSizing: "border-box",
        wordBreak: "break-word",
        animation: exiting ? `toastOut ${EXIT_MS}ms ease forwards` : "toastIn .25s ease",
      }}
    >
      <span style={{ flexShrink: 0, opacity: 0.85 }}>{s.icon}</span>
      <span>{toast.msg}</span>
    </div>
  );
}