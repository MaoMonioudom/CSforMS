import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, Mail, MessageCircle, Send, Users } from "lucide-react";
import {
  collabTypeLabel,
  formatRelativeTime,
  fetchCollabPostById,
} from "@/lib/collaboration-data";
import { Button } from "@/components/community/ui/button";
import { InitialAvatar } from "@/components/community/InitialAvatar";

export default function CollabDetailPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoading(true);
    setLoadFailed(false);
    fetchCollabPostById(postId)
      .then(setPost)
      .catch((err) => {
        setPost(null);
        if (err.status !== 404) setLoadFailed(true);
      })
      .finally(() => setLoading(false));
  }, [postId]);

  if (loading) {
    return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-muted-foreground">Loading…</div>;
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold">{loadFailed ? "Couldn't load this post" : "Post not found"}</h1>
        <p className="mt-2 text-muted-foreground">
          {loadFailed
            ? "Something went wrong loading this page — please try again."
            : "This collaboration post doesn't exist or has been removed."}
        </p>
        <Link to="/community/collabspace" className="mt-6 inline-block text-collaboration underline">
          Back to collaboration
        </Link>
      </div>
    );
  }

  const pct = post.teamSize.target ? Math.min(100, Math.round((post.teamSize.current / post.teamSize.target) * 100)) : 0;
  const spotsOpen = Math.max(0, post.teamSize.target - post.teamSize.current);

  return (
    <main className="bg-background">
      <div className="bg-collaboration/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-5 pb-12">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="size-3.5 shrink-0 opacity-40" />
            <Link to="/community" className="hover:text-foreground transition-colors">Community</Link>
            <ChevronRight className="size-3.5 shrink-0 opacity-40" />
            <Link to="/community/collabspace" className="hover:text-foreground transition-colors">Find Team</Link>
            <ChevronRight className="size-3.5 shrink-0 opacity-40" />
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-sm">{post.projectTitle}</span>
          </nav>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-collaboration px-3 py-1 text-xs font-semibold text-collaboration-foreground">
              {collabTypeLabel[post.type]}
            </span>
            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              {post.category}
            </span>
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
            {post.projectTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{post.shortPitch}</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 lg:grid-cols-3">
          <article className="lg:col-span-2 space-y-10">
            <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
              <InitialAvatar name={post.author.name} src={post.author.avatar} className="size-12 text-lg" />
              <div>
                <p className="text-sm font-semibold">{post.author.name}</p>
                <p className="text-xs text-muted-foreground">
                  {post.author.year} · {post.author.major} · {formatRelativeTime(post.postedAt)}
                </p>
              </div>
            </div>
            <section>
              <h2 className="text-xl font-semibold">About the project</h2>
              <p className="mt-3 text-base leading-relaxed text-foreground/90">{post.description}</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold">Roles needed</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {post.rolesNeeded.map((role) => (
                  <span
                    key={role}
                    className="rounded-lg border border-collaboration/30 bg-collaboration/10 px-3 py-1.5 text-sm font-medium text-collaboration"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-xl font-semibold">Skills & tech</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {post.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    #{s}
                  </span>
                ))}
              </div>
            </section>
          </article>
          <aside className="lg:sticky lg:top-24 h-fit space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Team size</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-semibold">{post.teamSize.current}</span>
                <span className="text-sm text-muted-foreground">/ {post.teamSize.target} members</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-collaboration transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                {spotsOpen} spot{spotsOpen === 1 ? "" : "s"} open
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Contact</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Reach out directly to {post.author.name.split(" ")[0]}.
              </p>
              <div className="mt-4 space-y-2">
                <a
                  href={`mailto:${post.contact.email}`}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:border-collaboration hover:text-collaboration"
                >
                  <Mail className="size-4" />
                  <span className="truncate">{post.contact.email}</span>
                </a>
                {post.contact.discord && (
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium">
                    <MessageCircle className="size-4" />
                    <span className="truncate">{post.contact.discord}</span>
                  </div>
                )}
                {post.contact.telegram && (
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium">
                    <Send className="size-4" />
                    <span className="truncate">{post.contact.telegram}</span>
                  </div>
                )}
              </div>
              <Button
                className="mt-5 w-full bg-collaboration text-collaboration-foreground hover:bg-collaboration/90"
                asChild
              >
                <a href={`mailto:${post.contact.email}`}>Send an email</a>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
