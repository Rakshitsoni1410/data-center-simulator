import { ITEMS } from "../data/items";

/**
 * GridCell — a single tile on the data-center floor
 * Props:
 *   cell     – item id string or null
 *   idx      – grid index
 *   broken   – boolean, show broken indicator
 *   selected – currently selected build item id
 *   onPlace  – callback(idx)
 */
export default function GridCell({ cell, idx, broken, selected, onPlace }) {
  const item    = ITEMS.find((x) => x.id === cell);
  const selItem = ITEMS.find((x) => x.id === selected);

  function handleMouseEnter(e) {
    e.currentTarget.style.transform = "scale(1.12)";
    e.currentTarget.style.boxShadow = "0 0 0 2px #3b82f6";
  }
  function handleMouseLeave(e) {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "none";
  }

  return (
    <div
      onClick={() => onPlace(idx)}
      title={
        cell
          ? (broken ? "[BROKEN] " : "") + (item?.label || "")
          : "Place " + (selItem?.label || "item")
      }
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        aspectRatio: "1",
        borderRadius: 8,
        border: broken
          ? "2px solid #ef4444"
          : item
          ? `1.5px solid ${item.border}`
          : "1px solid #1e3a5f",
        background: item ? item.color + "22" : "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        cursor: "pointer",
        position: "relative",
        userSelect: "none",
        animation: broken ? "blink 1s infinite" : undefined,
        transition: "transform .1s, box-shadow .1s",
      }}
    >
      {item ? (
        item.icon
      ) : (
        <span style={{ color: "#1e3a5f", fontSize: 14 }}>+</span>
      )}
      {broken && (
        <span
          style={{ position: "absolute", top: 2, right: 2, fontSize: 10 }}
        >
          💥
        </span>
      )}
    </div>
  );
}
