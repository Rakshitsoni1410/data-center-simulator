import { TIER_COLORS, TIER_TEXT } from "../data/clients";

/**
 * ClientCard — shows one client contract (pending, active, or lost)
 * Props:
 *   client     – client object with status field
 *   canAccept  – bool, whether grid meets requirements
 *   onAccept   – callback to sign the contract
 */
export default function ClientCard({ client, canAccept, onAccept }) {
  const tierBg = TIER_COLORS[client.tier];
  const tierFg = TIER_TEXT[client.tier];

  const statusColor =
    client.status === "active"
      ? "#4ade80"
      : client.status === "pending"
      ? "#f59e0b"
      : "#f87171";

  const statusLabel =
    client.status === "active"
      ? "Active"
      : client.status === "pending"
      ? "Offer"
      : "Lost";

  const reqStr = Object.entries(client.req)
    .map(([k, v]) => `${v}× ${k}`)
    .join(", ");

  return (
    <div
      style={{
        background: "#1e293b",
        border: `1px solid ${statusColor}33`,
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
          background: tierBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 13,
          color: tierFg,
          flexShrink: 0,
        }}
      >
        {client.abbr}
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
            {client.name}
          </span>
          <span
            style={{
              fontSize: 10,
              padding: "1px 7px",
              borderRadius: 20,
              background: tierBg,
              color: tierFg,
              fontWeight: 600,
            }}
          >
            Tier {client.tier}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "#64748b" }}>
          ${client.pay}/tick · SLA {client.sla}% · {client.type} · Needs:{" "}
          {reqStr}
        </div>
      </div>

      {/* Status badge + Accept button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 11,
            padding: "3px 8px",
            borderRadius: 6,
            background: statusColor + "22",
            color: statusColor,
            fontWeight: 600,
          }}
        >
          {statusLabel}
        </span>

        {client.status === "pending" && (
          <button
            onClick={onAccept}
            disabled={!canAccept}
            style={{
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 6,
              background: canAccept ? "#3b82f6" : "#1e3a5f",
              border: "none",
              color: canAccept ? "#fff" : "#64748b",
              cursor: canAccept ? "pointer" : "not-allowed",
              fontWeight: 600,
            }}
          >
            {canAccept ? "Accept" : "Missing req"}
          </button>
        )}
      </div>
    </div>
  );
}
