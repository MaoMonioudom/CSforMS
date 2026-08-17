import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SectionPage, PushPin } from "@/components/community/SectionPage";
import { EventCard } from "@/components/community/EventCard";
import { fetchEvents, fetchEventsPage, fetchMyEventRegistrations, getEventStatus, formatEventDateShort } from "@/lib/events-data";
import { useAuth } from "@/hub/AuthContext";

const PAGE_SIZE = 12;

const FILTERS = [
  { key: "all",      label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "ongoing",  label: "Ongoing" },
  { key: "ended",    label: "Gallery" },
];

function OngoingBanner({ event }) {
  return (
    <div className="relative inline-block mb-6" style={{ transform: "rotate(-2deg)" }}>
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 drop-shadow">
        <PushPin color="var(--destructive)" size={12} />
      </div>
      <Link
        to={`/community/eventspace/${event.id}`}
        className="block bg-white px-4 py-3 min-w-[200px] transition-transform hover:scale-[1.03]"
        style={{ boxShadow: "3px 4px 14px rgba(0,0,0,0.24)" }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-destructive">Happening now</span>
        </div>
        <p className="text-sm font-bold text-foreground leading-snug">{event.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Ends {formatEventDateShort(event.endDate)}</p>
      </Link>
    </div>
  );
}

function MoreStack({ count, onClick, loading }) {
  return (
    <div
      className="relative cursor-pointer select-none pt-4"
      style={{ minHeight: 220 }}
      onClick={loading ? undefined : onClick}
      title={loading ? "Loading…" : `Show ${count} more events`}
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
            background: "radial-gradient(circle at 35% 30%, var(--community-gold), var(--events))",
            boxShadow: "0 2px 6px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.3)",
          }}
        />
        <div className="w-0.5 h-2 bg-muted-foreground rounded-b" style={{ marginTop: "-1px" }} />
      </div>
      {/* Front face */}
      <div
        className="relative z-10 paper border border-black/8 h-full flex flex-col items-center justify-center gap-3 py-12"
        style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.11)" }}
      >
        <span className="text-5xl font-black text-events">{loading ? "…" : `+${count}`}</span>
        <span className="text-sm font-bold text-foreground">{loading ? "loading" : "more events"}</span>
        <span className="text-xs text-muted-foreground mt-1 px-6 text-center leading-snug">
          {loading ? "Fetching the next batch…" : "Click to unpin and see more"}
        </span>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [registeredIds, setRegisteredIds] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  // Separate from the paginated grid below — the grid only ever holds the
  // pages loaded so far, which isn't enough to say how many events overall
  // are actually upcoming (total from fetchEventsPage counts every event,
  // ended ones included).
  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    fetchEventsPage({ page: 1, limit: PAGE_SIZE })
      .then(({ events, total }) => { setEvents(events); setTotal(total); })
      .catch(() => setError("Couldn't load events — please try refreshing."))
      .finally(() => setLoading(false));
    fetchEvents().then(setAllEvents).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) { setRegisteredIds([]); return; }
    fetchMyEventRegistrations().then(setRegisteredIds).catch(() => {});
  }, [user?.id]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setError("");
    try {
      const nextPage = page + 1;
      const { events: more, total: freshTotal } = await fetchEventsPage({ page: nextPage, limit: PAGE_SIZE });
      setEvents((prev) => [...prev, ...more]);
      setTotal(freshTotal);
      setPage(nextPage);
    } catch {
      setError("Couldn't load more events — please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  const hasMore = events.length < total;
  const ongoingEvents = events.filter(e => getEventStatus(e) === "ongoing");
  const upcomingOnly  = events.filter(e => getEventStatus(e) === "upcoming");
  const endedEvents   = events.filter(e => getEventStatus(e) === "ended");
  const ongoing = ongoingEvents[0];
  // The spotlighted ongoing event above only ever shows one at a time — the
  // filter tabs are what let a second overlapping ongoing event (or past
  // events) actually be reachable instead of silently disappearing. "Ended"
  // exists mainly so people can browse past events and reach their photo
  // galleries (see EventCard's gallery button).
  const visibleEvents = filter === "ongoing" ? ongoingEvents
    : filter === "ended" ? endedEvents
    : filter === "all" ? events
    : upcomingOnly;
  const upcomingCount = allEvents.filter(e => getEventStatus(e) === "upcoming").length;
  const thisWeek = allEvents.filter(e => {
    const days = (new Date(e.date) - new Date()) / 86400000;
    return days >= 0 && days <= 7;
  }).length;

  return (
    <SectionPage
      bulletin
      breadcrumb={[{ label: "Home", to: "/" }, { label: "Community", to: "/community" }, { label: "Events" }]}
      eyebrow="01 — Community"
      title="Events"
      description="Discover, register for, and participate in makerspace activities, workshops, competitions, and community events."
      tapeColor="color-mix(in oklch, var(--events) 78%, transparent)"
      banner={ongoing ? <OngoingBanner event={ongoing} /> : null}
      stats={[
        { value: upcomingCount, label: "Upcoming events", rotate: 2,    pinColor: "var(--destructive)" },
        { value: thisWeek, label: "This week",       rotate: -1.5, pinColor: "var(--events)", plus: false },
      ]}
    >
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`chip ${
              filter === f.key
                ? "border-events bg-events text-events-foreground"
                : "border-transparent bg-black/5 text-muted-foreground hover:bg-black/10"
            }`}
          >
            {f.label}
            {f.key === "ongoing" && ongoingEvents.length > 0 && (
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-xs font-bold text-destructive-foreground">
                {ongoingEvents.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          {filter === "ongoing" ? "Ongoing" : filter === "ended" ? "Ended" : filter === "all" ? "All events" : "Upcoming"}
        </h2>
        <p className="text-sm text-muted-foreground">{visibleEvents.length} events</p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading events…</p>
      ) : visibleEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {filter === "ongoing"
            ? "Nothing happening right now — check back soon."
            : filter === "ended"
            ? "No ended events yet."
            : filter === "all"
            ? "No events yet — check back soon."
            : "No upcoming events yet — check back soon."}
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {visibleEvents.map((event, i) => (
            <div
              key={event.id}
              className="animate-pin-in"
              style={{ animationDelay: `${(i % PAGE_SIZE) * 70}ms` }}
            >
              <EventCard event={event} index={i} registered={registeredIds.includes(event.id)} />
            </div>
          ))}

          {hasMore && (
            <MoreStack count={total - events.length} onClick={handleLoadMore} loading={loadingMore} />
          )}
        </div>
      )}
    </SectionPage>
  );
}
