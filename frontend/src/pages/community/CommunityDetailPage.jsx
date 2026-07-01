import { Link, useParams } from "react-router-dom";
import { ChevronRight, Heart, MessageCircle, Share2 } from "lucide-react";
import { categoryEmoji, formatRelativeTime, getCommunityPostById } from "@/lib/community-data";
import { Button } from "@/components/community/ui/button";

export default function CommunityDetailPage() {
  const { postId } = useParams();
  const post = getCommunityPostById(postId);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold">Post not found</h1>
        <p className="mt-2 text-muted-foreground">
          This community post doesn't exist or has been removed.
        </p>
        <Link to="/community/communityspace" className="mt-6 inline-block text-community underline">
          Back to community
        </Link>
      </div>
    );
  }

  return (
    <main className="bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="size-3.5 shrink-0 opacity-40" />
          <Link to="/community/communityspace" className="hover:text-foreground transition-colors">Community</Link>
          <ChevronRight className="size-3.5 shrink-0 opacity-40" />
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-sm">
            {post.title ?? post.body.slice(0, 40) + "…"}
          </span>
        </nav>
        <article className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="size-12 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold">{post.author.name}</p>
              <p className="text-xs text-muted-foreground">
                {post.author.handle} · {formatRelativeTime(post.postedAt)}
              </p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-community/10 px-2.5 py-1 text-xs font-medium text-community">
              <span>{categoryEmoji[post.category]}</span> {post.category}
            </span>
          </div>
          {post.title && (
            <h1 className="mt-6 text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
              {post.title}
            </h1>
          )}
          <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground/90">
            {post.body}
          </p>
          {post.image && (
            <div className="mt-5 overflow-hidden rounded-xl border border-border">
              <img src={post.image} alt="" className="w-full object-cover" />
            </div>
          )}
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <span key={t} className="text-xs text-muted-foreground">
                  #{t}
                </span>
              ))}
            </div>
          )}
          <div className="mt-6 flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors hover:bg-community/10 hover:text-community"
            >
              <Heart className="size-4" /> {post.likes} likes
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5">
              <MessageCircle className="size-4" /> {post.comments.length} comments
            </span>
            <button
              type="button"
              className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors hover:bg-community/10 hover:text-community"
            >
              <Share2 className="size-4" /> Share
            </button>
          </div>
        </article>
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Comments</h2>
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
            <img
              src="https://i.pravatar.cc/120?u=you"
              alt=""
              className="size-9 rounded-full object-cover"
            />
            <textarea
              placeholder="Write a comment…"
              className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-community"
              rows={2}
            />
            <Button className="bg-community text-community-foreground hover:opacity-90">
              Reply
            </Button>
          </div>
          <ul className="mt-5 space-y-4">
            {post.comments.length === 0 ? (
              <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No comments yet — be the first to chime in.
              </li>
            ) : (
              post.comments.map((c) => (
                <li key={c.id} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                  <img
                    src={c.author.avatar}
                    alt={c.author.name}
                    className="size-9 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold">{c.author.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(c.postedAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground/90">{c.body}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </main>
  );
}
