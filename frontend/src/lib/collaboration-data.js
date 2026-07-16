import { api } from "./api/client";

// Author is real — the backend embeds it via a join (see
// crudRouter.js's embedAuthor). Most accounts have no profile_img_url, so
// `avatar` is often null — that's intentional, not a bug: InitialAvatar
// renders a letter avatar instead of inventing a fake photo. year/major
// aren't tracked anywhere (no per-user academic fields in `users`), so those
// stay blank. The `!author` case only guards a deleted/missing user.
function mapAuthor(author) {
  if (!author) return { name: "Community Member", avatar: null, year: "", major: "" };
  return {
    name: author.full_name,
    avatar: author.profile_img_url,
    year: "",
    major: "",
  };
}

function mapCollab(row) {
  return {
    id: row.collab_id,
    type: row.post_type === "looking_for_team" ? "looking-for-team" : "recruiting",
    projectTitle: row.project_title,
    rolesNeeded: row.roles_needed || [],
    category: row.category || "General",
    shortPitch: row.short_pitch || "",
    description: row.description || "",
    skills: row.skills || [],
    teamSize: { current: row.team_size_current ?? 1, target: row.team_size_target ?? 1 },
    author: mapAuthor(row.author),
    contact: {
      email: row.contact_email || "",
      discord: row.contact_discord || "",
      telegram: row.contact_telegram || "",
    },
    postedAt: row.created_at,
  };
}

// Mutable, live-bound export — see events-data.js for why.
export let collabPosts = [];

export async function fetchCollabPosts() {
  const { data } = await api.get("/api/community/collaborations");
  collabPosts = data.map(mapCollab);
  return collabPosts;
}

export async function fetchCollabPostById(id) {
  const { data } = await api.get(`/api/community/collaborations/${id}`);
  return mapCollab(data);
}

export async function deleteCollabPost(id) {
  await api.del(`/api/community/collaborations/${id}`);
}

// post_type/project_title/etc. map straight to collaboration_posts columns;
// roles_needed/skills are handled separately server-side (collaboration.
// controller.js), writing to collaboration_roles / collaboration_skills+tags
// rather than columns on this table. user_id is stamped server-side from the
// authenticated caller, not sent here.
export async function createCollabPost(payload) {
  const { data } = await api.post("/api/community/collaborations", payload);
  return mapCollab(data);
}

export function formatRelativeTime(iso) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - then);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export const collabTypeLabel = {
  "looking-for-team": "Looking for Team",
  recruiting: "Recruiting Teammates"
};
