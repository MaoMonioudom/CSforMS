import { api } from "./api/client";

// Real community posts (post_id, user_id, title, content, category,
// created_at) don't carry tags, a like count, or comments yet — those live
// in separate tables (tags, post_votes, post_comments) with no route wired
// up. Same approach as events/collaboration: default to empty/zero instead
// of faking numbers.
//
// Author IS real, though — the backend embeds it via a join (see
// crudRouter.js's embedAuthor). Most accounts have no profile_img_url, so
// `avatar` is often null — that's intentional, not a bug: InitialAvatar
// renders a letter avatar instead of inventing a fake photo. The `!author`
// case only guards a deleted/missing user, which shouldn't happen given the
// FK, but costs nothing to handle.
function mapAuthor(author) {
  if (!author) return { name: "Community Member", handle: "@member", avatar: null };
  return {
    name: author.full_name,
    handle: `@${author.user_name}`,
    avatar: author.profile_img_url,
  };
}

function mapPost(row) {
  return {
    id: row.post_id,
    category: row.category || "Social",
    author: mapAuthor(row.author),
    title: row.title || null,
    body: row.content,
    image: null,
    tags: [],
    likes: 0,
    comments: [],
    postedAt: row.created_at,
  };
}

// Mutable, live-bound export — see events-data.js for why.
export let communityPosts = [];

export async function fetchCommunityPosts() {
  const { data } = await api.get("/api/community/posts");
  communityPosts = data.map(mapPost);
  return communityPosts;
}

export async function fetchCommunityPostById(id) {
  const { data } = await api.get(`/api/community/posts/${id}`);
  return mapPost(data);
}

export async function deleteCommunityPost(id) {
  await api.del(`/api/community/posts/${id}`);
}

// payload keys must match the community_posts columns exactly — the
// backend inserts the body as-is (see crudRouter.js). user_id is stamped
// server-side from the authenticated caller, not sent here.
export async function createCommunityPost(payload) {
  const { data } = await api.post("/api/community/posts", payload);
  return mapPost(data);
}

export const categoryEmoji = {
  Technical: "🔧",
  Social: "☕",
  Showcase: "✨",
  Question: "❓",
  Announcement: "📣"
};

export function formatRelativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const wks = Math.floor(days / 7);
  return `${wks}w ago`;
}
