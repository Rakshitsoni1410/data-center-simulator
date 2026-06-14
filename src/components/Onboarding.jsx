import { useState, useEffect, useRef } from "react";
import { CHARACTERS } from "../data/gameData";

// ── Pixel character SVG sprites ────────────────────────────────
function CharSprite({ charId, size = 80 }) {
  const configs = {
    alex: {
      hairColor: "#3a2010",
      bodyColor: "#1a44cc",
      hairStyle: "short",
      glasses: false,
      tie: true,
    },
    rohan: {
      hairColor: "#101030",
      bodyColor: "#1a6622",
      hairStyle: "flat",
      glasses: true,
      tie: false,
    },
    priya: {
      hairColor: "#8b1a1a",
      bodyColor: "#cc1a44",
      hairStyle: "long",
      glasses: false,
      tie: false,
    },
    sara: {
      hairColor: "#111111",
      bodyColor: "#7722cc",
      hairStyle: "bun",
      glasses: false,
      tie: false,
    },
  };
  const cfg = configs[charId] || configs.alex;
  const s = size;
  const sc = s / 100;

  return (
    <svg
      width={s * 0.7}
      height={s}
      viewBox="0 0 70 100"
      style={{ overflow: "visible" }}
    >
      {/* Shadow */}
      <ellipse cx="35" cy="98" rx="20" ry="3" fill="rgba(0,0,0,0.3)" />
      {/* Legs */}
      <rect x="22" y="70" width="10" height="25" rx="3" fill="#1a1a2a" />
      <rect x="38" y="70" width="10" height="25" rx="3" fill="#1a1a2a" />
      {/* Shoes */}
      <rect x="20" y="90" width="14" height="6" rx="2" fill="#0a0a0a" />
      <rect x="36" y="90" width="14" height="6" rx="2" fill="#0a0a0a" />
      {/* Body */}
      <rect x="18" y="42" width="34" height="32" rx="4" fill={cfg.bodyColor} />
      {/* Body highlight */}
      <rect
        x="18"
        y="42"
        width="34"
        height="6"
        rx="4"
        fill={cfg.bodyColor + "dd"}
      />
      <rect x="18" y="42" width="4" height="32" fill={cfg.bodyColor + "cc"} />
      {/* Tie */}
      {cfg.tie && <polygon points="35,44 38,44 36.5,62 35,44" fill="#cc0000" />}
      {/* Arms */}
      <rect x="7" y="44" width="12" height="8" rx="3" fill={cfg.bodyColor} />
      <rect x="51" y="44" width="12" height="8" rx="3" fill={cfg.bodyColor} />
      {/* Hands */}
      <circle cx="11" cy="56" r="5" fill="#f5c07a" />
      <circle cx="59" cy="56" r="5" fill="#f5c07a" />
      {/* Neck */}
      <rect x="30" y="36" width="10" height="8" rx="2" fill="#f5c07a" />
      {/* Head */}
      <rect x="18" y="12" width="34" height="30" rx="10" fill="#f5c07a" />
      {/* Ear */}
      <rect x="14" y="22" width="6" height="10" rx="3" fill="#f5c07a" />
      <rect x="50" y="22" width="6" height="10" rx="3" fill="#f5c07a" />
      {/* Hair */}
      {cfg.hairStyle === "short" && (
        <>
          <rect
            x="16"
            y="8"
            width="38"
            height="18"
            rx="10"
            fill={cfg.hairColor}
          />
          <rect
            x="50"
            y="14"
            width="5"
            height="12"
            rx="3"
            fill={cfg.hairColor}
          />
        </>
      )}
      {cfg.hairStyle === "flat" && (
        <rect x="14" y="8" width="42" height="16" rx="8" fill={cfg.hairColor} />
      )}
      {cfg.hairStyle === "long" && (
        <>
          <rect
            x="14"
            y="6"
            width="42"
            height="20"
            rx="10"
            fill={cfg.hairColor}
          />
          <rect
            x="12"
            y="12"
            width="8"
            height="28"
            rx="4"
            fill={cfg.hairColor}
          />
          <rect
            x="50"
            y="12"
            width="8"
            height="28"
            rx="4"
            fill={cfg.hairColor}
          />
        </>
      )}
      {cfg.hairStyle === "bun" && (
        <>
          <rect
            x="14"
            y="8"
            width="42"
            height="18"
            rx="10"
            fill={cfg.hairColor}
          />
          <circle cx="35" cy="5" r="8" fill={cfg.hairColor} />
        </>
      )}
      {/* Eyes */}
      <circle cx="27" cy="26" r="4" fill="white" />
      <circle cx="43" cy="26" r="4" fill="white" />
      <circle cx="28" cy="27" r="2.5" fill="#1a0a00" />
      <circle cx="44" cy="27" r="2.5" fill="#1a0a00" />
      <circle cx="28.8" cy="26.2" r="0.8" fill="white" />
      <circle cx="44.8" cy="26.2" r="0.8" fill="white" />
      {/* Glasses */}
      {cfg.glasses && (
        <>
          <rect
            x="22"
            y="23"
            width="12"
            height="8"
            rx="3"
            fill="none"
            stroke="#aaaaaa"
            strokeWidth="1.5"
          />
          <rect
            x="36"
            y="23"
            width="12"
            height="8"
            rx="3"
            fill="none"
            stroke="#aaaaaa"
            strokeWidth="1.5"
          />
          <line
            x1="34"
            y1="27"
            x2="36"
            y2="27"
            stroke="#aaaaaa"
            strokeWidth="1.5"
          />
        </>
      )}
      {/* Mouth */}
      <path
        d="M28 34 Q35 39 42 34"
        fill="none"
        stroke="#c0603a"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Eyebrows */}
      <path
        d="M23 21 Q27 19 31 21"
        fill="none"
        stroke={cfg.hairColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M39 21 Q43 19 47 21"
        fill="none"
        stroke={cfg.hairColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Animated BG Canvas ────────────────────────────────────────
function ParticleBG() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let W,
      H,
      pts = [],
      raf;
    function resize() {
      W = c.width = c.offsetWidth;
      H = c.height = c.offsetHeight;
    }
    function init() {
      resize();
      pts = Array.from({ length: 60 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.4,
        a: Math.random() * 0.4 + 0.1,
        col:
          Math.random() > 0.6
            ? "#39ff14"
            : Math.random() > 0.5
              ? "#00ffee"
              : "#fff",
      }));
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      // hex grid
      ctx.strokeStyle = "#39ff1406";
      ctx.lineWidth = 0.8;
      for (let r = 0; r < H; r += 44)
        for (let cc = 0; cc < W; cc += 50) {
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i - Math.PI / 6;
            ctx.lineTo(cc + 18 * Math.cos(a), r + 18 * Math.sin(a));
          }
          ctx.closePath();
          ctx.stroke();
        }
      // connections
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x,
            dy = pts[i].y - pts[j].y,
            d = Math.hypot(dx, dy);
          if (d < 110) {
            ctx.strokeStyle = `rgba(57,255,20,${(1 - d / 110) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      pts.forEach((p) => {
        ctx.fillStyle = p.col;
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    init();
    frame();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

// ── Main Onboarding Component ─────────────────────────────────
export default function Onboarding({ onStart }) {
  const [step, setStep] = useState(1);
  const [selectedChar, setSelectedChar] = useState(null);
  const [company, setCompany] = useState("");
  const [launching, setLaunching] = useState(false);

  const PRESETS = [
    "NexaCloud",
    "DataForge",
    "ByteVault",
    "CoreNest",
    "QuantumBase",
    "ZeroLatency",
    "SkyCore",
    "NetBunker",
  ];

  const charInfo = CHARACTERS.find((c) => c.id === selectedChar);

  function launch() {
    setLaunching(true);
    setTimeout(() => onStart({ ...charInfo, company }), 900);
  }

  const stepDone = [false, !!selectedChar, company.length >= 2];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "radial-gradient(ellipse at 50% 40%, #0d200f 0%, #050805 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Press Start 2P', monospace",
        overflow: "hidden",
      }}
    >
      <ParticleBG />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "min(700px,96vw)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          padding: "0 12px",
          maxHeight: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "clamp(16px,4vw,32px)",
              color: "#39ff14",
              textShadow: "0 0 20px #39ff14, 0 0 40px #39ff1466",
              letterSpacing: 3,
              lineHeight: 1.5,
              animation: "pulse 2.5s infinite",
            }}
          >
            DATA CENTER
            <br />
            TYCOON
          </div>
          <div
            style={{
              fontSize: "clamp(6px,1.2vw,9px)",
              color: "#00ffee",
              letterSpacing: 6,
              marginTop: 6,
              opacity: 0.8,
            }}
          >
            BUILD · COOL · PROFIT
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {[1, 2, 3].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  border: `2px solid ${step === s ? "#39ff14" : stepDone[s] ? "#39ff14" : "#1e301e"}`,
                  background:
                    stepDone[s] && step !== s
                      ? "#39ff14"
                      : step === s
                        ? "#0a1a0a"
                        : "#0a0e0a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 8,
                  color:
                    stepDone[s] && step !== s
                      ? "#000"
                      : step === s
                        ? "#39ff14"
                        : "#2a4a2a",
                  boxShadow: step === s ? "0 0 10px #39ff1444" : "none",
                  transition: ".3s",
                }}
              >
                {stepDone[s] && step !== s ? "✓" : s}
              </div>
              {i < 2 && (
                <div style={{ width: 50, height: 2, background: "#1a2a1a" }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div
          style={{
            background: "#0f1a0f",
            border: "3px solid #1e301e",
            width: "100%",
            padding: "clamp(16px,3vw,28px)",
            position: "relative",
            boxShadow: "0 8px 40px #00000088",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background:
                "linear-gradient(90deg,transparent,#39ff14,transparent)",
            }}
          />

          {/* STEP 1 — Character */}
          {step === 1 && (
            <div>
              <div
                style={{
                  fontSize: "clamp(8px,1.5vw,11px)",
                  color: "#00ffee",
                  letterSpacing: 2,
                  textAlign: "center",
                  marginBottom: 4,
                }}
              >
                CHOOSE YOUR CEO
              </div>
              <div
                style={{
                  fontSize: 6,
                  color: "#3a5a3a",
                  textAlign: "center",
                  marginBottom: 20,
                  letterSpacing: 1,
                }}
              >
                WHO RUNS YOUR DATA EMPIRE?
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginBottom: 24,
                }}
              >
                {CHARACTERS.map((ch) => (
                  <div
                    key={ch.id}
                    onClick={() => setSelectedChar(ch.id)}
                    style={{
                      width: "clamp(130px,20vw,155px)",
                      background: "#0a120a",
                      border: `2px solid ${selectedChar === ch.id ? "#39ff14" : "#1a2a1a"}`,
                      padding: "14px 10px 12px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      transition: ".2s",
                      position: "relative",
                      boxShadow:
                        selectedChar === ch.id
                          ? "0 0 20px #39ff1433, 0 0 0 1px #39ff14"
                          : "none",
                      transform:
                        selectedChar === ch.id ? "translateY(-3px)" : "none",
                    }}
                  >
                    {/* Gender tag */}
                    <div
                      style={{
                        position: "absolute",
                        top: 6,
                        left: 6,
                        fontSize: 5,
                        padding: "2px 4px",
                        color: ch.gender === "male" ? "#44aaff" : "#ff66aa",
                        border: `1px solid ${ch.gender === "male" ? "#44aaff33" : "#ff66aa33"}`,
                      }}
                    >
                      {ch.gender === "male" ? "♂" : "♀"}
                    </div>
                    {selectedChar === ch.id && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: "#39ff14",
                          color: "#000",
                          fontSize: 5,
                          textAlign: "center",
                          padding: "2px 0",
                          letterSpacing: 1,
                        }}
                      >
                        ✓ SELECTED
                      </div>
                    )}
                    <CharSprite charId={ch.id} size={90} />
                    <div
                      style={{
                        fontSize: 8,
                        color: "#c0d0c0",
                        letterSpacing: 1,
                      }}
                    >
                      {ch.name}
                    </div>
                    <div style={{ fontSize: 6, color: "#3a5a3a" }}>
                      {ch.role}
                    </div>
                    <div
                      style={{
                        fontSize: 5,
                        color: "#39ff1488",
                        textAlign: "center",
                        lineHeight: 1.6,
                        marginTop: 2,
                      }}
                    >
                      {ch.bonusDesc}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!selectedChar}
                style={{
                  width: "100%",
                  padding: 12,
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 9,
                  background: selectedChar ? "#39ff14" : "transparent",
                  border: "2px solid #39ff14",
                  color: selectedChar ? "#000" : "#39ff14",
                  cursor: selectedChar ? "pointer" : "not-allowed",
                  opacity: selectedChar ? 1 : 0.35,
                  letterSpacing: 1,
                  transition: ".2s",
                }}
              >
                NEXT ▶
              </button>
            </div>
          )}

          {/* STEP 2 — Company */}
          {step === 2 && (
            <div>
              <div
                style={{
                  fontSize: "clamp(8px,1.5vw,11px)",
                  color: "#00ffee",
                  letterSpacing: 2,
                  textAlign: "center",
                  marginBottom: 4,
                }}
              >
                NAME YOUR COMPANY
              </div>
              <div
                style={{
                  fontSize: 6,
                  color: "#3a5a3a",
                  textAlign: "center",
                  marginBottom: 18,
                  letterSpacing: 1,
                }}
              >
                YOUR BRAND ON EVERY SERVER RACK
              </div>

              {/* Preview */}
              <div
                style={{
                  background: "#0d180d",
                  border: "2px solid #1a2a1a",
                  padding: 18,
                  marginBottom: 16,
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(ellipse at 50% 0%, #39ff1408 0%, transparent 70%)",
                  }}
                />
                <div style={{ fontSize: 22, marginBottom: 8 }}>🏢</div>
                <div
                  style={{
                    fontSize: "clamp(14px,3vw,22px)",
                    color: "#39ff14",
                    letterSpacing: 3,
                    minHeight: 28,
                    textShadow: "0 0 10px #39ff1466",
                    wordBreak: "break-all",
                  }}
                >
                  {company.toUpperCase() || "_"}
                </div>
                <div
                  style={{
                    fontSize: 5,
                    color: "#2a4a2a",
                    marginTop: 4,
                    letterSpacing: 2,
                  }}
                >
                  DATA CENTERS & CLOUD INFRASTRUCTURE
                </div>
              </div>

              <label
                style={{
                  display: "block",
                  fontSize: 6,
                  color: "#3a5a3a",
                  letterSpacing: 2,
                  marginBottom: 7,
                }}
              >
                COMPANY NAME
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                maxLength={20}
                placeholder="e.g. NEXACLOUD"
                style={{
                  width: "100%",
                  background: "#080c08",
                  border: "2px solid #1e2e1e",
                  padding: "10px 12px",
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 11,
                  color: "#39ff14",
                  outline: "none",
                  letterSpacing: 2,
                  marginBottom: 12,
                }}
                onFocus={(e) => (e.target.style.borderColor = "#39ff14")}
                onBlur={(e) => (e.target.style.borderColor = "#1e2e1e")}
              />

              <div
                style={{
                  fontSize: 6,
                  color: "#2a4a2a",
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                QUICK PICK:
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 18,
                }}
              >
                {PRESETS.map((p) => (
                  <div
                    key={p}
                    onClick={() => setCompany(p)}
                    style={{
                      fontSize: 6,
                      padding: "4px 8px",
                      background: "#0a120a",
                      border: "1px solid #1a2a1a",
                      color: "#3a5a3a",
                      cursor: "pointer",
                      letterSpacing: 1,
                      transition: ".15s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = "#39ff14";
                      e.target.style.color = "#39ff14";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = "#1a2a1a";
                      e.target.style.color = "#3a5a3a";
                    }}
                  >
                    {p}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    padding: "11px 16px",
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 8,
                    background: "transparent",
                    border: "2px solid #1e301e",
                    color: "#3a5a3a",
                    cursor: "pointer",
                  }}
                >
                  ◀ BACK
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={company.length < 2}
                  style={{
                    flex: 1,
                    padding: 11,
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 8,
                    background: company.length >= 2 ? "#39ff14" : "transparent",
                    border: "2px solid #39ff14",
                    color: company.length >= 2 ? "#000" : "#39ff14",
                    cursor: company.length >= 2 ? "pointer" : "not-allowed",
                    opacity: company.length >= 2 ? 1 : 0.35,
                    letterSpacing: 1,
                  }}
                >
                  NEXT ▶
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Launch */}
          {step === 3 && (
            <div>
              <div
                style={{
                  fontSize: "clamp(8px,1.5vw,11px)",
                  color: "#00ffee",
                  letterSpacing: 2,
                  textAlign: "center",
                  marginBottom: 4,
                }}
              >
                READY TO BUILD
              </div>
              <div
                style={{
                  fontSize: 6,
                  color: "#3a5a3a",
                  textAlign: "center",
                  marginBottom: 18,
                  letterSpacing: 1,
                }}
              >
                YOUR DATA EMPIRE AWAITS
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 16,
                  background: "#0d180d",
                  border: "2px solid #1e301e",
                  padding: 18,
                  marginBottom: 18,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 100,
                    border: "2px solid #39ff14",
                    background: "#0a120a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 20px #39ff1433",
                    flexShrink: 0,
                  }}
                >
                  <CharSprite charId={selectedChar} size={90} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "clamp(10px,2vw,14px)",
                      color: "#39ff14",
                      letterSpacing: 2,
                      marginBottom: 5,
                      wordBreak: "break-all",
                    }}
                  >
                    {company.toUpperCase()}
                  </div>
                  <div
                    style={{ fontSize: 7, color: "#3a5a3a", marginBottom: 12 }}
                  >
                    CEO: {charInfo?.name} ({charInfo?.role})
                  </div>
                  {[
                    [
                      "💰",
                      "Starting Funds:",
                      `$${charInfo?.startBonus?.type === "startMoney" ? 5000 + charInfo.startBonus.val : 5000}`,
                    ],
                    ["🎯", "CEO Bonus:", charInfo?.bonusDesc],
                    ["🖥", "Starter Pack:", "2 Servers + CRAC + Switch"],
                    ["⭐", "Goal:", "Reach S+ Rating"],
                  ].map(([icon, label, val]) => (
                    <div
                      key={label}
                      style={{
                        fontSize: 6,
                        color: "#6a8a6a",
                        marginBottom: 5,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span>{icon}</span>
                      <span style={{ color: "#4a6a4a" }}>{label}</span>
                      <span style={{ color: "#8aaa8a" }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    padding: "12px 16px",
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 8,
                    background: "transparent",
                    border: "2px solid #1e301e",
                    color: "#3a5a3a",
                    cursor: "pointer",
                  }}
                >
                  ◀ BACK
                </button>
                <button
                  onClick={launch}
                  disabled={launching}
                  style={{
                    flex: 1,
                    padding: 12,
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 9,
                    background: launching
                      ? "#1a3a1a"
                      : "linear-gradient(135deg, #39ff14, #00ffee)",
                    border: "2px solid #39ff14",
                    color: "#000",
                    cursor: launching ? "default" : "pointer",
                    letterSpacing: 1,
                    transition: ".2s",
                  }}
                >
                  {launching ? "⏳ BOOTING..." : "🚀 LAUNCH COMPANY"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { text-shadow: 0 0 10px #39ff14, 0 0 30px #39ff1466; } 50% { text-shadow: 0 0 20px #39ff14, 0 0 50px #39ff1488, 0 0 80px #39ff1444; } }
      `}</style>
    </div>
  );
}
