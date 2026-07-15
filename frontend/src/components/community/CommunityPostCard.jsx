import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { categoryEmoji, formatRelativeTime } from "@/lib/community-data";
import { InitialAvatar } from "@/components/community/InitialAvatar";

const tilts = [-0.8, 1, -1.3, 0.6, 1.2, -0.5, 0.9, -1.1];
const paperShadow = "0 2px 4px rgba(0,0,0,0.07), 0 6px 20px rgba(0,0,0,0.09)";
const paperShadowHover = "0 8px 12px rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.14)";

function Pushpin() {
  return (
    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none">
      <div
        className="w-5 h-5 rounded-full"
        style={{
          background: "radial-gradient(circle at 35% 30%, #ce93d8, #6a1b9a)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.3)",
        }}
      />
      <div className="w-0.5 h-2 bg-zinc-400 rounded-b" style={{ marginTop: "-1px" }} />
    </div>
  );
}

export function CommunityPostCard({ post, index = 0 }) {
  const rotate = tilts[index % tilts.length];

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
    <article
      className="group overflow-hidden rounded-none paper text-card-foreground"
      style={{ boxShadow: paperShadow, transition: "box-shadow 0.3s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = paperShadowHover; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = paperShadow; }}
    >
      {/* Sticky-note header — colored band with category */}
      <div className="bg-community px-5 py-3 flex items-center gap-2 shrink-0">
        <span className="text-base">{categoryEmoji[post.category]}</span>
        <span className="text-xs font-extrabold text-community-foreground uppercase tracking-wider">
          {post.category}
        </span>
      </div>

      {/* Author row */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <InitialAvatar
          name={post.author.name}
          src={post.author.avatar}
          className="size-9 shrink-0 ring-2 ring-community/20 text-sm"
        />
        <div className="min-w-0">
          <p className="text-sm font-extrabold leading-tight">{post.author.name}</p>
          <p className="text-xs text-muted-foreground">{post.author.handle} · {formatRelativeTime(post.postedAt)}</p>
        </div>
      </div>

      {/* Content */}
      <Link to={`/community/${post.id}`} className="block px-5 pb-4">
        {post.title && (
          <h3 className="text-base font-extrabold leading-snug tracking-tight group-hover:text-community transition-colors mb-2">
            {post.title}
          </h3>
        )}
        <p className="line-clamp-3 text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
          {post.body}
        </p>
        {post.image && (
          <div className="mt-3 overflow-hidden rounded-xl">
            <img
              src={post.image}
              alt=""
              className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        )}
        {post.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <span key={t} className="text-xs text-muted-foreground font-medium">#{t}</span>
            ))}
          </div>
        )}
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-1 border-t border-black/6 px-3 py-2 text-sm text-muted-foreground">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold transition-colors hover:bg-community/10 hover:text-community"
        >
          <Heart className="size-4" /> {post.likes}
        </button>
        <Link
          to={`/community/${post.id}`}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold transition-colors hover:bg-community/10 hover:text-community"
        >
          <MessageCircle className="size-4" /> {post.comments.length}
        </Link>
        <button
          type="button"
          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold transition-colors hover:bg-community/10 hover:text-community"
        >
          <Share2 className="size-4" />
        </button>
      </div>
    </article>
    </div>
  );
}
