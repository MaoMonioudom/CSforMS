import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, Calendar, Users, MessageSquare, MapPin } from "lucide-react";
import { events, formatEventDate } from "@/lib/events-data";
import { communityPosts, formatRelativeTime } from "@/lib/community-data";
import { collabPosts } from "@/lib/collaboration-data";

// ── Push Pin ──────────────────────────────────────────────────────────────────
function PushPin({ color = "#ef4444", size = 16 }) {
  return (
    <svg width={size} height={size * 1.75} viewBox="0 0 16 28" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7" fill={color} />
      <circle cx="5.5" cy="5.5" r="2.5" fill="rgba(255,255,255,0.45)" />
      <line x1="8" y1="15" x2="8" y2="28" stroke="#888" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ── Pinned wrapper ────────────────────────────────────────────────────────────
function Pinned({ rotate = 0, pinColor = "#ef4444", pinOffset = "left-1/2", className = "", children }) {
  return (
    <div
      className={`relative transition-all duration-300 hover:scale-[1.04] hover:z-20 ${className}`}
      style={{ transform: `rotate(${rotate}deg)`, transformOrigin: "top center" }}
    >
      <div className={`absolute -top-5 ${pinOffset} -translate-x-1/2 z-10 drop-shadow`}>
        <PushPin color={pinColor} />
      </div>
      {children}
    </div>
  );
}

// ── Section label (torn strip) ────────────────────────────────────────────────
function BoardLabel({ children, rotate = -0.8, pinColor = "#c53030" }) {
  return (
    <div className="relative inline-flex items-center">
      <div className="absolute -top-4 left-5 z-10">
        <PushPin color={pinColor} size={14} />
      </div>
      <div
        className="bg-white/90 backdrop-blur-sm px-3 py-1.5 sm:px-6 sm:py-2 shadow-md"
        style={{
          transform: `rotate(${rotate}deg)`,
          clipPath: "polygon(0 0, 96% 2%, 100% 45%, 97% 100%, 3% 98%, 0 55%)",
          boxShadow: "2px 3px 10px rgba(0,0,0,0.22)",
        }}
      >
        <span className="text-lg sm:text-2xl font-bold text-foreground tracking-wide">{children}</span>
      </div>
    </div>
  );
}


// ── Washi tape strip ──────────────────────────────────────────────────────────
function Tape({ color = "rgba(255,230,120,0.75)", rotate = -45, className = "" }) {
  return (
    <div
      aria-hidden
      className={`absolute pointer-events-none ${className}`}
      style={{
        background: color,
        height: "20px",
        borderRadius: "1px",
        transform: `rotate(${rotate}deg)`,
        opacity: 0.85,
      }}
    />
  );
}

// ── Event Polaroid ────────────────────────────────────────────────────────────
function EventPolaroid({ event, rotate }) {
  return (
    <Pinned rotate={rotate} pinColor="#dc2626">
      <Link
        to={`/community/eventspace/${event.id}`}
        className="block bg-white p-2.5 pb-10 select-none"
        style={{ boxShadow: "4px 6px 22px rgba(0,0,0,0.28)" }}
      >
        <div className="relative h-36 sm:h-44 overflow-hidden bg-muted">
          {event.image ? (
            <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-events/30 to-events/10 flex items-center justify-center">
              <Calendar className="h-10 w-10 text-events/40" />
            </div>
          )}
          <span className="absolute top-2 left-2 bg-events text-events-foreground text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5">
            {formatEventDate(event.date).split(",")[0]}
          </span>
        </div>
        <div className="mt-3 px-1">
          <p className="text-base font-bold leading-snug text-foreground line-clamp-2">{event.title}</p>
          <p className="mt-1 text-[10px] text-muted-foreground flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5 shrink-0" /> {event.location}
          </p>
        </div>
      </Link>
    </Pinned>
  );
}

// ── Collab Sticky Note ────────────────────────────────────────────────────────
const STICKY = [
  { bg: "#fffde7", line: "#f9e100", pin: "#6366f1" },
  { bg: "#fce4ec", line: "#f48fb1", pin: "#ec4899" },
  { bg: "#e8f5e9", line: "#81c784", pin: "#16a34a" },
  { bg: "#e3f2fd", line: "#90caf9", pin: "#2563eb" },
];

function CollabNote({ post, rotate, idx }) {
  const s = STICKY[idx % STICKY.length];
  return (
    <Pinned rotate={rotate} pinColor={s.pin}>
      <Link
        to={`/community/collabspace/${post.id}`}
        className="flex flex-col p-4 min-h-42.5"
        style={{
          background: s.bg,
          boxShadow: "3px 5px 18px rgba(0,0,0,0.18)",
        }}
      >
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground">
          {post.category}
        </span>
        <p className="mt-2 text-lg font-bold text-foreground leading-snug flex-1 line-clamp-3">
          {post.projectTitle}
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {post.rolesNeeded.slice(0, 2).map((r) => (
            <span key={r} className="text-[9px] bg-black/8 rounded px-1.5 py-0.5 font-semibold text-foreground/70">
              {r}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <img src={post.author.avatar} alt={post.author.name} className="h-5 w-5 rounded-full object-cover" />
          <span className="text-[10px] text-muted-foreground font-semibold">{post.author.name}</span>
        </div>
      </Link>
    </Pinned>
  );
}

// ── Community Card (lined notepad) ────────────────────────────────────────────
function CommunityCard({ post, rotate }) {
  return (
    <Pinned rotate={rotate} pinColor="#7c3aed">
      <Link
        to={`/community/${post.id}`}
        className="flex flex-col bg-white p-4 min-h-45"
        style={{
          boxShadow: "3px 5px 18px rgba(0,0,0,0.18)",
          backgroundImage:
            "repeating-linear-gradient(transparent, transparent 23px, #dde6f0 24px)",
          backgroundSize: "100% 24px",
          backgroundPositionY: "32px",
        }}
      >
        <div className="inline-flex items-center gap-1 bg-community/10 text-community text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit mb-3">
          <MessageSquare className="h-2.5 w-2.5" />
          {post.category}
        </div>
        <p className="text-base font-bold leading-snug text-foreground line-clamp-3 flex-1">
          {post.title ?? post.body}
        </p>
        <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="font-semibold">{post.author.name}</span>
          <span>{formatRelativeTime(post.postedAt)}</span>
        </div>
      </Link>
    </Pinned>
  );
}

// ── Stats mini sticky ─────────────────────────────────────────────────────────
function StatPin({ value, label, color, rotate, pinColor }) {
  return (
    <Pinned rotate={rotate} pinColor={pinColor} className="w-36">
      <div
        className="p-4 text-center"
        style={{
          background: color,
          boxShadow: "3px 5px 14px rgba(0,0,0,0.18)",
        }}
      >
        <p className="text-4xl font-extrabold text-foreground">{value}+</p>
        <p className="mt-1 text-[11px] font-semibold text-muted-foreground leading-tight">{label}</p>
      </div>
    </Pinned>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const featuredEvents  = events.slice(0, 4);
  const featuredCollab  = collabPosts.slice(0, 4);
  const featuredCommunity = communityPosts.slice(0, 5);

  return (
    <main
      className="min-h-screen pb-20"
      style={{
        position: "relative",
        backgroundColor: "#d4bc94",
        backgroundImage: `
          radial-gradient(ellipse at 0% 0%,   rgba(180,155,105,0.55) 0%, transparent 50%),
          radial-gradient(ellipse at 100% 0%,  rgba(150,125,80,0.4)  0%, transparent 45%),
          radial-gradient(ellipse at 0% 100%,  rgba(145,120,75,0.4)  0%, transparent 45%),
          radial-gradient(ellipse at 100% 100%,rgba(120,95,55,0.5)   0%, transparent 45%),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65 0.4' numOctaves='6' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0.18 0 0 0 0.74 0.14 0 0 0 0.62 0.09 0 0 0 0.42 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23p)'/%3E%3C/svg%3E")
        `,
      }}
    >
      {/* Subtle makerspace circuit overlay */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.06, zIndex: 0, overflow: "hidden" }}>
        <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
          <defs>
            <pattern id="hp-circuit" x="0" y="0" width="180" height="180" patternUnits="userSpaceOnUse">
              <line x1="10" y1="50" x2="80" y2="50" stroke="#3a2008" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="80" cy="50" r="5" fill="none" stroke="#3a2008" strokeWidth="2" />
              <line x1="80" y1="50" x2="80" y2="113" stroke="#3a2008" strokeWidth="2.5" strokeLinecap="round" />
              <rect x="68" y="108" width="24" height="13" fill="none" stroke="#3a2008" strokeWidth="2" rx="2" />
              <line x1="80" y1="121" x2="80" y2="155" stroke="#3a2008" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="80" cy="155" r="4" fill="#3a2008" />
              <circle cx="10" cy="50" r="4" fill="#3a2008" />
              <line x1="120" y1="10" x2="168" y2="10" stroke="#3a2008" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="168" y1="10" x2="168" y2="78" stroke="#3a2008" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="168" cy="78" r="5" fill="none" stroke="#3a2008" strokeWidth="2" />
              <circle cx="120" cy="10" r="4" fill="#3a2008" />
              <line x1="20" y1="142" x2="58" y2="142" stroke="#3a2008" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="58" cy="142" r="4" fill="none" stroke="#3a2008" strokeWidth="2" />
              <circle cx="20" cy="142" r="3" fill="#3a2008" />
              <line x1="130" y1="110" x2="130" y2="160" stroke="#3a2008" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="130" cy="110" r="4" fill="#3a2008" />
              <line x1="130" y1="160" x2="165" y2="160" stroke="#3a2008" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="165" cy="160" r="3" fill="#3a2008" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hp-circuit)" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Welcome poster ─────────────────────────────────── */}
        <div className="pt-10 pb-16 flex flex-col lg:flex-row gap-10 items-start">

          {/* Big welcome card */}
          <Pinned rotate={-1} pinColor="#b91c1c" className="flex-1 max-w-xl">
            <div className="relative bg-white/96 p-5 sm:p-8 lg:p-10" style={{ boxShadow: "6px 10px 36px rgba(0,0,0,0.32)" }}>
              <Tape color="rgba(255,210,100,0.8)" rotate={-42} className="w-12 right-5 top-3" />
              <Tape color="rgba(180,220,255,0.7)" rotate={38} className="w-10 left-4 bottom-4" />
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-bold mb-2">
                Home &rsaquo; Community
              </p>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[0.95]">
                Community<br />
                <span className="text-events">Hub.</span>
              </h1>
              <p className="mt-5 text-muted-foreground leading-relaxed text-base max-w-sm">
                A bulletin board for makers, builders &amp; curious minds at CADT —
                find events, team up, and share what you're building.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/community/eventspace"
                  className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-sm font-extrabold rounded-full hover:-translate-y-0.5 transition-transform shadow-md"
                >
                  Browse Events <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/community/collabspace"
                  className="inline-flex items-center gap-2 border-2 border-border bg-white px-5 py-2.5 text-sm font-extrabold rounded-full hover:-translate-y-0.5 transition-transform"
                >
                  Find Teammates <Users className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Pinned>

          {/* Middle pinned notes cluster */}
          <div className="hidden lg:flex flex-col gap-7 pt-14 flex-1 max-w-52.5">
            {/* Hot discussion sticky */}
            <Pinned rotate={2} pinColor="#dc2626">
              <Link
                to={`/community/${communityPosts[0].id}`}
                className="flex flex-col p-4"
                style={{
                  minHeight: "160px",
                  background: "#fffde7",
                  boxShadow: "3px 5px 18px rgba(0,0,0,0.2)",
                }}
              >
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-500">Hot Discussion</span>
                <p className="mt-2 text-sm font-bold text-foreground leading-snug flex-1 line-clamp-3">
                  {communityPosts[0].title}
                </p>
                <div className="mt-3 flex items-center gap-1.5">
                  <img src={communityPosts[0].author.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                  <span className="text-[10px] text-muted-foreground font-semibold">{communityPosts[0].author.name}</span>
                </div>
              </Link>
            </Pinned>

            {/* Next event note */}
            <Pinned rotate={-1.5} pinColor="#f97316">
              <Link
                to={`/community/eventspace/${events[1].id}`}
                className="flex flex-col p-4"
                style={{
                  minHeight: "140px",
                  background: "white",
                  boxShadow: "3px 5px 18px rgba(0,0,0,0.18)",
                  backgroundImage: "repeating-linear-gradient(transparent, transparent 23px, #dde6f0 24px)",
                  backgroundSize: "100% 24px",
                  backgroundPositionY: "32px",
                }}
              >
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-events">📅 Next Up</span>
                <p className="mt-2 text-sm font-bold text-foreground leading-snug flex-1 line-clamp-2">
                  {events[1].title}
                </p>
                <p className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5 shrink-0" /> {events[1].location}
                </p>
              </Link>
            </Pinned>
          </div>

        </div>

        {/* ── Events ─────────────────────────────────────────── */}
        <section className="mb-20">
          <div className="flex items-end justify-between mb-12">
            <BoardLabel rotate={-1} pinColor="#dc2626">📅 Upcoming Events</BoardLabel>
            <Link
              to="/community/eventspace"
              className="flex items-center gap-1 text-white/75 hover:text-white font-bold text-sm transition-colors"
            >
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-14 pt-4">
            {featuredEvents.map((ev, i) => (
              <EventPolaroid
                key={ev.id}
                event={ev}
                rotate={[-2.5, 1.5, -1, 2][i]}
              />
            ))}
          </div>
        </section>

        {/* ── Collaboration ───────────────────────────────────── */}
        <section className="mb-20">
          <div className="flex items-end justify-between mb-12">
            <BoardLabel rotate={0.8} pinColor="#6366f1">🤝 Looking for Teammates</BoardLabel>
            <Link
              to="/community/collabspace"
              className="flex items-center gap-1 text-white/75 hover:text-white font-bold text-sm transition-colors"
            >
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-14 pt-4">
            {featuredCollab.map((post, i) => (
              <CollabNote
                key={post.id}
                post={post}
                rotate={[1.5, -2, 1, -1.5][i]}
                idx={i}
              />
            ))}
          </div>
        </section>

        {/* ── Community Highlights ────────────────────────────── */}
        <section>
          <div className="flex items-end justify-between mb-12">
            <BoardLabel rotate={-0.6} pinColor="#7c3aed">💬 Community Highlights</BoardLabel>
            <Link
              to="/community/communityspace"
              className="flex items-center gap-1 text-white/75 hover:text-white font-bold text-sm transition-colors"
            >
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-14 pt-4">
            {featuredCommunity.map((post, i) => (
              <CommunityCard
                key={post.id}
                post={post}
                rotate={[-1.5, 2, -2, 1, -1][i]}
              />
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
