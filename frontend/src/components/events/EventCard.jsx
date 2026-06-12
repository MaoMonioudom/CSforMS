import { Link } from "react-router-dom";
import { Calendar, MapPin, Users } from "lucide-react";
import { formatEventDate } from "@/lib/events-data";
import { Button } from "@/components/ui/button";

const tilts = [-1.5, 0.8, -0.6, 1.2, -1, 0.5, 1.5, -0.4];

const paperShadow = "0 2px 4px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.11)";
const paperShadowHover = "0 8px 12px rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.14)";

export function EventCard({ event, index = 0 }) {
  const rotate = tilts[index % tilts.length];

  return (
    <Link
      to={`/events/${event.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl text-card-foreground paper"
      style={{
        transform: `rotate(${rotate}deg)`,
        boxShadow: paperShadow,
        transition: "transform 0.3s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "rotate(0deg) translateY(-6px)";
        e.currentTarget.style.boxShadow = paperShadowHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `rotate(${rotate}deg)`;
        e.currentTarget.style.boxShadow = paperShadow;
      }}
    >
      {/* Colored header band — like a flyer's title strip */}
      <div className="h-2 bg-events w-full shrink-0" />

      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-events px-3 py-1 text-xs font-bold text-events-foreground shadow">
          <Calendar className="size-3.5" />
          {formatEventDate(event.date)}
        </div>
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
            <span>{event.capacity - event.participants} left</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-black/8 overflow-hidden">
            <div
              className="h-full rounded-full bg-events"
              style={{ width: `${(event.participants / event.capacity) * 100}%` }}
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
            size="sm"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="rounded-full bg-events text-events-foreground hover:bg-events/90 font-bold shadow-sm"
          >
            Register
          </Button>
        </div>
      </div>
    </Link>
  );
}
