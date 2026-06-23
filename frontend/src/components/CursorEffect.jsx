import { useEffect, useRef } from "react";

const COLORS = [
  "oklch(0.72 0.22 50)",
  "oklch(0.68 0.2 160)",
  "oklch(0.55 0.22 300)",
  "oklch(0.74 0.2 340)",
  "oklch(0.6 0.24 265)",
];

const MAX_TRAIL = 55;
const TRAIL_LIFETIME = 500; // ms before a point fades out

export function CursorEffect() {
  const planeRef  = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const plane  = planeRef.current;
    const canvas = canvasRef.current;
    if (!plane || !canvas) return;

    // Match canvas pixels to window size
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");

    const trail = []; // { x, y }

    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let prevX = tx, prevY = ty;
    let angle = 0, targetAngle = 0;
    let rafId;
    let lastSpawn = 0;

    // Hide native cursor
    const styleTag = document.createElement("style");
    styleTag.textContent = "html, html * { cursor: none !important; }";
    document.head.appendChild(styleTag);

    const lerp = (a, b, t) => a + (b - a) * t;
    const lerpAngle = (a, b, t) => {
      const diff = ((b - a + 540) % 360) - 180;
      return a + diff * t;
    };

    const tick = () => {
      // Plane snaps to cursor, angle smooths
      angle = lerpAngle(angle, targetAngle, 0.12);
      plane.style.transform = `translate(${tx - 16}px, ${ty - 16}px) rotate(${angle}deg)`;

      // ── Draw flight-path trail ──────────────────────────────
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = Date.now();
      // Drop points that have aged out
      while (trail.length > 0 && now - trail[0].t > TRAIL_LIFETIME) {
        trail.shift();
      }

      if (trail.length > 1) {
        for (let i = 1; i < trail.length; i++) {
          // Freshness: 1 = just drawn, 0 = about to expire
          const freshness = 1 - (now - trail[i].t) / TRAIL_LIFETIME;

          // Soft glow layer
          ctx.beginPath();
          ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
          ctx.lineTo(trail[i].x, trail[i].y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${freshness * 0.18})`;
          ctx.lineWidth = freshness * 9;
          ctx.lineCap = "round";
          ctx.stroke();

          // Bright core
          ctx.beginPath();
          ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
          ctx.lineTo(trail[i].x, trail[i].y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${freshness * 0.7})`;
          ctx.lineWidth = freshness * 2;
          ctx.lineCap = "round";
          ctx.stroke();
        }
      }

      rafId = requestAnimationFrame(tick);
    };
    tick();

    const spawnParticle = (x, y) => {
      const now = Date.now();
      if (now - lastSpawn < 55) return;
      lastSpawn = now;

      const el = document.createElement("div");
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size = 5 + Math.random() * 9;
      const dx = (Math.random() - 0.5) * 50;
      const dy = -30 - Math.random() * 40;
      const rot = (Math.random() - 0.5) * 120;

      Object.assign(el.style, {
        position: "fixed",
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: Math.random() > 0.4 ? "50%" : "3px",
        background: color,
        pointerEvents: "none",
        zIndex: "9996",
        opacity: "0.9",
        willChange: "transform, opacity",
      });

      document.body.appendChild(el);

      requestAnimationFrame(() => {
        el.style.transition =
          "transform 1.2s cubic-bezier(0.22,1,0.36,1), opacity 1.2s ease-out";
        el.style.transform = `translate(calc(${dx}px - 50%), calc(${dy}px - 50%)) rotate(${rot}deg) scale(0.1)`;
        el.style.opacity = "0";
      });

      setTimeout(() => el.remove(), 1300);
    };

    const onMove = (e) => {
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;

      if (Math.hypot(dx, dy) > 3) {
        targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        prevX = e.clientX;
        prevY = e.clientY;
      }

      tx = e.clientX;
      ty = e.clientY;

      trail.push({ x: e.clientX, y: e.clientY, t: Date.now() });
      if (trail.length > MAX_TRAIL) trail.shift();

      spawnParticle(e.clientX, e.clientY);
    };

    const onResize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    document.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      styleTag.remove();
    };
  }, []);

  return (
    <>
      {/* Flight-path trail canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 9997,
        }}
      />

      {/* Paper plane — nose points RIGHT at 0° */}
      <div
        ref={planeRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "32px",
          height: "32px",
          pointerEvents: "none",
          zIndex: 9999,
          willChange: "transform",
        }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.28))" }}
        >
          <path d="M30 16 L2 3 L10 16 L2 29 Z" fill="white" />
          <path d="M2 29 L10 16 L30 16 Z" fill="rgba(0,0,0,0.13)" />
          <path
            d="M2 3 L10 16"
            stroke="rgba(0,0,0,0.18)"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </>
  );
}
