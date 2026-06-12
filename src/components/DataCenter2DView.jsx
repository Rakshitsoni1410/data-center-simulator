import { useState } from "react";
import ServerRack2D from "./ServerRack2D";
import FloorMap2D from "./FloorMap2D";
import BuildingView2D from "./BuildingView2D";

export default function DataCenter2DView({
  servers = [],
  money = 0,
  temperature = 20,
  cooling = 1,
  security = 1,
  electricity = 0,
  employees = [],
  clients = [],
  darkMode = true,
}) {
  const [activeTab, setActiveTab] = useState("rack");

  const tabs = [
    { id: "rack", label: "🖥 Server Room" },
    { id: "floor", label: "🗺 Floor Map" },
    { id: "building", label: "🏢 Building View" },
  ];

  const tabBase = {
    padding: "8px 16px",
    borderRadius: "8px 8px 0 0",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    border: "0.5px solid transparent",
    transition: "all 0.15s",
  };

  const tabActive = {
    ...tabBase,
    background: darkMode ? "#1e293b" : "#ffffff",
    borderColor: darkMode ? "#1e3a5f" : "#cbd5e1",
    borderBottomColor: darkMode ? "#1e293b" : "#ffffff",
    color: darkMode ? "#e2e8f0" : "#0f172a",
  };

  const tabInactive = {
    ...tabBase,
    background: "transparent",
    color: darkMode ? "#64748b" : "#64748b",
  };

  const wrapperStyle = {
    background: darkMode ? "#1e293b" : "#ffffff",
    border: `0.5px solid ${darkMode ? "#1e3a5f" : "#cbd5e1"}`,
    borderRadius: "0 8px 8px 8px",
    padding: 12,
  };

  const sharedProps = {
    servers, money, temperature, cooling,
    security, electricity, employees, clients, darkMode,
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 6, borderBottom: `0.5px solid ${darkMode ? "#1e3a5f" : "#cbd5e1"}` }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            style={activeTab === t.id ? tabActive : tabInactive}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={wrapperStyle}>
        {activeTab === "rack" && <ServerRack2D servers={servers} darkMode={darkMode} />}
        {activeTab === "floor" && <FloorMap2D {...sharedProps} />}
        {activeTab === "building" && <BuildingView2D {...sharedProps} />}
      </div>
    </div>
  );
}