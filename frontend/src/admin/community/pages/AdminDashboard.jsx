import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, MessageSquare, UserCog, ArrowUpRight } from "lucide-react";
import { fetchEvents } from "@/lib/events-data";
import { fetchCollabPosts } from "@/lib/collaboration-data";
import { fetchCommunityPosts } from "@/lib/community-data";
import { fetchDailyPageViews } from "@/lib/analytics-data";
import { api } from "@/lib/api/client";
import { ChartCard, LegendDot, HBar } from "../../components/charts";

function formatShortDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

// --- Derived chart data ---
function deriveCommunityDonutData(communityPosts) {
  const communityCategories = communityPosts.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  return [
    { label: "Technical",    value: communityCategories.Technical    || 0, color: "#f97316" },
    { label: "Showcase",     value: communityCategories.Showcase     || 0, color: "#8b5cf6" },
    { label: "Social",       value: communityCategories.Social       || 0, color: "#06b6d4" },
    { label: "Question",     value: communityCategories.Question     || 0, color: "#3b82f6" },
    { label: "Announcement", value: communityCategories.Announcement || 0, color: "#10b981" },
  ].filter(d => d.value > 0);
}

function deriveTopCommunityPosts(communityPosts) {
  return [...communityPosts].sort((a, b) => b.likes - a.likes).slice(0, 5);
}

function deriveTopSkills(collabPosts) {
  const skillCounts = {};
  collabPosts.forEach(post => post.skills.forEach(s => { skillCounts[s] = (skillCounts[s] || 0) + 1; }));
  return Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));
}

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

// --- Chart components ---

// Events with no capacity set (max_participants left blank) would otherwise
// divide by zero — treated as 0% full rather than NaN/Infinity.
function fillRate(ev) {
  return ev.capacity ? ev.participants / ev.capacity : 0;
}

function EventFillChart({ events }) {
  const sorted = [...events].sort((a, b) => fillRate(b) - fillRate(a));
  return (
    <ChartCard title="Event Capacity" subtitle="Fill rate — sorted highest first">
      <div className="px-5 py-4 space-y-3 max-h-72 overflow-y-auto">
        {sorted.map(ev => {
          const pct = Math.round(Math.min(1, fillRate(ev)) * 100);
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

function CommunityDonutChart({ communityDonutData }) {
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

function TopPostsChart({ topCommunityPosts }) {
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

function SkillsDemandChart({ topSkills }) {
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

function SiteVisitsChart({ series }) {
  const total = series.reduce((s, d) => s + d.count, 0);
  const maxCount = Math.max(1, ...series.map(d => d.count));
  return (
    <ChartCard title="Site Visits" subtitle={`Last ${series.length} days — real traffic, admin usage excluded`}>
      <div className="px-5 py-4">
        <p className="mb-4">
          <span className="text-3xl font-bold text-gray-900">{total}</span>
          <span className="text-sm font-medium text-gray-400 ml-2">total visits</span>
        </p>
        <div className="flex items-end gap-[3px] h-24">
          {series.map((d) => (
            <div key={d.date}
              className="flex-1 min-w-[2px] rounded-t bg-blue-400 hover:bg-blue-500 transition-colors"
              style={{ height: `${Math.max(2, (d.count / maxCount) * 100)}%` }}
              title={`${formatShortDate(d.date)}: ${d.count} visit${d.count === 1 ? "" : "s"}`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-gray-400">
          <span>{series[0] && formatShortDate(series[0].date)}</span>
          <span>{series.length > 0 && formatShortDate(series[series.length - 1].date)}</span>
        </div>
      </div>
    </ChartCard>
  );
}

// --- Page ---

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { fetchEvents().then(setEvents).catch(() => setError("Couldn't load some dashboard data — try refreshing.")); }, []);

  const [collabPosts, setCollabPosts] = useState([]);
  useEffect(() => { fetchCollabPosts().then(setCollabPosts).catch(() => setError("Couldn't load some dashboard data — try refreshing.")); }, []);
  const topSkills = deriveTopSkills(collabPosts);

  const [communityPosts, setCommunityPosts] = useState([]);
  useEffect(() => { fetchCommunityPosts().then(setCommunityPosts).catch(() => setError("Couldn't load some dashboard data — try refreshing.")); }, []);
  const communityDonutData = deriveCommunityDonutData(communityPosts);
  const topCommunityPosts = deriveTopCommunityPosts(communityPosts);

  const [userCount, setUserCount] = useState(0);
  useEffect(() => { api.get("/api/users").then(({ data }) => setUserCount(data.length)).catch(() => setError("Couldn't load some dashboard data — try refreshing.")); }, []);

  const [pageViews, setPageViews] = useState([]);
  useEffect(() => { fetchDailyPageViews(30).then(setPageViews).catch(() => setError("Couldn't load some dashboard data — try refreshing.")); }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of the CADT Community platform.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Events"          value={events.length}         icon={Calendar}      bg="bg-orange-50"  iconColor="text-orange-500"  to="/admin/community/events" />
        <StatCard label="Collab Posts"    value={collabPosts.length}    icon={Users}         bg="bg-emerald-50" iconColor="text-emerald-500" to="/admin/community/collaboration" />
        <StatCard label="Community Posts" value={communityPosts.length} icon={MessageSquare} bg="bg-violet-50"  iconColor="text-violet-500"  to="/admin/community/posts" />
        <StatCard label="Users"           value={userCount}              icon={UserCog}       bg="bg-blue-50"    iconColor="text-blue-500"    to="/admin/users" />
      </div>

      <div className="mb-6">
        <SiteVisitsChart series={pageViews} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <EventFillChart events={events} />
        <CommunityDonutChart communityDonutData={communityDonutData} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <TopPostsChart topCommunityPosts={topCommunityPosts} />
        <SkillsDemandChart topSkills={topSkills} />
      </div>
    </div>
  );
}
