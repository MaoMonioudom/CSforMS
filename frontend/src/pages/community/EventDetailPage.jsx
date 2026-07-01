import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, Calendar, MapPin, Users } from "lucide-react";
import { getEventById, formatEventDate } from "@/lib/events-data";
import { Button } from "@/components/community/ui/button";

export default function EventDetailPage() {
  const { eventId } = useParams();
  const event = getEventById(eventId);

  const [registered, setRegistered] = useState(false);

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold">Event not found</h1>
        <p className="mt-2 text-muted-foreground">This event doesn't exist or has been removed.</p>
        <Link to="/community/eventspace" className="mt-6 inline-block text-events underline">
          Back to all events
        </Link>
      </div>
    );
  }

  const participants = event.participants + (registered ? 1 : 0);
  const pct = Math.min(100, Math.round((participants / event.capacity) * 100));

  return (
    <main className="bg-background">
      {/* Hero image — breadcrumb floats over the top of the image */}
      <div className="relative h-[40vh] min-h-[240px] w-full overflow-hidden">
        <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
        {/* Bottom fade to page background */}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
        {/* Top dark veil so breadcrumb text stays readable over any image */}
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-transparent" />
        {/* Breadcrumb overlaid on top of image */}
        <nav
          aria-label="Breadcrumb"
          className="absolute top-4 left-0 right-0 z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 text-sm text-white/75 flex-wrap"
        >
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="size-3.5 shrink-0 opacity-50" />
          <Link to="/community/eventspace" className="hover:text-white transition-colors">Events</Link>
          <ChevronRight className="size-3.5 shrink-0 opacity-50" />
          <span className="text-white font-medium truncate max-w-[200px] sm:max-w-sm">{event.title}</span>
        </nav>
      </div>

      <div className="mx-auto -mt-20 max-w-6xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="mt-6 grid gap-10 lg:grid-cols-3">
          <article className="lg:col-span-2">
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-events/15 px-3 py-1 text-xs font-medium text-events"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
              {event.title}
            </h1>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-4" /> {formatEventDate(event.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" /> {event.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4" /> {participants} attending
              </span>
            </div>
            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border p-4">
              <img
                src={event.author.avatar}
                alt={event.author.name}
                className="size-12 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold">{event.author.name}</p>
                <p className="text-xs text-muted-foreground">{event.author.role}</p>
              </div>
            </div>
            <div className="prose prose-neutral mt-8 max-w-none">
              <h2 className="text-xl font-semibold">About this event</h2>
              <p className="mt-3 text-base leading-relaxed text-foreground/90">{event.description}</p>
            </div>
          </article>
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Registration</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-semibold">{participants}</span>
                <span className="text-sm text-muted-foreground">/ {event.capacity} spots</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-events transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <Button
                className="mt-5 w-full bg-events text-events-foreground hover:bg-events/90"
                disabled={registered}
                onClick={() => setRegistered(true)}
              >
                {registered ? "Registered ✓" : "Register for this event"}
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">Demo only — not yet persisted.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
