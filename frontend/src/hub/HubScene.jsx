import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ── Constants ──────────────────────────────────────────────────────────────────
const W       = 900;
const H       = 480;
const FLOOR   = 352;
const CHAR_X  = Math.round(W * 0.42);
const LERP    = 0.10;
const CAM_MIN = -600;
const CAM_MAX =  640;
const SCR_SPD = 0.50;
const PROX    = 82;

const STATIONS = [
  { id: "community", worldX: -480, label: "Community", color: "#f59e0b", to: "/community/communityspace", isRoom: false },
  { id: "learning",  worldX:  100, label: "Library",   color: "#3b82f6", to: "/learning",  isRoom: true, sign: "Library",  interior: "#deeeff" },
  { id: "inventory", worldX:  560, label: "Storage",   color: "#10b981", to: "/inventory", isRoom: true, sign: "Storage",  interior: "#d8f5ec" },
];

const ws = (worldX, camX, f = 1) => CHAR_X + worldX - camX * f;

function tilePositions(tileW, camX, factor) {
  const nMin = Math.floor((-300 - CHAR_X + camX * factor) / tileW) - 1;
  const nMax = Math.ceil ((  W + 300 - CHAR_X + camX * factor) / tileW) + 1;
  return Array.from({ length: nMax - nMin + 1 }, (_, i) =>
    CHAR_X + (nMin + i) * tileW - camX * factor
  );
}

// ── Makerspace palette ────────────────────────────────────────────────────────
const P = {
  skyTop:   "#5baad8",
  skyBot:   "#b8daf2",
  glass:    "#b0cce8",
  mullion:  "#4a5870",
  mullionDk:"#323e50",
  ceiling:  "#1a2433",
  ductPipe: "#28384a",
  led:      "#f0e830",
  ledGlow:  "#fffde0",
  floor:    "#b4bac0",
  floorH:   "#d0d4d8",
  floorD:   "#909498",
  metal:    "#56687a",
  metalDk:  "#38485a",
  concrWall:"#d0d5da",
  amber:    "#f59e0b",
};

// ── LAYER 1 — Glass curtain wall (factor 0.12) ────────────────────────────────
function GlassCurtainWall({ camX }) {
  const panH = FLOOR - 30;
  return (
    <>
      {tilePositions(68, camX, 0.12).map((sx, i) => (
        <g key={i} transform={`translate(${sx}, 0)`}>
          {/* Left glass pane */}
          <rect x={-33} y={28} width={31} height={panH - 28} fill={P.glass} opacity="0.55" />
          {/* Right glass pane */}
          <rect x={2}   y={28} width={31} height={panH - 28} fill={P.glass} opacity="0.55" />
          {/* Horizontal mid-rail */}
          <rect x={-33} y={28 + (panH - 28) * 0.48} width={66} height={3} fill={P.mullion} />
          {/* Vertical mullion */}
          <rect x={-2}  y={28} width={4}  height={panH} fill={P.mullion} />
        </g>
      ))}
      {/* Base rail */}
      <rect y={FLOOR - 14} width={W} height={14} fill={P.mullion} />
      <rect y={FLOOR - 16} width={W} height={2}  fill={P.mullionDk} />
    </>
  );
}

// ── LAYER 2 — Steel I-beam columns (factor 0.26) ─────────────────────────────
function SteelColumns({ camX }) {
  const colH = FLOOR - 30;
  return (
    <>
      {tilePositions(300, camX, 0.26).map((sx, i) => (
        <g key={i} transform={`translate(${sx}, 0)`}>
          {/* 3D top face of top flange */}
          <polygon points="-12,28 12,28 9,20 -9,20" fill={P.metal} opacity="0.55" />
          {/* 3D left side of web */}
          <rect x={-6} y={34} width={3} height={colH - 10} fill={P.metalDk} opacity="0.35" />
          {/* Web */}
          <rect x={-3} y={30} width={6} height={colH} fill={P.metal} />
          {/* Flanges */}
          <rect x={-12} y={28} width={24} height={7} rx="1" fill={P.metalDk} />
          <rect x={-12} y={30 + colH} width={24} height={7} rx="1" fill={P.metalDk} />
          {/* Mid gusset */}
          <rect x={-12} y={30 + colH * 0.5 - 4} width={24} height={8} rx="1" fill={P.metalDk} />
        </g>
      ))}
    </>
  );
}

// ── LAYER 3 — Exposed ceiling with LED strips (factor 0.36) ──────────────────
function IndustrialCeiling({ camX }) {
  return (
    <>
      {/* Dark ceiling slab */}
      <rect width={W} height={32} fill={P.ceiling} />

      {/* Ductwork runs (factor 0.2) */}
      {tilePositions(220, camX, 0.20).map((sx, i) => (
        <g key={i} transform={`translate(${sx}, 0)`}>
          <rect x={-80} y={8} width={160} height={14} rx="7" fill={P.ductPipe}
            stroke={P.metalDk} strokeWidth="1" />
          <rect x={-2}  y={6} width={4}   height={18} rx="2" fill={P.metalDk} />
        </g>
      ))}

      {/* LED strip lights (factor 0.36) */}
      {tilePositions(310, camX, 0.36).map((sx, i) => (
        <g key={i} transform={`translate(${sx}, 0)`}>
          {/* Rail housing */}
          <rect x={-55} y={26} width={110} height={5} rx="1" fill={P.metalDk} />
          {/* LED strip */}
          <rect x={-52} y={27} width={104} height={3} rx="1" fill={P.led} opacity="0.95" />
          {/* Glow cone */}
          <polygon
            points={`-52,31 52,31 90,${FLOOR - 30} -90,${FLOOR - 30}`}
            fill={P.ledGlow} opacity="0.07"
          />
        </g>
      ))}
    </>
  );
}

// ── Bulletin Board — Community (makerspace: magnetic steel board) ─────────────
function BulletinBoard({ screenX, near, color }) {
  const cx = screenX;
  const fw = 162, fh = 228;
  const L  = cx - fw / 2, top = FLOOR - fh - 14;

  // Card helper: rect + coloured header bar + rule lines + magnet
  function Card({ x, y, w, h, accent, lines = [], mx, my }) {
    return (
      <>
        <rect x={x} y={y} width={w} height={h} rx="2"
          fill="white" style={{ filter: "drop-shadow(0 2px 5px rgba(0,20,50,0.14))" }} />
        <rect x={x} y={y} width={w} height={7} rx="2" fill={accent} />
        {lines.map((ly, i) => (
          <line key={i} x1={x + 7} y1={y + ly} x2={x + w - 7} y2={y + ly}
            stroke="#dde2e8" strokeWidth="1.1" />
        ))}
        <circle cx={mx ?? x + w / 2} cy={my ?? y} r="5" fill={accent} />
        <circle cx={mx ?? x + w / 2} cy={my ?? y} r="2.8" fill="rgba(255,255,255,0.45)" />
      </>
    );
  }

  return (
    <g>
      {/* Wall mounting rails */}
      <rect x={L - 6} y={top - 16} width={fw + 12} height={10} rx="2" fill={P.metalDk} />
      <rect x={L - 6} y={top + fh + 6} width={fw + 12} height={10} rx="2" fill={P.metalDk} />
      {/* Rail bolts */}
      {[L + 10, L + fw - 10].map((bx, i) => (
        <circle key={i} cx={bx} cy={top - 11} r="3.5" fill={P.metal} />
      ))}

      {/* 3D top face of board (recedes into wall) */}
      <polygon
        points={`${L - 2},${top - 2} ${L + fw + 2},${top - 2} ${L + fw - 4},${top - 15} ${L + 4},${top - 15}`}
        fill="#2e3d4e" opacity="0.65"
      />
      {/* 3D left side face of board */}
      <polygon
        points={`${L - 2},${top - 2} ${L - 2},${top + fh + 2} ${L - 10},${top + fh - 4} ${L - 10},${top - 9}`}
        fill="#283444" opacity="0.40"
      />

      {/* Frame shadow */}
      <rect x={L - 3} y={top - 3} width={fw + 6} height={fh + 6} rx="3"
        fill="rgba(0,20,50,0.15)" />

      {/* Steel frame */}
      <rect x={L - 2} y={top - 2} width={fw + 4} height={fh + 4} rx="3" fill={P.metalDk} />

      {/* Magnetic board surface */}
      <rect x={L} y={top} width={fw} height={fh} rx="1" fill="#dce4ec" />

      {/* Subtle grid on surface */}
      {[0.2, 0.4, 0.6, 0.8].map((p, i) => (
        <line key={i} x1={L} y1={top + fh * p} x2={L + fw} y2={top + fh * p}
          stroke="rgba(74,100,130,0.07)" strokeWidth="0.8" />
      ))}
      {[0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} x1={L + fw * p} y1={top} x2={L + fw * p} y2={top + fh}
          stroke="rgba(74,100,130,0.07)" strokeWidth="0.8" />
      ))}

      {/* Card 1 — amber (announcements) top-left */}
      <Card x={L + 9} y={top + 12} w={68} h={56}
        accent={P.amber} lines={[22, 31, 40, 50]}
        mx={L + 43} my={top + 13} />

      {/* Card 2 — blue (events) top-right */}
      <Card x={L + 86} y={top + 16} w={66} h={50}
        accent="#3b82f6" lines={[27, 36, 46]}
        mx={L + 119} my={top + 17} />

      {/* Card 3 — indigo full-width banner */}
      <Card x={L + 9} y={top + 78} w={144} h={40}
        accent="#6366f1" lines={[91, 100, 109]}
        mx={cx} my={top + 79} />

      {/* Card 4 — green (projects) bottom-left */}
      <Card x={L + 9} y={top + 128} w={62} h={52}
        accent="#10b981" lines={[140, 150, 160, 170]}
        mx={L + 40} my={top + 129} />

      {/* Card 5 — red (urgent) bottom-right */}
      <Card x={L + 82} y={top + 132} w={70} h={48}
        accent="#ef4444" lines={[144, 154, 164]}
        mx={L + 117} my={top + 133} />

      {/* Card 6 — grey full-width footer */}
      <Card x={L + 9} y={top + 190} w={144} h={30}
        accent={P.metal} lines={[202, 211]}
        mx={cx} my={top + 191} />

      {/* LED indicator strip */}
      <rect x={L} y={top - 2} width={fw} height={3} rx="1.5"
        fill={near ? color : P.metal} opacity={near ? "0.95" : "0.45"} />

      {/* Near glow */}
      {near && (
        <rect x={L - 2} y={top - 2} width={fw + 4} height={fh + 4} rx="3"
          fill="none" stroke={color} strokeWidth="2.5" opacity="0.9" />
      )}

      {/* Floor shadow */}
      <ellipse cx={cx} cy={FLOOR} rx={72} ry={8} fill="rgba(0,20,50,0.08)" />

      {/* Label */}
      <text x={cx} y={FLOOR + 20} textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>
        Community
      </text>
      <text x={cx} y={FLOOR + 34} textAnchor="middle" fontSize="10" fill={P.metal}>
        Bulletin Board
      </text>

      {/* Visit badge */}
      {near && (
        <g>
          <rect x={cx - 56} y={FLOOR + 40} width={112} height={26} rx="13" fill={color} />
          <text x={cx} y={FLOOR + 57} textAnchor="middle" fontSize="12" fontWeight="700" fill="white">
            Visit →
          </text>
        </g>
      )}
    </g>
  );
}

// ── Room Door — glass/industrial (makerspace) ─────────────────────────────────
function RoomDoor({ screenX, color, interior, sign, near }) {
  const cx = screenX;
  const fw = 170, fh = 252;
  const L  = cx - fw / 2, top = FLOOR - fh;
  const dW = fw - 28, dH = fh - 10;
  const dL = L + 14;

  const isGlass = sign === "Library";   // glass door for library
  const isIndustrial = sign === "Storage"; // metal door for storage

  return (
    <g>
      {/* Light spill when near */}
      {near && (
        <polygon
          points={`${dL},${top} ${dL + dW},${top} ${dL + dW + 50},${FLOOR} ${dL - 50},${FLOOR}`}
          fill={interior} opacity="0.4"
        />
      )}

      {/* Room interior */}
      <rect x={dL} y={top} width={dW} height={dH}
        fill={near ? interior : P.concrWall} />

      {/* Interior detail when near */}
      {near && (
        <>
          <rect x={dL} y={top + dH - 44} width={dW} height={44} fill={P.floorH} opacity="0.35" />
          <rect x={dL + 12} y={top + 16} width={dW - 24} height={dH - 60} rx="2"
            fill="rgba(255,255,255,0.06)" />
        </>
      )}

      {/* Door panel */}
      {near ? (
        /* Ajar */
        <>
          <rect x={dL} y={top} width={dW * 0.16} height={dH} rx="1"
            fill={isGlass ? P.metal : P.metalDk}
            style={{ filter: "drop-shadow(4px 0 10px rgba(0,0,0,0.3))" }} />
          <rect x={dL + dW * 0.16} y={top} width={2} height={dH}
            fill={P.metal} opacity="0.4" />
        </>
      ) : isGlass ? (
        /* Glass door */
        <g>
          {/* Outer metal frame of door */}
          <rect x={dL} y={top} width={dW} height={dH} rx="1" fill={P.metal} />
          {/* Glass clear panel top */}
          <rect x={dL + 6} y={top + 6} width={dW - 12} height={dH * 0.45 - 8} rx="1"
            fill={P.glass} opacity="0.75" />
          {/* Frosted middle panel */}
          <rect x={dL + 6} y={top + dH * 0.45} width={dW - 12} height={40} rx="1"
            fill="#ddeeff" opacity="0.9" />
          <text x={cx} y={top + dH * 0.45 + 26} textAnchor="middle"
            fontSize="10" fontWeight="700" letterSpacing="2" fill={P.mullion} opacity="0.8">
            {sign.toUpperCase()}
          </text>
          {/* Lower glass panel */}
          <rect x={dL + 6} y={top + dH * 0.45 + 48} width={dW - 12} height={dH * 0.55 - 62} rx="1"
            fill={P.glass} opacity="0.65" />
          {/* Pull bar handle */}
          <rect x={dL + dW - 14} y={top + dH / 2 - 20} width={5} height={40} rx="2.5" fill={P.metalDk} />
          <rect x={dL + dW - 18} y={top + dH / 2 - 20} width={13} height={5} rx="2" fill={P.metalDk} />
          <rect x={dL + dW - 18} y={top + dH / 2 + 15} width={13} height={5} rx="2" fill={P.metalDk} />
        </g>
      ) : (
        /* Industrial metal door (Storage) */
        <g>
          <rect x={dL} y={top} width={dW} height={dH} rx="1" fill={P.metal} />
          {/* Horizontal reinforcing ribs */}
          {[0.2, 0.4, 0.6, 0.8].map((p, i) => (
            <rect key={i} x={dL + 4} y={top + dH * p - 3} width={dW - 8} height={6} rx="1"
              fill={P.metalDk} opacity="0.6" />
          ))}
          {/* Stencil text */}
          <text x={cx} y={top + dH / 2 + 5} textAnchor="middle"
            fontSize="13" fontWeight="900" letterSpacing="3" fill={P.metalDk} opacity="0.55">
            {sign.toUpperCase()}
          </text>
          {/* Lever handle */}
          <rect x={dL + dW - 20} y={top + dH / 2 - 4} width={4} height={20} rx="2" fill={P.metalDk} />
          <rect x={dL + dW - 26} y={top + dH / 2 - 4} width={12} height={5} rx="2" fill={P.metalDk} />
          {/* Safety stripe at bottom */}
          {[0, 1, 2, 3].map(i => (
            <polygon key={i}
              points={`${dL + i * 36},${top + dH - 14} ${dL + i * 36 + 18},${top + dH - 14} ${dL + i * 36 + 12},${top + dH} ${dL + i * 36 - 6},${top + dH}`}
              fill={P.amber} opacity="0.45"
            />
          ))}
        </g>
      )}

      {/* 3D top face of frame (recedes into wall) */}
      <polygon
        points={`${L},${top - 16} ${L + fw},${top - 16} ${L + fw - 6},${top - 32} ${L + 6},${top - 32}`}
        fill="#2e3d4e" opacity="0.72"
      />
      {/* 3D left side face of frame */}
      <polygon
        points={`${L},${top - 16} ${L},${FLOOR - 6} ${L - 10},${FLOOR - 10} ${L - 10},${top - 24}`}
        fill="#283444" opacity="0.45"
      />

      {/* Frame — left post */}
      <rect x={L}        y={top - 12} width={15} height={fh + 12} rx="2" fill={P.metalDk} />
      {/* Frame — right post */}
      <rect x={L + fw - 15} y={top - 12} width={15} height={fh + 12} rx="2" fill={P.metalDk} />
      {/* Frame — top */}
      <rect x={L} y={top - 16} width={fw} height={18} rx="2" fill={P.metalDk} />
      {/* Doorstep */}
      <rect x={L} y={FLOOR - 6} width={fw} height={10} rx="1" fill={P.metalDk} />

      {/* Floor safety tape */}
      {near && (
        <>
          {[0, 1, 2].map(i => (
            <polygon key={i}
              points={`${cx - 54 + i * 36},${FLOOR - 6} ${cx - 54 + i * 36 + 20},${FLOOR - 6} ${cx - 54 + i * 36 + 14},${FLOOR + 4} ${cx - 54 + i * 36 - 6},${FLOOR + 4}`}
              fill={color} opacity="0.35"
            />
          ))}
        </>
      )}

      {/* Room ID plaque */}
      <rect x={cx - 34} y={top - 52} width={68} height={28} rx="3" fill={P.metalDk} />
      <rect x={cx - 30} y={top - 48} width={60} height={20} rx="2" fill={P.metal} />
      <text x={cx} y={top - 33} textAnchor="middle" fontSize="11" fontWeight="700"
        fill="#e0eaf5" letterSpacing="1">
        {sign}
      </text>

      {/* Near glow */}
      {near && (
        <rect x={L} y={top - 16} width={fw} height={fh + 16} rx="2"
          fill="none" stroke={color} strokeWidth="2.5" opacity="0.85" />
      )}

      {/* Floor shadow */}
      <ellipse cx={cx} cy={FLOOR} rx={80} ry={9} fill="rgba(0,0,0,0.07)" />

      {/* Label */}
      <text x={cx} y={FLOOR + 20} textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>
        {sign}
      </text>

      {/* Enter badge */}
      {near && (
        <g>
          <rect x={cx - 56} y={FLOOR + 26} width={112} height={26} rx="13" fill={color} />
          <text x={cx} y={FLOOR + 43} textAnchor="middle" fontSize="12" fontWeight="700" fill="white">
            Enter →
          </text>
        </g>
      )}
    </g>
  );
}

// ── Perspective concrete floor ─────────────────────────────────────────────────
function ConcreteFloor({ camX }) {
  const vpx   = CHAR_X;          // vanishing point x (character centre)
  const flH   = H - FLOOR;       // floor strip height in pixels

  // Depth lines: bottom positions tile at factor 1.0, all converge to VP
  const depthLines = tilePositions(80, camX, 1.0);

  // Width (cross) lines at 4 evenly-spaced y depths
  const widthTs = [0.26, 0.50, 0.72, 0.89];

  return (
    <g>
      {/* Base fill */}
      <rect y={FLOOR} width={W} height={flH} fill={P.floor} />

      {/* Depth shadow at wall/floor base */}
      <rect y={FLOOR} width={W} height={44} fill="rgba(0,20,50,0.22)" />

      {/* Perspective station shadows cast on floor */}
      {STATIONS.map(s => {
        const sx = ws(s.worldX, camX, 1.0);
        const hw = s.isRoom ? 62 : 44;
        return (
          <polygon key={s.id}
            points={`${sx - hw},${FLOOR + 2} ${sx + hw},${FLOOR + 2} ${sx + hw + 28},${FLOOR + flH * 0.6} ${sx - hw - 28},${FLOOR + flH * 0.6}`}
            fill="rgba(0,15,40,0.09)"
          />
        );
      })}

      {/* Convergence (depth) lines → vanishing point */}
      {depthLines.map((bx, i) => (
        <line key={i}
          x1={bx} y1={H}
          x2={vpx} y2={FLOOR}
          stroke={P.floorD} strokeWidth="1.1" opacity="0.5" />
      ))}

      {/* Width (cross) lines */}
      {widthTs.map((t, i) => (
        <line key={i}
          x1={0} y1={FLOOR + flH * t}
          x2={W} y2={FLOOR + flH * t}
          stroke={P.floorD} strokeWidth={0.8 + i * 0.1} opacity="0.45" />
      ))}

      {/* Highlight at wall/floor junction */}
      <rect y={FLOOR} width={W} height={3} fill={P.floorH} opacity="0.7" />
    </g>
  );
}

// ── Robot Character ────────────────────────────────────────────────────────────
function Character({ isWalking, walkFrame, facingRight, breathY }) {
  const plate  = "#c8d8e8";
  const joint  = "#6878a0";
  const accent = "#6366f1";
  const led    = "#22d3ee";
  const visor  = "#0c1624";
  const foot   = "#485090";

  const lLeg = isWalking ? (walkFrame ?  22 : -22) : 0;
  const rLeg = isWalking ? (walkFrame ? -22 :  22) : 0;
  const arm  = isWalking ? (walkFrame ?  18 : -18) : 0;
  const bob  = isWalking ? (walkFrame ?   2 :  0)  : breathY;

  return (
    <g transform={`translate(${CHAR_X}, ${FLOOR - 90 + bob})`}>
      <ellipse cx="0" cy="91" rx={isWalking ? 18 : 22} ry="5"
        fill="rgba(0,20,40,0.18)" />

      <g transform={`scale(${facingRight ? 1 : -1}, 1)`}>
        {/* Left leg */}
        <g transform={`rotate(${lLeg}, -7, 58)`}>
          <rect x="-13" y="56" width="11" height="16" rx="3" fill={plate} />
          <circle cx="-7.5" cy="72" r="4" fill={joint} />
          <rect x="-11" y="70" width="9"  height="14" rx="2" fill={plate} />
          <rect x="-14" y="82" width="16" height="7"  rx="3" fill={foot} />
        </g>
        {/* Right leg */}
        <g transform={`rotate(${rLeg}, 7, 58)`}>
          <rect x="2"  y="56" width="11" height="16" rx="3" fill={plate} />
          <circle cx="7.5" cy="72" r="4" fill={joint} />
          <rect x="2"  y="70" width="9"  height="14" rx="2" fill={plate} />
          <rect x="-2" y="82" width="16" height="7"  rx="3" fill={foot} />
        </g>
        {/* Body */}
        <rect x="-17" y="18" width="34" height="40" rx="6" fill={plate} />
        <rect x="-11" y="24" width="22" height="16" rx="3" fill={visor} />
        <circle cx="-4" cy="32" r="2.8" fill={accent} opacity="0.95" />
        <circle cx=" 4" cy="32" r="2.8" fill={led}    opacity="0.95" />
        <circle cx="-14" cy="52" r="2.2" fill={joint} />
        <circle cx=" 14" cy="52" r="2.2" fill={joint} />
        {/* Left arm */}
        <g transform={`rotate(${-arm}, -17, 26)`}>
          <rect x="-27" y="20" width="12" height="24" rx="5" fill={plate} />
          <circle cx="-21" cy="42" r="4" fill={joint} />
          <rect x="-24" y="40" width="9"  height="14" rx="4" fill={plate} />
          <rect x="-26" y="52" width="13" height="7"  rx="3" fill={joint} />
        </g>
        {/* Right arm */}
        <g transform={`rotate(${arm}, 17, 26)`}>
          <rect x="15" y="20" width="12" height="24" rx="5" fill={plate} />
          <circle cx="21" cy="42" r="4" fill={joint} />
          <rect x="15" y="40" width="9"  height="14" rx="4" fill={plate} />
          <rect x="13" y="52" width="13" height="7"  rx="3" fill={joint} />
        </g>
        {/* Neck */}
        <rect x="-5" y="12" width="10" height="8" rx="2" fill={joint} />
        {/* Head */}
        <rect x="-16" y="-10" width="32" height="24" rx="5" fill={plate} />
        <rect x="-21" y="-5"  width="6"  height="13" rx="2" fill={joint} />
        <rect x=" 15" y="-5"  width="6"  height="13" rx="2" fill={joint} />
        {[-2, 1, 4].map(dy => (
          <circle key={dy} cx="-18" cy={dy} r="0.9" fill={plate} opacity="0.6" />
        ))}
        <rect x="-13" y="-5" width="26" height="12" rx="3" fill={visor} />
        <circle cx="-5" cy="1.5" r="4"   fill={led} />
        <circle cx=" 5" cy="1.5" r="4"   fill={led} />
        <circle cx="-4" cy="0.5" r="1.5" fill="white" opacity="0.65" />
        <circle cx=" 6" cy="0.5" r="1.5" fill="white" opacity="0.65" />
        {[-4.5, -1.5, 1.5, 4.5].map(mx => (
          <rect key={mx} x={mx - 1.2} y="10" width="2.4" height="2.4" rx="0.6"
            fill={isWalking ? accent : led} opacity="0.85" />
        ))}
        {/* Antenna */}
        <rect x="-2" y="-22" width="4"   height="13" rx="2" fill={joint} />
        <circle cx="0" cy="-24" r="5.5" fill={accent} />
        <circle cx="0" cy="-24" r="3"   fill="#a5b4fc" />
        {isWalking && <circle cx="0" cy="-24" r="8" fill={accent} opacity="0.2" />}
      </g>
    </g>
  );
}

// ── Speech bubble ─────────────────────────────────────────────────────────────
function Bubble({ text, color }) {
  const bw = 150, bh = 38, bx = CHAR_X - bw / 2, by = FLOOR - 180;
  return (
    <g>
      <rect x={bx} y={by} width={bw} height={bh} rx="10"
        fill="white" style={{ filter: "drop-shadow(0 3px 10px rgba(0,20,60,0.18))" }} />
      <polygon
        points={`${CHAR_X - 7},${by + bh} ${CHAR_X + 7},${by + bh} ${CHAR_X},${by + bh + 12}`}
        fill="white"
      />
      <text x={CHAR_X} y={by + bh / 2 + 5} textAnchor="middle"
        fontSize="13" fontWeight="700" fill={color || "#333"}>
        {text}
      </text>
    </g>
  );
}

// ── Main Scene ────────────────────────────────────────────────────────────────
// scrollControlRef: when provided by a parent, the parent drives camX via scroll.
//                   The ref will be populated with a setter: (newCamX) => void.
// initialCamX:      starting camera position (default -180).
export function HubScene({ scrollControlRef, initialCamX = -180, onKeyMove }) {
  const navigate     = useNavigate();
  const containerRef = useRef(null);

  const [camX,        setCamX]       = useState(initialCamX);
  const [targetCamX,  setTargetCamX] = useState(initialCamX);
  const [facingRight, setFacingRight] = useState(true);
  const [isWalking,   setIsWalking]  = useState(false);
  const [walkFrame,   setWalkFrame]  = useState(0);
  const [bubble,      setBubble]     = useState(null);
  const [nearId,      setNearId]     = useState(null);
  const [breathY,     setBreathY]    = useState(0);

  const camXRef       = useRef(initialCamX);
  const targetRef     = useRef(initialCamX);
  const isWalkRef     = useRef(false);
  const rafRef        = useRef(null);
  const pendingNavRef = useRef(null);
  const navigateRef   = useRef(navigate);
  const heldKeysRef   = useRef(new Set());
  const clickStRef    = useRef(null);
  const onKeyMoveRef  = useRef(onKeyMove);
  navigateRef.current  = navigate;
  onKeyMoveRef.current = onKeyMove;

  camXRef.current   = camX;
  targetRef.current = targetCamX;

  // RAF
  useEffect(() => {
    const KEY_STEP = 6;
    function step() {
      // Keyboard movement — applied every frame while a key is held
      const keys = heldKeysRef.current;
      if (keys.size > 0) {
        let delta = 0;
        if (keys.has('ArrowLeft')  || keys.has('a') || keys.has('A')) delta -= KEY_STEP;
        if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) delta += KEY_STEP;
        if (delta !== 0) {
          const next = Math.min(CAM_MAX, Math.max(CAM_MIN, targetRef.current + delta));
          targetRef.current = next;
          setTargetCamX(next);
          onKeyMoveRef.current?.(delta); // sync page scroll so scroll handler stays aligned
        }
      }

      const curr   = camXRef.current;
      const tgt    = targetRef.current;
      const dist   = tgt - curr;
      const moving = Math.abs(dist) > 0.5;

      if (moving) {
        const next = curr + dist * LERP;
        setCamX(next);
        camXRef.current = next;
        setFacingRight(dist > 0);
        if (!isWalkRef.current) { isWalkRef.current = true; setIsWalking(true); }
      } else if (isWalkRef.current) {
        setCamX(tgt);
        camXRef.current = tgt;
        isWalkRef.current = false;
        setIsWalking(false);
        setWalkFrame(0);
        if (pendingNavRef.current) {
          const station = pendingNavRef.current;
          pendingNavRef.current = null;
          setTimeout(() => {
            if (station.to) navigateRef.current(station.to);
            else {
              setBubble({ text: "Coming soon 🚧", color: station.color });
              setTimeout(() => setBubble(null), 2800);
            }
          }, 200);
        }
      }
      const near = STATIONS.find(s => Math.abs(camXRef.current - s.worldX) < PROX);
      setNearId(near?.id ?? null);
      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (!isWalking) return;
    const id = setInterval(() => setWalkFrame(f => 1 - f), 155);
    return () => clearInterval(id);
  }, [isWalking]);

  useEffect(() => {
    if (isWalking) return;
    let ph = 0;
    const id = setInterval(() => {
      ph = (ph + 4) % 360;
      setBreathY(Math.sin((ph * Math.PI) / 180) * 1.3);
    }, 40);
    return () => clearInterval(id);
  }, [isWalking]);

  // Expose camera setter so a parent scroll handler can drive the camera.
  useEffect(() => {
    if (!scrollControlRef) return;
    scrollControlRef.current = (newCamX) => {
      const clamped = Math.min(CAM_MAX, Math.max(CAM_MIN, newCamX));
      targetRef.current = clamped;
      setTargetCamX(clamped);
    };
    return () => { scrollControlRef.current = null; };
  }, [scrollControlRef]);

  // Wheel listener — only active when not scroll-driven by a parent.
  useEffect(() => {
    if (scrollControlRef) return;
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const next = Math.min(CAM_MAX, Math.max(CAM_MIN, targetRef.current + e.deltaY * SCR_SPD));
      targetRef.current = next;
      setTargetCamX(next);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scrollControlRef]);

  // Keyboard controls — A/←  D/→ to move, W/↑ to enter nearest station
  useEffect(() => {
    const onKeyDown = (e) => {
      const k = e.key;
      if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'a' || k === 'A' || k === 'd' || k === 'D') {
        e.preventDefault();
        heldKeysRef.current.add(k);
      }
      if (k === 'ArrowUp' || k === 'w' || k === 'W') {
        const nearest = STATIONS.find(s => Math.abs(camXRef.current - s.worldX) < PROX);
        if (nearest) {
          e.preventDefault();
          clickStRef.current?.(nearest);
        }
      }
    };
    const onKeyUp = (e) => heldKeysRef.current.delete(e.key);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
    };
  }, []);

  const clickStation = useCallback((station) => {
    setBubble(null);
    if (Math.abs(camXRef.current - station.worldX) < PROX) {
      if (station.to) navigate(station.to);
      else {
        setBubble({ text: "Coming soon 🚧", color: station.color });
        setTimeout(() => setBubble(null), 2800);
      }
      return;
    }
    pendingNavRef.current = station;
    const next = Math.min(CAM_MAX, Math.max(CAM_MIN, station.worldX));
    targetRef.current = next;
    setTargetCamX(next);
  }, [navigate]);
  clickStRef.current = clickStation;

  return (
    <div
      ref={containerRef}
      className="w-full h-full select-none overflow-hidden"
      style={{ cursor: "default", touchAction: "none" }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={P.skyTop} />
            <stop offset="100%" stopColor={P.skyBot} />
          </linearGradient>
          <linearGradient id="sceneVigL" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor={P.skyBot} stopOpacity="1" />
            <stop offset="100%" stopColor={P.skyBot} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sceneVigR" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%"   stopColor={P.skyBot} stopOpacity="1" />
            <stop offset="100%" stopColor={P.skyBot} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sceneFloorFd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={P.floorD} stopOpacity="0"    />
            <stop offset="100%" stopColor={P.floorD} stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {/* ── Sky (outside glass) ── */}
        <rect width={W} height={FLOOR} fill="url(#skyGrad)" />

        {/* ── Glass curtain wall ── */}
        <GlassCurtainWall camX={camX} />

        {/* ── Steel columns ── */}
        <SteelColumns camX={camX} />

        {/* ── Industrial ceiling + LED strips ── */}
        <IndustrialCeiling camX={camX} />

        {/* ── Stations ── */}
        {STATIONS.map(s => {
          const sx     = ws(s.worldX, camX, 1.0);
          const isNear = nearId === s.id;
          return (
            <g key={s.id} onClick={() => clickStation(s)} style={{ cursor: "pointer" }}>
              {s.isRoom ? (
                <RoomDoor
                  screenX={sx} color={s.color} interior={s.interior}
                  sign={s.sign} near={isNear}
                />
              ) : (
                <BulletinBoard
                  screenX={sx} color={s.color} near={isNear}
                />
              )}
            </g>
          );
        })}

        {/* ── Polished concrete floor ── */}
        <ConcreteFloor camX={camX} />

        {/* ── Character floor shadow ── */}
        <ellipse cx={CHAR_X} cy={FLOOR + 1} rx={22} ry={4}
          fill="rgba(0,20,60,0.14)" />

        {/* ── Robot character ── */}
        <Character
          isWalking={isWalking}
          walkFrame={walkFrame}
          facingRight={facingRight}
          breathY={breathY}
        />

        {/* ── Speech bubble ── */}
        {bubble && <Bubble text={bubble.text} color={bubble.color} />}

        {/* ── Side vignettes ── */}
        <rect x={0}       y={0} width={110} height={H} fill="url(#sceneVigL)" />
        <rect x={W - 110} y={0} width={110} height={H} fill="url(#sceneVigR)" />

        {/* ── Near-camera floor darkening ── */}
        <rect y={H - 28} width={W} height={28} fill="rgba(0,15,40,0.13)" />

        {/* ── Hint ── */}
        {!isWalking && !bubble && (
          <text x={W / 2} y={H - 12} textAnchor="middle" fontSize="11.5"
            fill="rgba(60,80,110,0.5)">
            Scroll to explore — step near a door to enter
          </text>
        )}
      </svg>
    </div>
  );
}
