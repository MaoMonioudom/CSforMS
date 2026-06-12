import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { categoryEmoji, formatRelativeTime } from "@/lib/community-data";

const paperShadow = "0 2px 4px rgba(0,0,0,0.07), 0 6px 20px rgba(0,0,0,0.09)";

export function CommunityPostCard({ post }) {
  return (
    <article
      className="group overflow-hidden rounded-2xl paper text-card-foreground"
      style={{ boxShadow: paperShadow }}
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
        <img
          src={post.author.avatar}
          alt={post.author.name}
          className="size-9 shrink-0 rounded-full object-cover ring-2 ring-community/20"
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
  );
}
