import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut, MessageSquare, BookOpen, Package, ArrowRight, Settings,
  Award, GraduationCap, Flame, Lock, Sparkles, Users,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { SignOutConfirmDialog } from "../components/SignOutConfirmDialog";
import { SubpageHeader } from "./SubpageHeader";

const D = {
  bg:     "#eef5fc",
  bg2:    "#dceafa",
  card:   "#ffffff",
  card2:  "#f3f8fd",
  border: "rgba(91,170,216,0.22)",
  muted:  "#5b7286",
  faint:  "#8aa0b2",
  text:   "#16324a",
};

const MODULES = [
  { label: "Community", sub: "Bulletin Board",    color: "#c9a86c", icon: MessageSquare, to: "/community",  stat: "3 spaces"          },
  { label: "Learning",  sub: "Digital Library",   color: "#c0392b", icon: BookOpen,      to: "/learning",   stat: "6 courses"         },
  { label: "Inventory", sub: "Resource Manager",  color: "#0891b2", icon: Package,       to: "/inventory",  stat: "12 items tracked"  },
];

const ACTIVITY = [
  { action: "Registered for",    target: "Intro to Electronics Workshop", time: "Just now",   color: "#c9a86c" },
  { action: "Enrolled in",       target: "Python for Makers",             time: "2 days ago", color: "#c0392b" },
  { action: "Requested",         target: "Arduino Uno R3 × 2",           time: "3 days ago", color: "#0891b2" },
  { action: "Posted in",         target: "Community Space",               time: "5 days ago", color: "#c9a86c" },
];

const BADGES = [
  { id: "workshop-1", title: "Workshop Rookie",  desc: "Joined your first workshop",        icon: Users,          color: "#c9a86c", earned: true,  date: "Jun 12" },
  { id: "course-1",   title: "Course Finisher",  desc: "Completed a full course",            icon: GraduationCap,  color: "#c0392b", earned: true,  date: "Jun 20" },
  { id: "collector",  title: "Resourceful",      desc: "Requested 5 items from Inventory",   icon: Package,        color: "#0891b2", earned: true,  date: "Jun 25" },
  { id: "streak",     title: "On a Roll",        desc: "7-day activity streak",              icon: Flame,          color: "#f59e0b", earned: true,  date: "Jul 1"  },
  { id: "quest-1",    title: "Quest Master",     desc: "Complete 5 quests",                  icon: Sparkles,       color: "#6366f1", earned: false },
  { id: "social",     title: "Community Voice",  desc: "Post 10 times in Community",         icon: MessageSquare,  color: "#c9a86c", earned: false },
];

function Avatar({ name, size = 56 }) {
  const initials = name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) ?? "?";
  return (
    <div
      className="rounded-full flex items-center justify-center font-extrabold text-white shrink-0"
      style={{ width: size, height: size, background: "linear-gradient(135deg,#6366f1,#a855f7)", fontSize: size * 0.34 }}>
      {initials}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  const earnedCount = BADGES.filter(b => b.earned).length;

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${D.bg} 0%, ${D.bg2} 100%)` }}>

      <div aria-hidden className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: `linear-gradient(rgba(99,102,241,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.05) 1px,transparent 1px)`, backgroundSize: "48px 48px" }} />

      <SubpageHeader backLabel="Back" />

      <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 py-12">

        {/* Profile hero */}
        <div className="rounded-2xl p-8 mb-4 relative overflow-hidden"
          style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.08)" }}>
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 2, background: "linear-gradient(90deg,transparent,#6366f1,#a855f7,transparent)" }} />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar name={user.name} size={64} />
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold" style={{ color: D.text }}>{user.name}</h1>
              <p className="text-sm mt-0.5" style={{ color: D.muted }}>{user.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {MODULES.map(m => (
                  <span key={m.label} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}28` }}>
                    {m.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Edit profile / sign out */}
        <div className="flex gap-3 mb-8">
          <Link to="/hub/settings"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ color: D.text, border: `1px solid ${D.border}`, background: D.card }}>
            <Settings size={14} /> Edit Profile
          </Link>
          <button onClick={() => setConfirmOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ color: "#dc2626", border: "1px solid rgba(239,68,68,0.28)", background: "rgba(239,68,68,0.06)" }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        <SignOutConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} />

        {/* Badges & Achievements */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5" style={{ color: D.muted }}>
              <Award size={12} /> Badges &amp; Achievements
            </p>
            <span className="text-[11px] font-semibold" style={{ color: D.muted }}>{earnedCount}/{BADGES.length} earned</span>
          </div>
          <div className="rounded-2xl p-6" style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {BADGES.map(b => {
                const Icon = b.icon;
                return (
                  <div key={b.id} className="flex flex-col items-center text-center gap-2"
                    title={b.earned ? `${b.title} — earned ${b.date}` : `${b.title} — locked`}>
                    <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={b.earned
                        ? { background: `${b.color}15`, border: `1.5px solid ${b.color}40` }
                        : { background: "rgba(15,50,80,0.04)", border: "1.5px dashed rgba(15,50,80,0.18)" }}>
                      <Icon size={20} style={{ color: b.earned ? b.color : D.faint }} />
                      {!b.earned && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: D.card, border: `1px solid ${D.border}` }}>
                          <Lock size={9} style={{ color: D.faint }} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold leading-tight" style={{ color: b.earned ? D.text : D.faint }}>{b.title}</p>
                      <p className="text-[9px] mt-0.5 leading-tight" style={{ color: D.faint }}>{b.earned ? b.date : "Locked"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">

          {/* Module access */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: D.muted }}>Your Modules</p>
            <div className="flex flex-col gap-3">
              {MODULES.map(m => {
                const Icon = m.icon;
                return (
                  <Link key={m.label} to={m.to}
                    className="group flex items-center gap-3 p-4 rounded-xl transition-all hover:scale-[1.01]"
                    style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${m.color}15`, border: `1px solid ${m.color}28` }}>
                      <Icon size={18} style={{ color: m.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: D.text }}>{m.label}</p>
                      <p className="text-[11px]" style={{ color: D.muted }}>{m.sub} · {m.stat}</p>
                    </div>
                    <ArrowRight size={14} style={{ color: m.color }}
                      className="shrink-0 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: D.muted }}>Recent Activity</p>
            <div className="rounded-xl overflow-hidden" style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
              {ACTIVITY.map((a, i) => (
                <div key={i}
                  className="flex items-start gap-3 px-4 py-3.5"
                  style={{ borderBottom: i < ACTIVITY.length - 1 ? "1px solid rgba(15,50,80,0.08)" : "none" }}>
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: a.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs" style={{ color: D.text }}><span style={{ color: D.muted }}>{a.action}</span> {a.target}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: D.muted }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { v: "2",  l: "Events joined"   },
                { v: "1",  l: "Course started"  },
                { v: "3",  l: "Items requested" },
              ].map(s => (
                <div key={s.l} className="rounded-xl p-3 text-center" style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
                  <p className="text-xl font-extrabold" style={{ color: D.text }}>{s.v}</p>
                  <p className="text-[9px] mt-0.5 leading-tight" style={{ color: D.muted }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
