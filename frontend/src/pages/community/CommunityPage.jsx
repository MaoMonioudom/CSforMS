import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Pencil } from "lucide-react";
import { SectionPage } from "@/components/community/SectionPage";
import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { fetchCommunityPostsPage, createCommunityPost, toggleLike } from "@/lib/community-data";
import { useAuth } from "@/hub/AuthContext";
import { Button } from "@/components/community/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/community/ui/dialog";
import { Input } from "@/components/community/ui/input";
import { Label } from "@/components/community/ui/label";
import { TagsInput } from "@/components/community/TagsInput";
import { InitialAvatar } from "@/components/community/InitialAvatar";

const filters = ["All", "Technical", "Showcase", "Question", "Social", "Announcement"];
const categories = filters.slice(1);
const PAGE_SIZE = 12;

function CreatePostDialog({ open, onOpenChange, onCreated }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tags, setTags] = useState([]);
  const formRef = useRef(null);

  const closeAndReset = () => {
    formRef.current?.reset();
    setTags([]);
    onOpenChange(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const form = new FormData(e.target);
    const content = form.get("content")?.trim();
    if (!content) {
      setError("Say something before posting.");
      return;
    }
    const payload = {
      title: form.get("title")?.trim() || null,
      content,
      category: form.get("category") || categories[0],
      tags,
    };

    setSubmitting(true);
    try {
      const created = await createCommunityPost(payload);
      onCreated(created);
      closeAndReset();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share something with the community</DialogTitle>
          <DialogDescription>
            Ask a question, show off a project, or just say hi.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="category" className="mb-1.5 block">Category</Label>
            <select
              id="category"
              name="category"
              defaultValue={categories[0]}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="title" className="mb-1.5 block">Title (optional)</Label>
            <Input id="title" name="title" placeholder="Give it a headline" />
          </div>
          <div>
            <Label htmlFor="content" className="mb-1.5 block">What's on your mind?</Label>
            <textarea
              id="content"
              name="content"
              required
              rows={5}
              placeholder="Share the details…"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Tags</Label>
            <TagsInput value={tags} onChange={setTags} noun="tag" />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeAndReset}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-community text-community-foreground hover:opacity-90"
            >
              {submitting ? "Posting…" : "Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CommunityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [communityPosts, setCommunityPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetchCommunityPostsPage({ page: 1, limit: PAGE_SIZE })
      .then(({ posts, total }) => { setCommunityPosts(posts); setTotal(total); })
      .catch(() => setError("Couldn't load posts — please try refreshing."))
      .finally(() => setLoading(false));
  }, []);

  // Resumes the compose dialog after a login redirect (see
  // handleComposeClick) instead of just dropping the user back on the feed
  // with no memory of what they clicked.
  useEffect(() => {
    if (user && location.state?.reopen === "compose") setOpen(true);
  }, [user, location.state]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setError("");
    try {
      const nextPage = page + 1;
      const { posts: more, total: freshTotal } = await fetchCommunityPostsPage({ page: nextPage, limit: PAGE_SIZE });
      setCommunityPosts((prev) => [...prev, ...more]);
      setTotal(freshTotal);
      setPage(nextPage);
    } catch {
      setError("Couldn't load more posts — please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleComposeClick = () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname, reopen: "compose" } });
      return;
    }
    setOpen(true);
  };

  // Optimistic toggle — flips local state immediately so the click feels
  // instant, then reconciles with the server's real count/state. Rolls back
  // to the pre-click snapshot on failure rather than trusting the optimistic
  // guess.
  const handleToggleLike = async (postId) => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    const snapshot = communityPosts;
    setCommunityPosts(posts => posts.map(p =>
      p.id === postId ? { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) } : p
    ));
    try {
      const { likes, likedByMe } = await toggleLike(postId);
      setCommunityPosts(posts => posts.map(p => p.id === postId ? { ...p, likes, likedByMe } : p));
    } catch {
      setCommunityPosts(snapshot);
    }
  };

  const hasMore = communityPosts.length < total;
  // Filtering only looks at posts already loaded — if a rare category has
  // matches sitting on a later page, "Load more" first, same as the
  // unfiltered feed.
  const visiblePosts = activeFilter === "All"
    ? communityPosts
    : communityPosts.filter(p => p.category === activeFilter);

  // There's no per-user activity tracking in the DB, so "active users
  // today" isn't something we can honestly compute — this counts real
  // posts made today instead, off what's loaded (newest-first) so far.
  const postsToday = communityPosts.filter(p => {
    const days = (Date.now() - new Date(p.postedAt).getTime()) / 86400000;
    return days >= 0 && days < 1;
  }).length;

  return (
    <SectionPage
      bulletin
      breadcrumb={[{ label: "Home", to: "/" }, { label: "Community", to: "/community" }, { label: "Connect" }]}
      eyebrow="03 — Hang out"
      title="Connect"
      description="One feed for everything — technical questions, project showcases, casual chatter, and announcements from the makerspace."
      ghostLetter="Co"
      tapeColor="rgba(167,139,250,0.72)"
      stats={[
        { value: total,      label: "Discussions", rotate: 1.5,  pinColor: "#7c3aed" },
        { value: postsToday, label: "Posts today", rotate: -2,   pinColor: "#ec4899", plus: false },
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <InitialAvatar name={user?.name} src={user?.avatar} className="size-10 shrink-0 text-sm" />
            <button
              type="button"
              onClick={handleComposeClick}
              className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-left text-sm text-muted-foreground hover:border-community"
            >
              Share something with the community…
            </button>
            <button
              type="button"
              onClick={handleComposeClick}
              className="inline-flex items-center gap-1.5 rounded-full bg-community px-4 py-2 text-sm font-medium text-community-foreground hover:opacity-90"
            >
              <Pencil className="size-4" /> Post
            </button>
          </div>
          <div className="mb-6 flex flex-wrap gap-2">
            {filters.map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeFilter === f
                    ? "border-community bg-community text-community-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-community hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading posts…</p>
          ) : visiblePosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {communityPosts.length === 0
                ? "No posts yet — be the first to share something."
                : hasMore ? "No posts match this filter yet — try loading more." : "No posts match this filter."}
            </p>
          ) : (
            <div className="space-y-5">
              {visiblePosts.map((post, i) => (
                <CommunityPostCard key={post.id} post={post} index={i} onToggleLike={handleToggleLike} />
              ))}
            </div>
          )}
          {!loading && hasMore && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </div>
        <aside className="hidden lg:block space-y-5">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Trending tags</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["esp32", "3d-printing", "pcb", "raspberry-pi", "low-power", "meetup"].map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Be excellent</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Be kind, share generously, credit sources. Looking for teammates? Try{" "}
              <Link to="/community/collabspace" className="text-community underline-offset-2 hover:underline">
                Find Team
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
      <CreatePostDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={(post) => { setCommunityPosts((prev) => [post, ...prev]); setTotal((t) => t + 1); }}
      />
    </SectionPage>
  );
}
