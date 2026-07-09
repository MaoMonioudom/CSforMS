import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, MessageSquare, UserCog, ArrowUpRight } from "lucide-react";
import { events } from "@/lib/events-data";
import { collabPosts } from "@/lib/collaboration-data";
import { communityPosts } from "@/lib/community-data";

const MOCK_USERS = 48;

// --- Mock activity data (last 30 days, ending today 2026-06-24) ---
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

// --- Derived chart data ---
const communityCategories = communityPosts.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] || 0) + 1;
  return acc;
}, {});
const communityDonutData = [
  { label: "Technical",    value: communityCategories.Technical    || 0, color: "#f97316" },
  { label: "Showcase",     value: communityCategories.Showcase     || 0, color: "#8b5cf6" },
  { label: "Social",       value: communityCategories.Social       || 0, color: "#06b6d4" },
  { label: "Question",     value: communityCategories.Question     || 0, color: "#3b82f6" },
  { label: "Announcement", value: communityCategories.Announcement || 0, color: "#10b981" },
].filter(d => d.value > 0);

const topCommunityPosts = [...communityPosts]
  .sort((a, b) => b.likes - a.likes)
  .slice(0, 5);

const skillCounts = {};
collabPosts.forEach(post => post.skills.forEach(s => { skillCounts[s] = (skillCounts[s] || 0) + 1; }));
const topSkills = Object.entries(skillCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8)
  .map(([name, count]) => ({ name, count }));

// --- Base components ---

function StatCard({ label, value, icon: Icon, bg, iconColor, to }) {
  return (
    <Link
      to={to}
      className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${bg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      <p className="mt-4 text-xs text-gray-400 flex items-center gap-1 group-hover:text-gray-600 transition-colors">
        Manage <ArrowUpRight className="h-3 w-3" />
      </p>
    </Link>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function HBar({ label, value, maxValue, color, suffix = "" }) {
  const pct = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-700 truncate flex-1 min-w-0 pr-2">{label}</span>
        <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color }}>
          {value}{suffix}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1 text-[10px] text-gray-400">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

// --- Chart components ---

// SVG layout constants
const SVG_W = 700;
const SVG_H = 180;
const PAD = { l: 36, r: 12, t: 12, b: 28 };
const PLOT_W = SVG_W - PAD.l - PAD.r;
const PLOT_H = SVG_H - PAD.t - PAD.b;
function UserActivityChart() {
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

function EventFillChart() {
  const sorted = [...events].sort(
    (a, b) => b.participants / b.capacity - a.participants / a.capacity
  );
  return (
    <ChartCard title="Event Capacity" subtitle="Fill rate — sorted highest first">
      <div className="px-5 py-4 space-y-3 max-h-72 overflow-y-auto">
        {sorted.map(ev => {
          const pct = Math.round((ev.participants / ev.capacity) * 100);
          const color = pct >= 90 ? "#f87171" : pct >= 70 ? "#fb923c" : "#34d399";
          return (
            <div key={ev.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-700 truncate flex-1 min-w-0 pr-2">{ev.title}</span>
                <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color }}>
                  {ev.participants}/{ev.capacity}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-5 py-3 flex gap-4 border-t border-gray-50">
        <LegendDot color="#f87171" label="≥ 90% full" />
        <LegendDot color="#fb923c" label="70–89%" />
        <LegendDot color="#34d399" label="< 70%" />
      </div>
    </ChartCard>
  );
}

function CommunityDonutChart() {
  const radius = 38;
  const strokeWidth = 13;
  const circumference = 2 * Math.PI * radius;
  const total = communityDonutData.reduce((s, d) => s + d.value, 0);

  let cumulative = 0;
  const segments = communityDonutData.map(d => {
    const segLength = total > 0 ? (d.value / total) * circumference : 0;
    const offset = -cumulative;
    cumulative += segLength;
    return { ...d, segLength, offset };
  });

  return (
    <ChartCard title="Community Posts" subtitle="Breakdown by category">
      <div className="px-5 py-5 flex items-center gap-6">
        <div className="relative shrink-0" style={{ width: 88, height: 88 }}>
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
            {segments.map(seg => (
              <circle
                key={seg.label}
                cx="50" cy="50" r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${seg.segLength} ${circumference - seg.segLength}`}
                strokeDashoffset={seg.offset}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-bold text-gray-800 leading-none">{total}</span>
            <span className="text-[9px] text-gray-400 mt-0.5">posts</span>
          </div>
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          {communityDonutData.map(d => (
            <div key={d.label} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-xs text-gray-600 flex-1 truncate">{d.label}</span>
              <span className="text-xs font-semibold text-gray-700 tabular-nums">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

function TopPostsChart() {
  const maxLikes = topCommunityPosts[0]?.likes || 1;
  return (
    <ChartCard title="Top Community Posts" subtitle="Ranked by likes">
      <div className="px-5 py-4 space-y-3">
        {topCommunityPosts.map(post => (
          <HBar
            key={post.id}
            label={post.title ?? post.body}
            value={post.likes}
            maxValue={maxLikes}
            color="#a78bfa"
            suffix=" ♥"
          />
        ))}
      </div>
    </ChartCard>
  );
}

function SkillsDemandChart() {
  const maxCount = topSkills[0]?.count || 1;
  return (
    <ChartCard title="In-Demand Skills" subtitle="Across collaboration posts">
      <div className="px-5 py-4 space-y-3">
        {topSkills.map(({ name, count }) => (
          <HBar
            key={name}
            label={name}
            value={count}
            maxValue={maxCount}
            color="#60a5fa"
            suffix={count === 1 ? " post" : " posts"}
          />
        ))}
      </div>
    </ChartCard>
  );
}

// --- Page ---

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of the CADT Community platform.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Events"          value={events.length}         icon={Calendar}      bg="bg-orange-50"  iconColor="text-orange-500"  to="/admin/community/events" />
        <StatCard label="Collab Posts"    value={collabPosts.length}    icon={Users}         bg="bg-emerald-50" iconColor="text-emerald-500" to="/admin/community/collaboration" />
        <StatCard label="Community Posts" value={communityPosts.length} icon={MessageSquare} bg="bg-violet-50"  iconColor="text-violet-500"  to="/admin/community/posts" />
        <StatCard label="Users"           value={MOCK_USERS}            icon={UserCog}       bg="bg-blue-50"    iconColor="text-blue-500"    to="/admin/users" />
      </div>

      <div className="mb-6">
        <UserActivityChart />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <EventFillChart />
        <CommunityDonutChart />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <TopPostsChart />
        <SkillsDemandChart />
      </div>
    </div>
  );
}
