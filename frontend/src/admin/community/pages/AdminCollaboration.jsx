import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";
import { fetchCollabPostsPage, deleteCollabPost } from "@/lib/collaboration-data";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from "@/components/community/ui/alert-dialog";
import { InitialAvatar } from "@/components/community/InitialAvatar";

// These posts are user-authored — admins moderate (view, remove) rather than
// edit someone else's content under their name. No Edit action here, unlike
// Events which are admin-owned.
function Actions({ post, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      <Link
        to={`/community/collabspace/${post.id}`} target="_blank" rel="noreferrer"
        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="View"
      >
        <Eye className="h-3.5 w-3.5" />
      </Link>
      <button onClick={() => onDelete(post)}
        className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

const typeColors = {
  recruiting:        "bg-emerald-50 text-emerald-600",
  "looking-for-team": "bg-blue-50 text-blue-600",
};

const PAGE_SIZE = 24;

export default function AdminCollaboration() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCollabPostsPage({ page: 1, limit: PAGE_SIZE })
      .then(({ posts, total }) => { setList(posts); setTotal(total); })
      .catch(() => setError("Couldn't load posts — please try refreshing."))
      .finally(() => setLoading(false));
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setError("");
    try {
      const nextPage = page + 1;
      const { posts: more, total: freshTotal } = await fetchCollabPostsPage({ page: nextPage, limit: PAGE_SIZE });
      setList((prev) => [...prev, ...more]);
      setTotal(freshTotal);
      setPage(nextPage);
    } catch {
      setError("Couldn't load more posts — please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteCollabPost(deleteTarget.id);
      setList(prev => prev.filter(p => p.id !== deleteTarget.id));
      setTotal(t => t - 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Collaboration</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} open posts</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 text-red-600 text-sm px-4 py-2.5 mb-4">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <p className="text-sm text-muted-foreground p-8 text-center">Loading…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground p-8 text-center">No posts yet.</p>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Author</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Roles needed</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Team</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.map(post => (
                <tr key={post.id} className="hover:bg-muted transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-foreground truncate max-w-[200px]">{post.projectTitle}</p>
                    <p className="text-xs text-muted-foreground">{post.category}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[post.type] ?? "bg-muted text-muted-foreground"}`}>
                      {post.type === "looking-for-team" ? "Looking" : "Recruiting"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <InitialAvatar name={post.author.name} src={post.author.avatar} className="h-6 w-6 shrink-0 text-xs" />
                      <span className="text-foreground truncate max-w-[120px]">{post.author.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {post.rolesNeeded.slice(0, 2).map(r => (
                        <span key={r} className="inline-block bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                          {r}
                        </span>
                      ))}
                      {post.rolesNeeded.length > 2 && (
                        <span className="text-xs text-muted-foreground">+{post.rolesNeeded.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-muted-foreground tabular-nums">
                      {post.teamSize.current}/{post.teamSize.target}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end">
                      <Actions post={post} onDelete={setDeleteTarget} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {!loading && list.length < total && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 border border-border text-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove "{deleteTarget?.projectTitle}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the post from Find Team. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
