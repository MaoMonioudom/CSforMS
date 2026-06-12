import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Users,
  MessageSquare,
  Sparkles,
  MapPin,
  Clock,
  Zap,
} from "lucide-react";
import { events, formatEventDate } from "@/lib/events-data";
import { communityPosts, formatRelativeTime } from "@/lib/community-data";

// ─── Doodle SVGs ────────────────────────────────────────────────────────────

function DoodleLightbulb({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M24 6C16.3 6 10 12.3 10 20c0 5 2.5 9.4 6.3 12.1V35a1.5 1.5 0 001.5 1.5h12.4A1.5 1.5 0 0031.7 35v-2.9C35.5 29.4 38 25 38 20c0-7.7-6.3-14-14-14z" fill="currentColor" opacity="0.9" />
      <rect x="17" y="36.5" width="14" height="2.5" rx="1.25" fill="currentColor" opacity="0.7" />
      <rect x="18.5" y="40" width="11" height="2.5" rx="1.25" fill="currentColor" opacity="0.5" />
      <path d="M21 20l2 3 4-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
  );
}

function DoodleRocket({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M24 6S14 16 14 28h20C34 16 24 6 24 6z" fill="currentColor" opacity="0.9" />
      <path d="M14 28l-5 9 9-4M34 28l5 9-9-4" fill="currentColor" opacity="0.6" />
      <circle cx="24" cy="24" r="4" fill="white" opacity="0.7" />
      <circle cx="24" cy="24" r="2" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

function DoodleStar({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M24 4l4.7 14.3H44l-12.2 8.8 4.7 14.3L24 33l-12.5 8.4 4.7-14.3L4 18.3h15.3L24 4z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

function DoodleWrench({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M38 6a8 8 0 00-7.7 10L12 34.2A8 8 0 1012 44a8 8 0 008-8L38.2 18A8 8 0 0038 6z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />
    </svg>
  );
}

function DoodlePalette({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M24 6C14.1 6 6 14.1 6 24s8.1 18 18 18c2 0 3.6-1.6 3.6-3.6 0-.9-.4-1.8-.9-2.4-.5-.6-.9-1.4-.9-2.3 0-2 1.6-3.6 3.6-3.6H33c5.5 0 9-4.5 9-9C42 13.3 33.9 6 24 6z" fill="currentColor" opacity="0.85" />
      <circle cx="14" cy="22" r="2.5" fill="white" opacity="0.8" />
      <circle cx="19" cy="14" r="2.5" fill="white" opacity="0.8" />
      <circle cx="29" cy="12" r="2.5" fill="white" opacity="0.8" />
      <circle cx="35" cy="20" r="2.5" fill="white" opacity="0.8" />
    </svg>
  );
}

function DoodleSparkle({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M16 2v6M16 24v6M2 16h6M24 16h6M6.3 6.3l4.2 4.2M21.5 21.5l4.2 4.2M21.5 10.5l4.2-4.2M6.3 25.7l4.2-4.2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

// ─── Activity Ticker ─────────────────────────────────────────────────────────

const tickerItems = [
  { icon: "🎯", text: "Build-a-Bot Workshop · 48 students joined" },
  { icon: "🤝", text: "Mobile App Team · Looking for 2 developers" },
  { icon: "💬", text: "Design Resources Thread · 12 new replies" },
  { icon: "🏆", text: "Hackathon 2026 · Registration now open!" },
  { icon: "🚀", text: "Rocket Club Showcase · Project submitted" },
  { icon: "🎨", text: "UI/UX Workshop · 3 spots left" },
  { icon: "⚡", text: "Arduino Crash Course · Starting tomorrow" },
];

function ActivityTicker() {
  const items = [...tickerItems, ...tickerItems];
  return (
    <div className="w-full overflow-hidden border-y border-border/60 bg-background/60 backdrop-blur py-2.5">
      <div className="flex gap-10 animate-ticker whitespace-nowrap">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <span>{item.icon}</span>
            <span>{item.text}</span>
            <span className="text-border/80 mx-2">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Animated Count-up ───────────────────────────────────────────────────────

function CountUp({ target }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const observed = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !observed.current) {
        observed.current = true;
        let start = 0;
        const step = Math.ceil(target / 40);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setValue(target); clearInterval(timer); }
          else setValue(start);
        }, 30);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{value}</span>;
}

// ─── Space Cards ─────────────────────────────────────────────────────────────

const spaces = [
  {
    to: "/events",
    title: "Events",
    description: "Discover workshops, competitions, seminars, and makerspace activities happening around the community.",
    accent: "bg-events text-events-foreground",
    border: "border-events/30",
    glow: "shadow-events/20",
    soft: "from-events/15 to-events/5",
    icon: Calendar,
    stat: "12 upcoming",
    emoji: "🎯",
    doodle: DoodleRocket,
    doodleColor: "text-events",
    stripeColor: "bg-events/10",
  },
  {
    to: "/collaboration",
    title: "Collaboration",
    description: "Find teammates, study partners, volunteers, and collaborators for projects, competitions, and shared goals.",
    accent: "bg-collaboration text-collaboration-foreground",
    border: "border-collaboration/30",
    glow: "shadow-collaboration/20",
    soft: "from-collaboration/15 to-collaboration/5",
    icon: Users,
    stat: "23 open roles",
    emoji: "🤝",
    doodle: DoodleWrench,
    doodleColor: "text-collaboration",
    stripeColor: "bg-collaboration/10",
  },
  {
    to: "/community",
    title: "Community",
    description: "Ask questions, share knowledge, showcase projects, discuss interests, and connect with fellow students.",
    accent: "bg-community text-community-foreground",
    border: "border-community/30",
    glow: "shadow-community/20",
    soft: "from-community/15 to-community/5",
    icon: MessageSquare,
    stat: "156 discussions",
    emoji: "💬",
    doodle: DoodlePalette,
    doodleColor: "text-community",
    stripeColor: "bg-community/10",
  },
];

// ─── Featured Event Card ──────────────────────────────────────────────────────

function FeaturedEventCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const event = events[currentIndex];
  const hasNext = currentIndex < events.length - 1;
  const pct = (event.participants / event.capacity) * 100;
  const spotsLeft = event.capacity - event.participants;

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
      <div className="grid lg:grid-cols-2 min-h-[420px]">
        <div className="relative overflow-hidden min-h-[280px] lg:min-h-0">
          <img
            key={event.id}
            src={event.image}
            alt={event.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/30" />
          <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-events text-events-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider shadow">
            <Calendar className="h-3 w-3" />
            Featured Event
          </div>
          {/* Countdown feel badge */}
          {spotsLeft <= 10 && (
            <div className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-red-500 text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider animate-pulse">
              <Zap className="h-2.5 w-2.5" /> {spotsLeft} spots left!
            </div>
          )}
          <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur px-3 py-1 text-xs font-semibold text-muted-foreground">
            {currentIndex + 1} / {events.length}
          </div>
        </div>
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap gap-2 mb-5">
              {event.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground capitalize">
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              {event.title}
            </h3>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {formatEventDate(event.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {event.location}
              </span>
            </div>
            <p className="mt-5 text-muted-foreground leading-relaxed">{event.shortDescription}</p>
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span className="font-semibold">{event.participants} joined</span>
                <span className={spotsLeft <= 10 ? "font-bold text-red-500" : ""}>{spotsLeft} spots left</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-events transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <img src={event.author.avatar} alt={event.author.name} className="h-8 w-8 rounded-full object-cover ring-2 ring-events/30" />
              <span className="text-xs text-muted-foreground">
                Hosted by <span className="font-bold text-foreground">{event.author.name}</span> · {event.author.role}
              </span>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to={`/events/${event.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-events text-events-foreground px-6 py-2.5 text-sm font-bold shadow-lg shadow-events/25 transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-events/30"
            >
              View Event <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setCurrentIndex(hasNext ? (i) => i + 1 : 0)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
            >
              {hasNext ? "Next Event" : "Back to first"} <ArrowRight className={`h-4 w-4 ${!hasNext ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const highlights = communityPosts.slice(0, 4);

  return (
    <main className="font-['Nunito',sans-serif]">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-60 -z-10" />
        {/* Soft color washes */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-events/10 via-transparent to-collaboration/10" />
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-events/20 blur-3xl" />
          <div className="absolute top-1/4 -right-24 h-80 w-80 rounded-full bg-collaboration/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-community/20 blur-3xl" />
        </div>

        {/* Floating doodles */}
        <DoodleLightbulb
          className="absolute top-10 right-[8%] w-12 h-12 text-events animate-float opacity-40"
          style={{ "--r": "15deg" }}
        />
        <DoodleRocket
          className="absolute top-1/3 right-[3%] w-10 h-10 text-collaboration animate-float-slow opacity-30"
          style={{ "--r": "-10deg", animationDelay: "1s" }}
        />
        <DoodleStar
          className="absolute bottom-16 right-[12%] w-8 h-8 text-events animate-float opacity-25"
          style={{ "--r": "20deg", animationDelay: "2s" }}
        />
        <DoodleSparkle
          className="absolute top-16 left-[5%] w-8 h-8 text-community animate-float-slow opacity-30"
          style={{ "--r": "-5deg", animationDelay: "0.5s" }}
        />
        <DoodlePalette
          className="absolute bottom-20 left-[8%] w-10 h-10 text-collaboration animate-float opacity-25"
          style={{ "--r": "10deg", animationDelay: "1.5s" }}
        />
        <DoodleWrench
          className="absolute top-1/2 left-[2%] w-9 h-9 text-events animate-float-slow opacity-20"
          style={{ "--r": "-20deg", animationDelay: "3s" }}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32 lg:pt-32 lg:pb-40">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 backdrop-blur px-3 py-1.5 text-xs font-bold text-muted-foreground mb-8 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-events" />
            A student makerspace community ✨
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.02] max-w-5xl">
            Connect.{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-events to-events/70 bg-clip-text text-transparent">
                Create.
              </span>
              {/* Wobbly underline */}
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                <path d="M2 8 C30 2, 60 12, 100 6 S160 2, 198 8" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" className="text-events/50" fill="none" />
              </svg>
            </span>{" "}
            <span className="bg-gradient-to-r from-collaboration to-community bg-clip-text text-transparent">
              Collaborate.
            </span>
          </h1>

          <p className="mt-10 max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
            A warm little corner of the internet where students discover events, find teammates,
            share ideas, and build cool things together. 🛠️
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/events"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-3.5 text-sm font-extrabold shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl"
            >
              Explore Events
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/community"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-border bg-background/70 backdrop-blur px-7 py-3.5 text-sm font-extrabold transition-all hover:bg-background hover:border-foreground/30 hover:-translate-y-1"
            >
              Join Community
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Activity Ticker ───────────────────────────── */}
      <ActivityTicker />

      {/* ── Spaces ───────────────────────────────────── */}
      <section className="bg-background border-t border-border/60 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 font-bold">
                Three spaces, one community
              </p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
                Choose your space 🚪
              </h2>
            </div>
            <p className="max-w-md text-muted-foreground font-medium">
              Each space is a doorway into a different part of the makerspace. Step in wherever you're curious.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {spaces.map((s) => {
              const Icon = s.icon;
              const Doodle = s.doodle;
              return (
                <Link
                  key={s.to}
                  to={s.to}
                  className={`group relative overflow-hidden rounded-3xl border-2 ${s.border} bg-card p-8 min-h-[340px] flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${s.glow}`}
                >
                  {/* Gradient wash */}
                  <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${s.soft} opacity-70 group-hover:opacity-100 transition-opacity`} />
                  {/* Diagonal stripe accent */}
                  <div className={`absolute -top-6 -right-6 w-28 h-28 rounded-full ${s.stripeColor} blur-2xl`} />
                  {/* Doodle decoration */}
                  <Doodle
                    className={`absolute bottom-6 right-6 w-16 h-16 ${s.doodleColor} opacity-10 group-hover:opacity-20 transition-opacity`}
                    style={{}}
                  />

                  {/* Live stat badge */}
                  <div className={`absolute top-5 right-5 inline-flex items-center gap-1 rounded-full ${s.accent} px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide shadow`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
                    {s.stat}
                  </div>

                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${s.accent} shadow-lg`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="mt-4 text-2xl">{s.emoji}</div>
                  <h3 className="mt-2 text-2xl font-extrabold tracking-tight">{s.title}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed flex-1 font-medium">
                    {s.description}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold">
                    Enter {s.title}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Stats — sticky note style ─────────────────── */}
      <section className="bg-muted/30 border-y border-border/60 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-10 font-bold">
            What's happening right now
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { value: 12, label: "Upcoming events", accent: "bg-events/15 border-events/30", num: "text-events", emoji: "🎯", rotate: "-rotate-1" },
              { value: 23, label: "Open collab opportunities", accent: "bg-collaboration/15 border-collaboration/30", num: "text-collaboration", emoji: "🤝", rotate: "rotate-1" },
              { value: 156, label: "Community discussions", accent: "bg-community/15 border-community/30", num: "text-community", emoji: "💬", rotate: "-rotate-1" },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-3xl border-2 ${s.accent} p-8 ${s.rotate} transition-transform hover:rotate-0 hover:scale-105 cursor-default shadow-md`}
              >
                <div className="text-3xl mb-2">{s.emoji}</div>
                <div className={`text-5xl sm:text-6xl font-black tracking-tight ${s.num}`}>
                  <CountUp target={s.value} />+
                </div>
                <div className="mt-3 text-sm text-muted-foreground font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Events ───────────────────────────── */}
      <section className="bg-background relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-25 pointer-events-none" />
        {/* Floating doodles */}
        <DoodleStar className="absolute top-10 right-10 w-10 h-10 text-events animate-float opacity-20" style={{ "--r": "15deg", animationDelay: "1s" }} />
        <DoodleSparkle className="absolute bottom-10 left-8 w-8 h-8 text-community animate-float-slow opacity-15" style={{ "--r": "-5deg" }} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 font-bold">
                Don't miss out ⏰
              </p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Upcoming Events</h2>
            </div>
            <Link to="/events" className="inline-flex items-center gap-2 text-sm font-extrabold hover:underline">
              View all events <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <FeaturedEventCard />
        </div>
      </section>

      {/* ── Community Highlights ──────────────────────── */}
      <section className="bg-muted/30 border-t border-border/60 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-25 pointer-events-none" />
        <DoodleLightbulb className="absolute top-8 right-10 w-10 h-10 text-events animate-float opacity-20" style={{ "--r": "10deg" }} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 font-bold">
                From the community 🌟
              </p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Highlights this week</h2>
            </div>
            <Link to="/community" className="inline-flex items-center gap-2 text-sm font-extrabold hover:underline">
              Browse all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((post, i) => {
              const rotates = ["-rotate-1", "rotate-1", "-rotate-1", "rotate-0"];
              return (
                <Link
                  key={post.id}
                  to={`/community/${post.id}`}
                  className={`group rounded-2xl border-2 border-community/20 bg-card p-6 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-community/40 ${rotates[i]} hover:rotate-0`}
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-community font-extrabold">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {post.category}
                  </div>
                  <h3 className="mt-4 text-base font-bold tracking-tight line-clamp-3 leading-snug">
                    {post.title ?? post.body}
                  </h3>
                  <div className="mt-auto pt-6 flex items-center justify-between text-xs text-muted-foreground font-semibold">
                    <span>{post.author.name}</span>
                    <span>{formatRelativeTime(post.postedAt)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />
        {/* Footer doodles */}
        <DoodleRocket className="absolute top-6 right-[15%] w-10 h-10 text-events animate-float opacity-20" style={{ "--r": "15deg" }} />
        <DoodleStar className="absolute bottom-6 left-[10%] w-8 h-8 text-community animate-float-slow opacity-15" style={{ "--r": "-10deg", animationDelay: "2s" }} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <span className="inline-block h-8 w-8 rounded-xl bg-gradient-to-br from-events via-community to-collaboration shadow-lg" />
                <span className="text-xl font-black tracking-tight">makerspace</span>
              </div>
              <p className="mt-4 max-w-sm text-sm text-background/70 leading-relaxed font-medium">
                A cozy community where students discover, build, and grow together. 🛠️✨
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-background/50 mb-4 font-bold">Explore</p>
              <ul className="space-y-2 text-sm font-semibold">
                <li><a href="#" className="hover:text-events transition-colors">About</a></li>
                <li><a href="#" className="hover:text-events transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-events transition-colors">Community Guidelines</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-background/50 mb-4 font-bold">Social</p>
              <ul className="space-y-2 text-sm font-semibold">
                <li><a href="#" className="hover:text-community transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-community transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-community transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-background/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-background/50 font-semibold">
            <p>© 2026 Makerspace Community</p>
            <p>Built by students, for students. 💙</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
