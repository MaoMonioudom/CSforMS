import { api } from "./api/client";

// tags, likes, and comments are all real now (post_tags+tags, post_votes,
// post_comments — all via communityPost.controller.js).
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

function mapComment(row) {
  return {
    id: row.comment_id,
    body: row.content,
    author: mapAuthor(row.author),
    postedAt: row.created_at,
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
    tags: row.tags || [],
    likes: row.likes ?? 0,
    likedByMe: row.liked_by_me ?? false,
    comments: (row.comments || []).map(mapComment),
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

// Toggles the caller's like on a post; returns the fresh total count and
// whether the caller now has it liked, so callers can sync local state
// without a full refetch.
export async function toggleLike(id) {
  const { data } = await api.post(`/api/community/posts/${id}/like`, {});
  return { likes: data.likes, likedByMe: data.liked_by_me };
}

// Posts a comment and returns it already mapped, so the caller can append
// it to `post.comments` without a full refetch.
export async function createComment(postId, content) {
  const { data } = await api.post(`/api/community/posts/${postId}/comments`, { content });
  return mapComment(data);
}

// title/content/category map straight to community_posts columns; tags are
// handled separately server-side (communityPost.controller.js), writing to
// post_tags+tags rather than a column on this table. user_id is stamped
// server-side from the authenticated caller, not sent here.
export async function createCommunityPost(payload) {
  const { data } = await api.post("/api/community/posts", payload);
  return mapPost(data);
}

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
