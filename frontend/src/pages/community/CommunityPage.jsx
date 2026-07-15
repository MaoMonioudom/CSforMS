import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Pencil } from "lucide-react";
import { SectionPage } from "@/components/community/SectionPage";
import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { fetchCommunityPosts, createCommunityPost } from "@/lib/community-data";
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
import { InitialAvatar } from "@/components/community/InitialAvatar";

const filters = ["All", "Technical", "Showcase", "Question", "Social", "Announcement"];
const categories = filters.slice(1);

function CreatePostDialog({ open, onOpenChange, onCreated }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    };

    setSubmitting(true);
    try {
      const created = await createCommunityPost(payload);
      onCreated(created);
      e.target.reset();
      onOpenChange(false);
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
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchCommunityPosts().then(setCommunityPosts).finally(() => setLoading(false));
  }, []);

  const handleComposeClick = () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setOpen(true);
  };

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
        { value: communityPosts.length, label: "Discussions",  rotate: 1.5,  pinColor: "#7c3aed" },
        { value: 12,                    label: "Active today", rotate: -2,   pinColor: "#ec4899", plus: false },
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
            {filters.map((f, i) => (
              <button
                key={f}
                type="button"
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  i === 0
                    ? "border-community bg-community text-community-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-community hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading posts…</p>
          ) : communityPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts yet — be the first to share something.</p>
          ) : (
            <div className="space-y-5">
              {communityPosts.map((post, i) => (
                <CommunityPostCard key={post.id} post={post} index={i} />
              ))}
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
        onCreated={(post) => setCommunityPosts((prev) => [post, ...prev])}
      />
    </SectionPage>
  );
}
