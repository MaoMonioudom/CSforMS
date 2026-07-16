import { api } from "./api/client";

// Shared /tags search — backs the typeahead on both Find Team's skills
// field (collaboration_skills) and Connect's tags field (post_tags), since
// both junction tables point at the same `tags` dictionary.
export async function searchTags(query) {
  const { data } = await api.get(`/api/community/tags?q=${encodeURIComponent(query)}`);
  return data;
}
