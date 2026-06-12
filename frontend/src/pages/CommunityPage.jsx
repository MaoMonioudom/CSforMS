import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import { SectionPage } from "@/components/SectionPage";
import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { communityPosts } from "@/lib/community-data";

const filters = ["All", "Technical", "Showcase", "Question", "Social", "Announcement"];

export default function CommunityPage() {
  return (
    <SectionPage
      tone="community"
      eyebrow="03 — Hang out"
      title="Community"
      description="One feed for everything — technical questions, project showcases, casual chatter, and announcements from the makerspace."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <img
              src="https://i.pravatar.cc/120?u=you"
              alt=""
              className="size-10 shrink-0 rounded-full object-cover"
            />
            <button
              type="button"
              className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-left text-sm text-muted-foreground hover:border-community"
            >
              Share something with the community…
            </button>
            <button
              type="button"
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
          <div className="space-y-5">
            {communityPosts.map((post) => (
              <CommunityPostCard key={post.id} post={post} />
            ))}
          </div>
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
              <Link to="/collaboration" className="text-community underline-offset-2 hover:underline">
                Collaboration
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </SectionPage>
  );
}
