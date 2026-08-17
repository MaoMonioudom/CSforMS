import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Camera } from "lucide-react";
import { formatEventDate, getEventStatus } from "@/lib/events-data";
import { Button } from "@/components/community/ui/button";

const tilts = [-1.5, 0.8, -0.6, 1.2, -1, 0.5, 1.5, -0.4];

const paperShadow = "0 2px 4px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.11)";
const paperShadowHover = "0 8px 12px rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.14)";

function Pushpin() {
  return (
    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none">
      <div
        className="w-5 h-5 rounded-full shadow-md"
        style={{
          background: "radial-gradient(circle at 35% 30%, color-mix(in oklch, var(--events) 55%, white), var(--events))",
          boxShadow: "0 2px 6px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.3)",
        }}
      />
      <div className="w-0.5 h-2 bg-muted-foreground rounded-b" style={{ marginTop: "-1px" }} />
    </div>
  );
}

export function EventCard({ event, index = 0, registered = false }) {
  const rotate = tilts[index % tilts.length];
  const status = getEventStatus(event);
  const isFull = event.capacity > 0 && event.participants >= event.capacity;
  const canRegister = status === "upcoming" && !isFull && !registered;
  const hasGallery = status === "ended" && !!event.galleryUrl;

  // The card is one big <Link> to the detail page — an external-link event's
  // Register button needs to open that link directly instead, so it stops
  // the click from also navigating into the card (can't nest an <a> inside
  // the outer <Link>'s <a>, hence window.open rather than a real anchor).
  const handleRegisterClick = (e) => {
    if (canRegister && event.registrationUrl) {
      e.preventDefault();
      e.stopPropagation();
      window.open(event.registrationUrl, "_blank", "noopener,noreferrer");
    } else if (hasGallery) {
      e.preventDefault();
      e.stopPropagation();
      window.open(event.galleryUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className="relative pt-4"
      style={{
        transform: `rotate(${rotate}deg)`,
        transition: "transform 0.3s cubic-bezier(0.34,1.2,0.64,1)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "rotate(0deg) translateY(-6px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = `rotate(${rotate}deg)`; }}
    >
      <Pushpin />
    <Link
      to={`/community/eventspace/${event.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col overflow-hidden rounded-none text-card-foreground paper"
      style={{
        boxShadow: paperShadow,
        transition: "box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = paperShadowHover; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = paperShadow; }}
    >
      {/* Colored header band — like a flyer's title strip */}
      <div className="h-2 bg-events w-full shrink-0" />

      {/* Image */}
      <div className="relative aspect-[2/1] overflow-hidden bg-muted">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        {status === "ongoing" ? (
          <div className="badge absolute left-3 top-3 bg-red-600 text-white shadow">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            Ongoing
          </div>
        ) : (
          <div className="badge absolute left-3 top-3 bg-events text-events-foreground shadow">
            <Calendar className="size-3.5" />
            {formatEventDate(event.date)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-extrabold tracking-tight leading-snug">{event.title}</h3>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
          <MapPin className="size-4 shrink-0" />
          {event.location}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{event.shortDescription}</p>

        {/* Capacity bar */}
        <div className="mt-1">
          <div className="flex justify-between text-xs text-muted-foreground mb-1 font-semibold">
            <span>{event.participants} joined</span>
            <span>{Math.max(0, event.capacity - event.participants)} left</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-black/8 overflow-hidden">
            <div
              className="h-full rounded-full bg-events"
              style={{ width: `${event.capacity ? Math.min(100, (event.participants / event.capacity) * 100) : 0}%` }}
            />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-black/6">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
            <Users className="size-4" />
            <span>
              <span className="font-bold text-foreground">{event.participants}</span>
              {" "}/ {event.capacity}
            </span>
          </div>
          <Button
            onClick={handleRegisterClick}
            disabled={!hasGallery && (registered || status !== "upcoming" || isFull)}
            className={status === "upcoming" && !isFull && !registered
              ? "btn-primary bg-events text-events-foreground hover:bg-events/90 shadow-sm"
              : registered
              ? "btn-secondary border-events text-events bg-transparent shadow-sm"
              : hasGallery
              ? "btn-secondary border-events text-events bg-transparent shadow-sm hover:bg-events/10"
              : "btn-primary bg-muted text-muted-foreground shadow-sm"}
          >
            {registered
              ? "Registered"
              : status === "ongoing"
              ? "Ongoing"
              : hasGallery
              ? <span className="inline-flex items-center gap-1"><Camera className="size-3.5" /> Gallery ↗</span>
              : status === "ended"
              ? "Ended"
              : isFull
              ? "Full"
              : canRegister && event.registrationUrl
              ? "Register ↗"
              : "Register"}
          </Button>
        </div>
      </div>
    </Link>
    </div>
  );
}
