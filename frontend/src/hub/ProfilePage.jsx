import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut, Settings, Award, Lock, Phone, FileText, Mail, CalendarDays, ShieldCheck, ShieldOff,
  Calendar, BookOpen, Package, Armchair, MessageSquare, Coins, ChevronRight,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { SignOutConfirmDialog } from "../components/SignOutConfirmDialog";
import { TopNav } from "../components/TopNav";
import { BackBar } from "../components/BackBar";
import { fetchMyAchievements, MODULE_BY_REQUIREMENT, MODULE_COLORS } from "../lib/achievements-data";
import { fetchProfileSummary, formatActivityDate } from "../lib/profile-data";
import { HUB as D } from "./hubTheme";

// Stat tiles pull straight from the same per-user counts the achievement
// award-check uses (see getUserActionCounts on the backend), so these
// numbers and badge progress never disagree. community_posts +
// collaboration_posts are merged into one "Posts" tile to keep the row to
// 5 tiles, matching the badges grid below it.
const STATS = [
  { key: "event_registrations", label: "Events", icon: Calendar, module: "community" },
  { key: "course_enrollments", label: "Courses", icon: BookOpen, module: "learning" },
  { key: "borrows", label: "Borrows", icon: Package, module: "inventory" },
  { key: "workspace_bookings", label: "Workspace", icon: Armchair, module: "community" },
  { key: "posts", label: "Posts", icon: MessageSquare, module: "community" },
];

// Recent-activity entries carry a `link` from the backend (a specific
// event/course detail page, or a module list page when there's no single
// item to land on), fall back to the module root if it's ever missing.
const MODULE_FALLBACK_LINK = { learning: "/learning", inventory: "/inventory", community: "/community" };

// Shows the real uploaded photo (profile_img_url) when one exists, falling
// back to initials-on-gradient otherwise. Previously this always ignored
// a real avatar even when the user had uploaded one.
function Avatar({ name, avatar, size = 56 }) {
  const initials = name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) ?? "?";
  if (avatar) {
    return <img src={avatar} alt={name} className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />;
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-extrabold text-white shrink-0"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${MODULE_COLORS.community}, ${MODULE_COLORS.inventory})`, fontSize: size * 0.34 }}>
      {initials}
    </div>
  );
}

// Shows the admin-uploaded icon_url directly, full-size, rather than
// shrinking it into a tiny overlay on a placeholder shape. The coded medal
// (drawn as SVG, no image asset) only kicks in as a fallback for badges
// that don't have a real image uploaded yet. Locked badges show the same
// image desaturated + dimmed rather than hidden, so there's something to
// work toward, matching the "shelf full of silhouettes" gamification look.
function BadgeMedal({ achievement }) {
  const module = MODULE_BY_REQUIREMENT[achievement.requirement_type] || "community";
  const color = MODULE_COLORS[module];
  const { earned, icon_url } = achievement;
  return (
    <div className="flex flex-col items-center text-center gap-1"
      title={earned
        ? `${achievement.title}: earned ${new Date(achievement.earned_at).toLocaleDateString()}`
        : `${achievement.title}: ${achievement.progress}/${achievement.requirement_value}`}>
      <div className="relative flex items-center justify-center" style={{ width: 52, height: 59 }}>
        {icon_url ? (
          <img src={icon_url} alt=""
            className="w-full h-full object-contain"
            style={!earned ? { filter: "grayscale(1)", opacity: 0.45 } : undefined} />
        ) : (
          <svg viewBox="0 0 60 68" width="52" height="59">
            <path d="M30 2 L56 15 V40 C56 54 44 62 30 66 C16 62 4 54 4 40 V15 Z"
              fill={earned ? color : "none"}
              stroke={earned ? "none" : color}
              strokeWidth={earned ? 0 : 2}
              strokeDasharray={earned ? "none" : "4 3"}
              opacity={earned ? 1 : 0.45} />
          </svg>
        )}
        {!earned && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock size={14} style={{ color: D.faint, filter: "drop-shadow(0 0 2px white)" }} />
          </div>
        )}
      </div>
      <p className="text-[10px] font-bold leading-tight max-w-[64px]" style={{ color: earned ? D.text : D.faint }}>{achievement.title}</p>
      {!earned && (
        <p className="text-[9px]" style={{ color: D.faint }}>{achievement.progress}/{achievement.requirement_value}</p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Wait for AuthContext to finish confirming a stored token before
  // deciding the user is logged out. Otherwise a refresh bounces someone
  // who's genuinely still logged in through /login and out to /inventory.
  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchMyAchievements(), fetchProfileSummary()])
      .then(([badges, sum]) => { setAchievements(badges); setSummary(sum); })
      .catch(() => setError("Couldn't load your profile data. Please try refreshing."))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const activity = summary?.activity ?? [];
  const counts = summary?.counts ?? {};
  const earnedCount = achievements.filter(a => a.earned).length;

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${D.bg1} 0%, ${D.bg2} 100%)` }}>

      <div aria-hidden className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: `linear-gradient(color-mix(in oklch, var(--color-inv-accent) 5%, transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in oklch, var(--color-inv-accent) 5%, transparent) 1px,transparent 1px)`, backgroundSize: "48px 48px" }} />

      <TopNav />

      <main className="relative z-10 mx-auto max-w-[1280px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        <BackBar />
        {error && (
          <div className="rounded-xl px-4 py-3 mb-6 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}>
            {error}
          </div>
        )}

        {/* Stats strip: real per-module counts, same numbers the badges below track */}
        <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {STATS.map((s) => {
            const value = s.key === "posts"
              ? (counts.community_posts ?? 0) + (counts.collaboration_posts ?? 0)
              : counts[s.key] ?? 0;
            const color = MODULE_COLORS[s.module];
            return (
              <div key={s.key} className="rounded-2xl p-4 text-center"
                style={{ background: D.bgCard, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
                <s.icon size={16} className="mx-auto mb-1.5" style={{ color }} />
                <p className="text-xl font-extrabold" style={{ color: D.text }}>{loading ? "—" : value}</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: D.muted }}>{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Top row: profile identity on one side, badges & achievements on the other */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">

          {/* Left: profile img + info (no cover photo) */}
          <div className="lg:sticky lg:top-6 flex flex-col gap-6">
            <div className="rounded-2xl p-6 flex flex-col items-center text-center"
              style={{ background: D.bgCard, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.08)" }}>
              <Avatar name={user.name} avatar={user.avatar} size={96} />
              <h1 className="text-lg font-extrabold mt-3" style={{ color: D.text }}>{user.name}</h1>

              {/* Detail info */}
              <div className="w-full mt-4 pt-5 text-left" style={{ borderTop: `1px solid ${D.border}` }}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: D.muted }}>Details</p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="shrink-0" style={{ color: D.faint }} />
                    <p className="text-xs break-all" style={{ color: D.text }}>{user.email}</p>
                  </div>
                  {user.createdAt && (
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="shrink-0" style={{ color: D.faint }} />
                      <p className="text-xs" style={{ color: D.text }}>
                        Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {user.isMember
                      ? <ShieldCheck size={14} className="shrink-0" style={{ color: "#16a34a" }} />
                      : <ShieldOff size={14} className="shrink-0" style={{ color: D.faint }} />}
                    {user.isMember ? (
                      <p className="text-xs font-semibold" style={{ color: "#16a34a" }}>Active member</p>
                    ) : (
                      <p className="text-xs" style={{ color: D.faint }}>
                        Not a member yet. <Link to="/membership" className="font-semibold underline" style={{ color: D.muted }}>activate</Link>
                      </p>
                    )}
                  </div>
                  {user.bio ? (
                    <div className="flex items-start gap-2">
                      <FileText size={14} className="mt-0.5 shrink-0" style={{ color: D.faint }} />
                      <p className="text-xs leading-relaxed" style={{ color: D.text }}>{user.bio}</p>
                    </div>
                  ) : (
                    <p className="text-xs italic" style={{ color: D.faint }}>No bio yet. Add one to tell others about yourself.</p>
                  )}
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="shrink-0" style={{ color: D.faint }} />
                      <p className="text-xs" style={{ color: D.text }}>{user.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full mt-5">
                <Link to="/hub/settings"
                  className="btn-secondary justify-center hover:opacity-80"
                  style={{ color: D.text, borderColor: D.border, background: D.bgCard }}>
                  <Settings size={14} /> Edit Details
                </Link>
                <button onClick={() => setConfirmOpen(true)}
                  className="btn-secondary justify-center hover:opacity-80"
                  style={{ color: "#dc2626", borderColor: "rgba(239,68,68,0.28)", background: "rgba(239,68,68,0.06)" }}>
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>

            {/* Quick links: Workspace/Credits/Membership live on their own
                routes today, reachable only via footer/nav; surfacing them
                here makes Profile the actual account-hub landing spot. */}
            <div className="rounded-2xl overflow-hidden" style={{ background: D.bgCard, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
              {[
                { to: "/workspace", label: "Request a workspace", icon: Armchair },
                ...(user.isMember ? [{ to: "/credits", label: "Manage credits", icon: Coins }] : []),
                { to: "/membership", label: user.isMember ? "Membership details" : "Become a member", icon: ShieldCheck },
              ].map((l, i, arr) => (
                <Link key={l.to} to={l.to}
                  className="flex items-center gap-2.5 px-4 py-3 text-xs font-semibold transition-colors hover:bg-black/[0.03]"
                  style={{ color: D.text, borderBottom: i < arr.length - 1 ? `1px solid ${D.border}` : "none" }}>
                  <l.icon size={14} className="shrink-0" style={{ color: D.muted }} />
                  <span className="flex-1">{l.label}</span>
                  <ChevronRight size={14} style={{ color: D.faint }} />
                </Link>
              ))}
            </div>
          </div>

          <SignOutConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} />

          {/* Right: badges & achievements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5" style={{ color: D.muted }}>
                <Award size={12} /> Badges &amp; Achievements
              </p>
              {!loading && <span className="text-[11px] font-semibold" style={{ color: D.muted }}>{earnedCount}/{achievements.length} earned</span>}
            </div>
            <div className="rounded-2xl p-6" style={{ background: D.bgCard, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
              {loading ? (
                <p className="text-xs" style={{ color: D.muted }}>Loading…</p>
              ) : achievements.length === 0 ? (
                <p className="text-xs" style={{ color: D.muted }}>No badges have been set up yet. Check back soon.</p>
              ) : (
                <>
                  {earnedCount === 0 && (
                    <p className="text-xs mb-4" style={{ color: D.muted }}>
                      You haven't earned a badge yet. Join an event, borrow an item, or enroll in a course to get started!
                    </p>
                  )}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                    {achievements.map(a => <BadgeMedal key={a.achievement_id} achievement={a} />)}
                  </div>
                </>
              )}
            </div>

            {/* Recent activity: directly under badges & achievements */}
            <div className="mt-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: D.muted }}>Recent Activity</p>
              <div className="rounded-xl overflow-hidden" style={{ background: D.bgCard, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
                {loading ? (
                  <p className="text-xs px-4 py-4" style={{ color: D.muted }}>Loading…</p>
                ) : activity.length === 0 ? (
                  <p className="text-xs px-4 py-4" style={{ color: D.muted }}>Nothing yet. Get involved to see your activity here.</p>
                ) : activity.map((a, i) => {
                  const module = a.type === "course" ? "learning" : a.type === "borrow" ? "inventory" : "community";
                  const to = a.link || MODULE_FALLBACK_LINK[module];
                  return (
                    <Link key={i} to={to}
                      className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-black/[0.03]"
                      style={{ borderBottom: i < activity.length - 1 ? "1px solid rgba(15,50,80,0.08)" : "none" }}>
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: MODULE_COLORS[module] }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs" style={{ color: D.text }}>{a.label}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: D.muted }}>{formatActivityDate(a.date)}</p>
                      </div>
                      <ChevronRight size={13} className="shrink-0 mt-0.5" style={{ color: D.faint }} />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
