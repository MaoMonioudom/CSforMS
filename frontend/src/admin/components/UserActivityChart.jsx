import { useState } from "react";
import { ChartCard, LegendDot } from "./charts";

// Mock activity data (last 30 days, ending today 2026-06-24) — platform-wide
// visitor/new-user counts, not scoped to any one module, which is why this
// chart lives on the cross-module Users page rather than a space dashboard.
const ACTIVITY_DATA = Array.from({ length: 30 }, (_, i) => {
  const date = new Date("2026-05-26T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + i);
  const dow = date.getUTCDay();
  const isWeekend = dow === 0 || dow === 6;
  const base = isWeekend ? 38 : 92;
  const wave = Math.round(Math.sin(i * 0.72) * 17 + Math.cos(i * 1.3) * 11);
  const trend = Math.round(i * 0.9);
  const visitors = Math.max(18, base + wave + trend);
  const newUsers = Math.max(1, Math.round(visitors * 0.065 + Math.sin(i * 0.5) * 1.5));
  const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return { i, label, visitors, newUsers };
});

const PERIODS = [
  { label: "Last 7 days",  days: 7 },
  { label: "Last 30 days", days: 30 },
];

// SVG layout constants
const SVG_W = 700;
const SVG_H = 180;
const PAD = { l: 36, r: 12, t: 12, b: 28 };
const PLOT_W = SVG_W - PAD.l - PAD.r;
const PLOT_H = SVG_H - PAD.t - PAD.b;

export function UserActivityChart() {
  const [period, setPeriod] = useState(30);

  const data = ACTIVITY_DATA.slice(-period).map((d, idx) => ({ ...d, idx }));
  const n = data.length;

  const totalVisitors = data.reduce((s, d) => s + d.visitors, 0);
  const avgVisitors   = Math.round(totalVisitors / n);
  const peakVisitors  = Math.max(...data.map(d => d.visitors));
  const totalNewUsers = data.reduce((s, d) => s + d.newUsers, 0);

  const maxV = peakVisitors * 1.15;

  const px = i => PAD.l + (n > 1 ? (i / (n - 1)) : 0.5) * PLOT_W;
  const py = v => PAD.t + (1 - v / maxV) * PLOT_H;

  const linePoints = data.map(d => `${px(d.idx)},${py(d.visitors)}`).join(" ");
  const areaPoints = [
    ...data.map(d => `${px(d.idx)},${py(d.visitors)}`),
    `${px(n - 1)},${PAD.t + PLOT_H}`,
    `${px(0)},${PAD.t + PLOT_H}`,
  ].join(" ");

  const maxNU   = Math.max(...data.map(d => d.newUsers));
  const barMaxH = 28;
  const barW    = Math.max(2, PLOT_W / n - 1.5);
  const barBaseY = PAD.t + PLOT_H;

  const yTickValues = [0, Math.round(maxV * 0.33), Math.round(maxV * 0.66), Math.round(maxV)];

  // X-axis label positions: always show first, last, and evenly spaced middle points
  const xLabelCount = period === 7 ? 7 : 5;
  const xLabelIndices = Array.from({ length: xLabelCount }, (_, k) =>
    Math.round((k / (xLabelCount - 1)) * (n - 1))
  );

  return (
    <ChartCard title="Platform Activity" subtitle="Daily visitors & new users">
      {/* Header row: stats + period selector */}
      <div className="flex items-stretch border-b border-gray-100">
        <div className="grid grid-cols-4 divide-x divide-gray-100 flex-1">
          {[
            { label: "Total visits", value: totalVisitors.toLocaleString() },
            { label: "Avg / day",    value: avgVisitors },
            { label: "Peak day",     value: peakVisitors },
            { label: "New users",    value: totalNewUsers },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-3 text-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
              <p className="text-xl font-bold text-gray-900 tabular-nums mt-0.5">{value}</p>
            </div>
          ))}
        </div>
        {/* Period toggle */}
        <div className="flex items-center gap-1 px-5 py-3 border-l border-gray-100 shrink-0">
          {PERIODS.map(p => (
            <button
              key={p.days}
              onClick={() => setPeriod(p.days)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                period === p.days
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Area chart */}
      <div className="px-2 pt-3 pb-2">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ height: SVG_H }}>
          <defs>
            <linearGradient id="activity-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Y grid + labels */}
          {yTickValues.map(v => {
            const y = py(v);
            return (
              <g key={v}>
                <line x1={PAD.l} y1={y} x2={SVG_W - PAD.r} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                <text x={PAD.l - 5} y={y + 3.5} textAnchor="end" fontSize="8.5" fill="#d1d5db">{v}</text>
              </g>
            );
          })}

          {/* New-users bars (teal, bottom strip) */}
          {data.map(d => {
            const bh = (d.newUsers / maxNU) * barMaxH;
            const bx = px(d.idx) - barW / 2;
            return (
              <rect
                key={d.idx}
                x={bx} y={barBaseY - bh}
                width={barW} height={bh}
                fill="#2dd4bf" opacity="0.55" rx="1"
              />
            );
          })}

          {/* Area fill */}
          <polygon points={areaPoints} fill="url(#activity-fill)" />

          {/* Visitor line */}
          <polyline
            points={linePoints}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots on label positions */}
          {xLabelIndices.map(i => (
            <circle
              key={i}
              cx={px(i)} cy={py(data[i].visitors)}
              r="3" fill="white" stroke="#6366f1" strokeWidth="2"
            />
          ))}

          {/* X-axis baseline */}
          <line x1={PAD.l} y1={PAD.t + PLOT_H} x2={SVG_W - PAD.r} y2={PAD.t + PLOT_H} stroke="#e5e7eb" strokeWidth="1" />

          {/* X labels */}
          {xLabelIndices.map(i => (
            <text key={i} x={px(i)} y={SVG_H - 5} textAnchor="middle" fontSize="8.5" fill="#9ca3af">
              {data[i].label}
            </text>
          ))}
        </svg>

        {/* Legend */}
        <div className="flex gap-4 px-3 mt-1">
          <LegendDot color="#6366f1" label="Daily visitors" />
          <LegendDot color="#2dd4bf" label="New users" />
        </div>
      </div>
    </ChartCard>
  );
}
