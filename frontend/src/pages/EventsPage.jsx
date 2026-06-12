import { SectionPage } from "@/components/SectionPage";
import { EventCard } from "@/components/events/EventCard";
import { events } from "@/lib/events-data";

export default function EventsPage() {
  return (
    <SectionPage
      tone="events"
      eyebrow="01 — Community"
      title="Events"
      description="Discover, register for, and participate in makerspace activities, workshops, competitions, and community events."
    >
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Upcoming</h2>
        <p className="text-sm text-muted-foreground">{events.length} events</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event, i) => (
          <EventCard key={event.id} event={event} index={i} />
        ))}
      </div>
    </SectionPage>
  );
}
