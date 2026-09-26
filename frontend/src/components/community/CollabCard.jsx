import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Lock, LockOpen } from "lucide-react";
import { collabTypeLabel, formatRelativeTime, updateCollabPostStatus } from "@/lib/collaboration-data";
import { InitialAvatar } from "@/components/community/InitialAvatar";
import { useAuth } from "@/hub/AuthContext";

const tilts = [1, -1.2, 0.6, -0.8, 1.4, -0.5, 1, -1.5];

const paperShadow = "0 2px 4px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.11)";
const paperShadowHover = "0 8px 12px rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.14)";

function Pushpin() {
  return (
    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none">
      <div
        className="w-5 h-5 rounded-full shadow-md"
        style={{
          background: "radial-gradient(circle at 35% 30%, color-mix(in oklch, var(--collaboration) 55%, white), var(--collaboration))",
          boxShadow: "0 2px 6px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.3)",
        }}
      />
      <div className="w-0.5 h-2 bg-muted-foreground rounded-b" style={{ marginTop: "-1px" }} />
    </div>
  );
}

export function CollabCard({ post, index = 0, onStatusChange }) {
  const rotate = tilts[index % tilts.length];
  const { user } = useAuth();
  const isOwner = user && user.id === post.ownerId;
  const isClosed = post.status === "closed";
  const [toggling, setToggling] = useState(false);

  const handleToggleStatus = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggling) return;
    setToggling(true);
    try {
      const nextStatus = isClosed ? "open" : "closed";
      const status = await updateCollabPostStatus(post.id, nextStatus);
      onStatusChange?.(post.id, status);
    } catch {
      // Silently ignore: the toggle stays clickable so the user can retry.
    } finally {
      setToggling(false);
    }
  };

  return (
    <div
      className="relative pt-4"
      style={{
        transform: `rotate(${rotate}deg)`,
        transition: "transform 0.3s cubic-bezier(0.34,1.2,0.64,1)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "rotate(0deg) translateY(-6px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = `rotate(${rotate}deg)`; }}
    >
      <Pushpin />
    <Link
      to={`/community/collabspace/${post.id}`}
      className="group flex flex-col overflow-hidden rounded-none paper text-card-foreground"
      style={{
        boxShadow: paperShadow,
        transition: "box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = paperShadowHover; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = paperShadow; }}
    >
      {/* Colored header band: signup sheet style */}
      <div className={`px-5 py-3 flex items-center gap-2 shrink-0 ${isClosed ? "bg-muted" : "bg-collaboration"}`}>
        <span className={`text-sm font-extrabold tracking-wide ${isClosed ? "text-muted-foreground" : "text-collaboration-foreground"}`}>
          {collabTypeLabel[post.type]}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {isClosed && (
            <span className="badge badge-sm bg-black/15 text-white/90">Closed</span>
          )}
          {isOwner && (
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={toggling}
              title={isClosed ? "Reopen this post" : "Close this post"}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold transition-colors ${
                isClosed ? "bg-white/20 text-white hover:bg-white/30" : "bg-black/10 text-collaboration-foreground hover:bg-black/20"
              }`}
            >
              {isClosed ? <LockOpen className="size-3.5" /> : <Lock className="size-3.5" />}
              {isClosed ? "Reopen" : "Close"}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-extrabold tracking-tight leading-snug">{post.projectTitle}</h3>

        {/* Roles needed: only recruiting posts collect these */}
        {post.rolesNeeded.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Looking for</p>
            <div className="flex flex-wrap gap-1.5">
              {post.rolesNeeded.map((role) => (
                <span
                  key={role}
                  className="badge badge-sm bg-collaboration/12 border border-collaboration/25 text-foreground"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Category */}
        <span className="badge badge-sm w-fit bg-black/6 text-muted-foreground">
          {post.category}
        </span>

        {/* Author */}
        <div className="mt-auto flex items-center gap-2.5 border-t border-black/6 pt-4">
          <InitialAvatar
            name={post.author.name}
            src={post.author.avatar}
            className="size-8 ring-2 ring-collaboration/20 text-xs"
          />
          <div className="text-xs leading-tight">
            <p className="font-bold text-foreground">{post.author.name}</p>
            <p className="text-muted-foreground">{formatRelativeTime(post.postedAt)}</p>
          </div>
          <div className="ml-auto inline-flex items-center gap-1 text-xs font-extrabold text-collaboration group-hover:gap-2 transition-all">
            View <ArrowRight className="size-3.5" />
          </div>
        </div>
      </div>
    </Link>
    </div>
  );
}
