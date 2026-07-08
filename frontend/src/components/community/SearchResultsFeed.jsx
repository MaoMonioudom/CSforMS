import { useEffect, useRef, useState } from "react";
import { EventCard } from "./EventCard";
import { CollabCard } from "./CollabCard";
import { CommunityPostCard } from "./CommunityPostCard";

const BATCH_SIZE = 6;
const LOAD_DELAY = 350; // ms — small simulated-load feel, like a real feed fetching more

const GRID_CLASS = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-14 items-start";

function ResultCard({ r, i }) {
  if (r.type === "event")  return <EventCard event={r.item} index={i} />;
  if (r.type === "collab") return <CollabCard post={r.item} index={i} />;
  return <CommunityPostCard post={r.item} index={i} />;
}

// Relevance-ranked grid mixing Events / Find Team / Connect results. Reuses
// each section's own real card component untouched (same tilt, pushpin, and
// color treatment as their listing pages) so results don't look like a
// bolted-on fourth design. When strict title matches are sparse, a broader
// "You might also like" section fills in below so the grid doesn't look empty.
export function SearchResultsFeed({ results, query, suggestions = [] }) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [query]);

  const hasMore = visibleCount < results.length;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((v) => Math.min(v + BATCH_SIZE, results.length));
            setLoadingMore(false);
          }, LOAD_DELAY);
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, results.length]);

  if (results.length === 0) {
    return (
      <div className="flex flex-col gap-10 pb-10">
        <div className="mx-auto max-w-xl text-center py-16">
          <p className="text-2xl font-bold text-foreground mb-2">No results for &ldquo;{query}&rdquo;</p>
          <p className="text-muted-foreground">
            Try a different keyword, or browse Events, Find Team, or Connect directly.
          </p>
        </div>

        {suggestions.length > 0 && (
          <div className="flex flex-col gap-6">
            <p className="text-sm text-muted-foreground font-semibold">You might also like</p>
            <div className={GRID_CLASS}>
              {suggestions.map((r, i) => (
                <ResultCard key={`s-${r.type}-${r.item.id}`} r={r} i={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const visible = results.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <p className="text-sm text-muted-foreground font-semibold">
        {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
      </p>

      <div className={GRID_CLASS}>
        {visible.map((r, i) => (
          <ResultCard key={`r-${r.type}-${r.item.id}`} r={r} i={i} />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
            Loading more…
          </span>
        </div>
      )}

      {!hasMore && suggestions.length > 0 && (
        <div className="flex flex-col gap-6 mt-4 pt-8 border-t border-black/10">
          <p className="text-sm text-muted-foreground font-semibold">You might also like</p>
          <div className={GRID_CLASS}>
            {suggestions.map((r, i) => (
              <ResultCard key={`s-${r.type}-${r.item.id}`} r={r} i={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
