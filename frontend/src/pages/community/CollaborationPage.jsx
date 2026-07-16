import { useState, useEffect, useRef } from "react";
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
import { TagsInput } from "@/components/community/TagsInput";
import { Plus } from "lucide-react";

// post_type only has these 2 real values (DB CHECK constraint) — category
// used to also appear here as "Competition"/"Research", but category is
// free text with no fixed vocabulary (people type "Robotics", "Play PLay",
// anything), so those two were never reliably filterable and are dropped.
const filters = [
  { id: "all", label: "All" },
  { id: "looking-for-team", label: "Looking for Team" },
  { id: "recruiting", label: "Recruiting" },
];

// author-profile (year/major) has nowhere to live yet — no per-user academic
// fields on `users` — so that one's still left out (see collaboration-data.js).
function CreateCollabDialog({ open, onOpenChange, onCreated }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [skills, setSkills] = useState([]);
  const formRef = useRef(null);

  const parseList = (v) => (v || "").split(",").map(s => s.trim()).filter(Boolean);

  const closeAndReset = () => {
    formRef.current?.reset();
    setSkills([]);
    onOpenChange(false);
  };

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
      roles_needed: parseList(form.get("rolesNeeded")),
      skills,
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
      closeAndReset();
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
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div>
            <Label className="mb-1.5 block">Post type</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 rounded-lg border border-border px-3 py-2.5 cursor-pointer hover:bg-accent has-[:checked]:border-collaboration has-[:checked]:bg-collaboration/5">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="type"
                    value="looking-for-team"
                    required
                    className="accent-collaboration"
                  />
                  Looking for Team
                </span>
                <span className="pl-5 text-xs text-muted-foreground">
                  You want to join a project — describe your skills and what kind of team you're hoping to find.
                </span>
              </label>
              <label className="flex flex-col gap-1 rounded-lg border border-border px-3 py-2.5 cursor-pointer hover:bg-accent has-[:checked]:border-collaboration has-[:checked]:bg-collaboration/5">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="type"
                    value="recruiting"
                    required
                    className="accent-collaboration"
                  />
                  Recruiting Teammates
                </span>
                <span className="pl-5 text-xs text-muted-foreground">
                  You already have a project and need more people to join you.
                </span>
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
              <Label htmlFor="rolesNeeded" className="mb-1.5 block">Roles needed</Label>
              <Input id="rolesNeeded" name="rolesNeeded" placeholder="e.g. Frontend Dev, Designer" />
              <p className="mt-1 text-xs text-muted-foreground">Comma-separated</p>
            </div>
            <div>
              <Label className="mb-1.5 block">Skills & tech</Label>
              <TagsInput value={skills} onChange={setSkills} noun="skill" />
            </div>
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
            <Button type="button" variant="outline" onClick={closeAndReset}>
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
  const [activeFilter, setActiveFilter] = useState("all");

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

  const visiblePosts = activeFilter === "all"
    ? collabPosts
    : collabPosts.filter(p => p.type === activeFilter);

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
          <p className="text-sm text-muted-foreground">{visiblePosts.length} posts</p>
          <Button
            onClick={handleCreateClick}
            className="bg-collaboration text-collaboration-foreground hover:bg-collaboration/90"
          >
            <Plus className="size-4" /> Create
          </Button>
        </div>
      </div>
      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFilter(f.id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === f.id
                ? "border-collaboration bg-collaboration text-collaboration-foreground"
                : "border-border bg-background text-muted-foreground hover:border-collaboration hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading posts…</p>
      ) : visiblePosts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {collabPosts.length === 0 ? "No posts yet — be the first to create one." : "No posts match this filter."}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePosts.map((post, i) => (
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
