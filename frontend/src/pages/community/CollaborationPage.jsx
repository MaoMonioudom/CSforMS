import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SectionPage } from "@/components/community/SectionPage";
import { CollabCard } from "@/components/community/CollabCard";
import { fetchCollabPosts, createCollabPost } from "@/lib/collaboration-data";
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
import { Plus } from "lucide-react";

const filters = ["All", "Looking for Team", "Recruiting", "Competition", "Research"];

// Only fields the collaboration_posts table actually has columns for —
// roles-needed/skills/author-profile would need their own tables (see
// collaboration-data.js), so they're left out rather than collected and
// silently dropped.
function CreateCollabDialog({ open, onOpenChange, onCreated }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const form = new FormData(e.target);
    const payload = {
      post_type: form.get("type") === "looking-for-team" ? "looking_for_team" : "recruiting",
      project_title: form.get("projectTitle")?.trim(),
      category: form.get("category")?.trim() || null,
      short_pitch: form.get("shortPitch")?.trim() || null,
      description: form.get("description")?.trim() || null,
      team_size_current: Number(form.get("currentSize")) || 1,
      team_size_target: Number(form.get("targetSize")) || null,
      contact_email: form.get("contactEmail")?.trim() || null,
      contact_discord: form.get("contactDiscord")?.trim() || null,
      contact_telegram: form.get("contactTelegram")?.trim() || null,
    };

    setSubmitting(true);
    try {
      const created = await createCollabPost(payload);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Team Post</DialogTitle>
          <DialogDescription>
            Fill in all the details to post your project or find teammates.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div>
            <Label className="mb-1.5 block">Post type</Label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 cursor-pointer hover:bg-accent">
                <input
                  type="radio"
                  name="type"
                  value="looking-for-team"
                  required
                  className="accent-collaboration"
                />
                <span className="text-sm">Looking for Team</span>
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 cursor-pointer hover:bg-accent">
                <input
                  type="radio"
                  name="type"
                  value="recruiting"
                  required
                  className="accent-collaboration"
                />
                <span className="text-sm">Recruiting Teammates</span>
              </label>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="projectTitle" className="mb-1.5 block">
                Project title
              </Label>
              <Input id="projectTitle" name="projectTitle" placeholder="e.g. AI Hackathon Team" required />
            </div>
            <div>
              <Label htmlFor="category" className="mb-1.5 block">Category</Label>
              <Input id="category" name="category" placeholder="e.g. Competition" required />
            </div>
            <div>
              <Label htmlFor="shortPitch" className="mb-1.5 block">Short pitch</Label>
              <Input id="shortPitch" name="shortPitch" placeholder="One sentence summary" required />
            </div>
          </div>
          <div>
            <Label htmlFor="description" className="mb-1.5 block">Description</Label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="Tell people about the project, goals, and what you're looking for..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="currentSize" className="mb-1.5 block">Current team size</Label>
              <Input id="currentSize" name="currentSize" type="number" min={0} placeholder="0" required />
            </div>
            <div>
              <Label htmlFor="targetSize" className="mb-1.5 block">Target team size</Label>
              <Input id="targetSize" name="targetSize" type="number" min={1} placeholder="3" required />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <Label htmlFor="contactEmail" className="mb-1.5 block">Email</Label>
              <Input id="contactEmail" name="contactEmail" type="email" placeholder="you@example.edu" required />
            </div>
            <div>
              <Label htmlFor="contactDiscord" className="mb-1.5 block">Discord (optional)</Label>
              <Input id="contactDiscord" name="contactDiscord" placeholder="username#0000" />
            </div>
            <div>
              <Label htmlFor="contactTelegram" className="mb-1.5 block">Telegram (optional)</Label>
              <Input id="contactTelegram" name="contactTelegram" placeholder="@username" />
            </div>
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
              className="bg-collaboration text-collaboration-foreground hover:bg-collaboration/90"
            >
              {submitting ? "Posting…" : "Create Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CollaborationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [collabPosts, setCollabPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollabPosts().then(setCollabPosts).finally(() => setLoading(false));
  }, []);

  const handleCreateClick = () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setOpen(true);
  };

  return (
    <SectionPage
      bulletin
      breadcrumb={[{ label: "Home", to: "/" }, { label: "Community", to: "/community" }, { label: "Find Team" }]}
      eyebrow="02 — Build together"
      title="Find Team"
      description="Find teammates, recruit members, and connect with people who want to build alongside you."
      ghostLetter="C"
      tapeColor="rgba(52,211,153,0.72)"
      stats={[
        { value: collabPosts.length, label: "Open posts",       rotate: 2,    pinColor: "#6366f1" },
        { value: 5,                  label: "New this week",    rotate: -1.5, pinColor: "#16a34a", plus: false },
      ]}
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">Open posts</h2>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">{collabPosts.length} posts</p>
          <Button
            onClick={handleCreateClick}
            className="bg-collaboration text-collaboration-foreground hover:bg-collaboration/90"
          >
            <Plus className="size-4" /> Create
          </Button>
        </div>
      </div>
      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((f, i) => (
          <button
            key={f}
            type="button"
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              i === 0
                ? "border-collaboration bg-collaboration text-collaboration-foreground"
                : "border-border bg-background text-muted-foreground hover:border-collaboration hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading posts…</p>
      ) : collabPosts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts yet — be the first to create one.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collabPosts.map((post, i) => (
            <CollabCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}
      <CreateCollabDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={(post) => setCollabPosts((prev) => [post, ...prev])}
      />
    </SectionPage>
  );
}
