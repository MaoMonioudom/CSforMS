import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { collabTypeEmoji, collabTypeLabel, formatRelativeTime } from "@/lib/collaboration-data";

const tilts = [1, -1.2, 0.6, -0.8, 1.4, -0.5, 1, -1.5];

const paperShadow = "0 2px 4px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.11)";
const paperShadowHover = "0 8px 12px rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.14)";

export function CollabCard({ post, index = 0 }) {
  const rotate = tilts[index % tilts.length];

  return (
    <Link
      to={`/collaboration/${post.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl paper text-card-foreground"
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
      {/* Colored header band — signup sheet style */}
      <div className="bg-collaboration px-5 py-3 flex items-center gap-2 shrink-0">
        <span className="text-lg">{collabTypeEmoji[post.type]}</span>
        <span className="text-sm font-extrabold text-collaboration-foreground tracking-wide">
          {collabTypeLabel[post.type]}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-extrabold tracking-tight leading-snug">{post.projectTitle}</h3>

        {/* Roles needed */}
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Looking for</p>
          <div className="flex flex-wrap gap-1.5">
            {post.rolesNeeded.map((role) => (
              <span
                key={role}
                className="rounded-full bg-collaboration/12 border border-collaboration/25 px-2.5 py-0.5 text-xs font-semibold text-foreground"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Category */}
        <span className="inline-block w-fit rounded-full bg-black/6 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {post.category}
        </span>

        {/* Author */}
        <div className="mt-auto flex items-center gap-2.5 border-t border-black/6 pt-4">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="size-8 rounded-full object-cover ring-2 ring-collaboration/20"
          />
          <div className="text-xs leading-tight">
            <p className="font-bold text-foreground">{post.author.name}</p>
            <p className="text-muted-foreground">{formatRelativeTime(post.postedAt)}</p>
          </div>
          <div className="ml-auto inline-flex items-center gap-1 text-xs font-extrabold text-collaboration group-hover:gap-2 transition-all">
            View <ArrowRight className="size-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
