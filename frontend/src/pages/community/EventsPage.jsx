import { useState } from "react";
import { Link } from "react-router-dom";
import { SectionPage, PushPin } from "@/components/community/SectionPage";
import { EventCard } from "@/components/community/EventCard";
import { events, getEventStatus, formatEventDateShort } from "@/lib/events-data";

const VISIBLE = 6;

function OngoingBanner({ event }) {
  return (
    <div className="relative inline-block mb-6" style={{ transform: "rotate(-2deg)" }}>
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 drop-shadow">
        <PushPin color="#dc2626" size={12} />
      </div>
      <Link
        to={`/community/eventspace/${event.id}`}
        className="block bg-white px-4 py-3 min-w-[200px] transition-transform hover:scale-[1.03]"
        style={{ boxShadow: "3px 4px 14px rgba(0,0,0,0.24)" }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <span className="text-[9px] font-black uppercase tracking-wider text-red-600">Happening now</span>
        </div>
        <p className="text-sm font-bold text-foreground leading-snug">{event.title}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Ends {formatEventDateShort(event.endDate)}</p>
      </Link>
    </div>
  );
}

function MoreStack({ count, onClick }) {
  return (
    <div
      className="relative cursor-pointer select-none pt-4"
      style={{ minHeight: 220 }}
      onClick={onClick}
      title={`Show ${count} more events`}
    >
      {/* Fanned ghost cards behind */}
      <div
        className="absolute inset-x-0 bottom-0 top-4 paper border border-black/8"
        style={{ transform: "rotate(5deg) translateY(6px)", boxShadow: "0 2px 8px rgba(0,0,0,0.09)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 top-4 paper border border-black/8"
        style={{ transform: "rotate(-4deg) translateY(3px)", boxShadow: "0 2px 8px rgba(0,0,0,0.09)" }}
      />
      {/* Pushpin on the stack */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none">
        <div
          className="w-5 h-5 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 30%, #ffd54f, #f57f17)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.3)",
          }}
        />
        <div className="w-0.5 h-2 bg-zinc-400 rounded-b" style={{ marginTop: "-1px" }} />
      </div>
      {/* Front face */}
      <div
        className="relative z-10 paper border border-black/8 h-full flex flex-col items-center justify-center gap-3 py-12"
        style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.11)" }}
      >
        <span className="text-5xl font-black text-events">+{count}</span>
        <span className="text-sm font-bold text-foreground">more events</span>
        <span className="text-xs text-muted-foreground mt-1 px-6 text-center leading-snug">
          Click to unpin and see all
        </span>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? events : events.slice(0, VISIBLE);
  const hidden = events.length - VISIBLE;
  const ongoing = events.find(e => getEventStatus(e) === "ongoing");

  return (
    <SectionPage
      bulletin
      breadcrumb={[{ label: "Home", to: "/" }, { label: "Community", to: "/community" }, { label: "Events" }]}
      eyebrow="01 — Community"
      title="Events"
      description="Discover, register for, and participate in makerspace activities, workshops, competitions, and community events."
      ghostLetter="E"
      tapeColor="rgba(249,115,22,0.78)"
      banner={ongoing ? <OngoingBanner event={ongoing} /> : null}
      stats={[
        { value: events.length, label: "Upcoming events", rotate: 2,    pinColor: "#dc2626" },
        { value: 3,             label: "This week",       rotate: -1.5, pinColor: "#f97316", plus: false },
      ]}
    >
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Upcoming</h2>
        <p className="text-sm text-muted-foreground">{events.length} events</p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((event, i) => (
          <div
            key={event.id}
            className="animate-pin-in"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <EventCard event={event} index={i} />
          </div>
        ))}

        {!expanded && hidden > 0 && (
          <MoreStack count={hidden} onClick={() => setExpanded(true)} />
        )}
      </div>

      {expanded && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setExpanded(false)}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            Collapse
          </button>
        </div>
      )}
    </SectionPage>
  );
}
