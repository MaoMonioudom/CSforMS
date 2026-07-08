import { useState } from "react";
import { SectionPage } from "@/components/community/SectionPage";
import { CollabCard } from "@/components/community/CollabCard";
import { collabPosts } from "@/lib/collaboration-data";
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
import { Plus, X } from "lucide-react";

const filters = ["All", "Looking for Team", "Recruiting", "Competition", "Research"];

function CreateCollabDialog({ open, onOpenChange }) {
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [roleInput, setRoleInput] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const addRole = () => {
    const r = roleInput.trim();
    if (r && !roles.includes(r)) {
      setRoles([...roles, r]);
      setRoleInput("");
    }
  };

  const removeRole = (r) => setRoles(roles.filter((x) => x !== r));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const removeSkill = (s) => setSkills(skills.filter((x) => x !== s));

  const handleSubmit = (e) => {
    e.preventDefault();
    onOpenChange(false);
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
          <div>
            <Label className="mb-1.5 block">Roles needed</Label>
            <div className="flex gap-2">
              <Input
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                placeholder="e.g. Frontend Developer"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRole(); } }}
              />
              <Button type="button" variant="outline" onClick={addRole}>
                <Plus className="size-4" />
              </Button>
            </div>
            {roles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {roles.map((r) => (
                  <span key={r} className="inline-flex items-center gap-1 rounded-md border border-collaboration/30 bg-collaboration/10 px-2 py-0.5 text-xs font-medium text-collaboration">
                    {r}
                    <button type="button" onClick={() => removeRole(r)} className="hover:text-collaboration/70">
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label className="mb-1.5 block">Skills & tech</Label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g. React, Python"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
              />
              <Button type="button" variant="outline" onClick={addSkill}>
                <Plus className="size-4" />
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    #{s}
                    <button type="button" onClick={() => removeSkill(s)} className="hover:text-foreground">
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
              <Label htmlFor="authorName" className="mb-1.5 block">Your name</Label>
              <Input id="authorName" name="authorName" placeholder="Moni Ratha" required />
            </div>
            <div>
              <Label htmlFor="authorYear" className="mb-1.5 block">Year</Label>
              <Input id="authorYear" name="authorYear" placeholder="Year 3" required />
            </div>
            <div>
              <Label htmlFor="authorMajor" className="mb-1.5 block">Major</Label>
              <Input id="authorMajor" name="authorMajor" placeholder="Computer Science" required />
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
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-collaboration text-collaboration-foreground hover:bg-collaboration/90">
              Create Post
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CollaborationPage() {
  const [open, setOpen] = useState(false);

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
            onClick={() => setOpen(true)}
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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collabPosts.map((post, i) => (
          <CollabCard key={post.id} post={post} index={i} />
        ))}
      </div>
      <CreateCollabDialog open={open} onOpenChange={setOpen} />
    </SectionPage>
  );
}
