import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Mail, MessageCircle, Send, Users, Lock, LockOpen, Copy, Check } from "lucide-react";
import {
  collabTypeLabel,
  formatRelativeTime,
  fetchCollabPostById,
  updateCollabPostStatus,
} from "@/lib/collaboration-data";
import { Button } from "@/components/community/ui/button";
import { InitialAvatar } from "@/components/community/InitialAvatar";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useAuth } from "@/hub/AuthContext";

export default function CollabDetailPage() {
  const { postId } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = async (field, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField((f) => (f === field ? null : f)), 1500);
    } catch {
      // Clipboard access denied/unavailable: nothing to fall back to here,
      // the field itself is still visible for the user to copy by hand.
    }
  };

  const handleToggleStatus = async () => {
    if (togglingStatus) return;
    setTogglingStatus(true);
    try {
      const nextStatus = post.status === "closed" ? "open" : "closed";
      const status = await updateCollabPostStatus(post.id, nextStatus);
      setPost((p) => ({ ...p, status }));
    } catch {
      // Leave the button clickable so the user can retry.
    } finally {
      setTogglingStatus(false);
    }
  };

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
        <h1 className="text-4xl font-semibold">{loadFailed ? "Couldn't load this post" : "Post not found"}</h1>
        <p className="mt-2 text-muted-foreground">
          {loadFailed
            ? "Something went wrong loading this page. Please try again."
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
          <Breadcrumb className="mb-6" items={[
            { label: "Home", to: "/" },
            { label: "Community", to: "/community" },
            { label: "Find Team", to: "/community/collabspace" },
            { label: post.projectTitle },
          ]} />
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="badge bg-collaboration text-collaboration-foreground">
              {collabTypeLabel[post.type]}
            </span>
            <span className="badge border border-border bg-background text-muted-foreground">
              {post.category}
            </span>
            {post.status === "closed" && (
              <span className="badge bg-muted text-muted-foreground">Closed</span>
            )}
            {user?.id === post.ownerId && (
              <Button
                type="button"
                variant="outline"
                className="btn-secondary ml-auto"
                onClick={handleToggleStatus}
                disabled={togglingStatus}
              >
                {post.status === "closed"
                  ? <><LockOpen className="size-3.5" /> Reopen post</>
                  : <><Lock className="size-3.5" /> Close post</>}
              </Button>
            )}
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            {post.projectTitle}
          </h1>
          {post.shortPitch && (
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{post.shortPitch}</p>
          )}
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
            {post.rolesNeeded.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold">Roles needed</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.rolesNeeded.map((role) => (
                    <span
                      key={role}
                      className="badge border border-collaboration/30 bg-collaboration/10 text-collaboration"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </section>
            )}
            {post.skills.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold">Skills & tech</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.skills.map((s) => (
                    <span
                      key={s}
                      className="badge badge-sm bg-muted text-muted-foreground"
                    >
                      #{s}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </article>
          <aside className="lg:sticky lg:top-24 h-fit space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Team size</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-semibold">{post.teamSize.current}</span>
                {post.teamSize.target ? (
                  <span className="text-sm text-muted-foreground">/ {post.teamSize.target} members</span>
                ) : (
                  <span className="text-sm text-muted-foreground">member{post.teamSize.current === 1 ? "" : "s"}</span>
                )}
              </div>
              {post.teamSize.target ? (
                <>
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
                </>
              ) : (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="size-3.5" />
                  Looking to join an existing team
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Contact</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Click to copy and reach out directly to the poster.
              </p>
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => handleCopy("email", post.contact.email)}
                  className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:border-collaboration hover:text-collaboration"
                >
                  <Mail className="size-4 shrink-0" />
                  <span className="truncate flex-1 text-left">{post.contact.email}</span>
                  {copiedField === "email"
                    ? <Check className="size-4 shrink-0 text-collaboration" />
                    : <Copy className="size-4 shrink-0 text-muted-foreground" />}
                </button>
                {post.contact.discord && (
                  <button
                    type="button"
                    onClick={() => handleCopy("discord", post.contact.discord)}
                    className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:border-collaboration hover:text-collaboration"
                  >
                    <MessageCircle className="size-4 shrink-0" />
                    <span className="truncate flex-1 text-left">{post.contact.discord}</span>
                    {copiedField === "discord"
                      ? <Check className="size-4 shrink-0 text-collaboration" />
                      : <Copy className="size-4 shrink-0 text-muted-foreground" />}
                  </button>
                )}
                {post.contact.telegram && (
                  <button
                    type="button"
                    onClick={() => handleCopy("telegram", post.contact.telegram)}
                    className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:border-collaboration hover:text-collaboration"
                  >
                    <Send className="size-4 shrink-0" />
                    <span className="truncate flex-1 text-left">{post.contact.telegram}</span>
                    {copiedField === "telegram"
                      ? <Check className="size-4 shrink-0 text-collaboration" />
                      : <Copy className="size-4 shrink-0 text-muted-foreground" />}
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
