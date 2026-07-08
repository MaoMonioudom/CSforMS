import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";
import { communityPosts as initialCommunityPosts } from "@/lib/community-data";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from "@/components/community/ui/alert-dialog";

// User-authored posts — admins moderate (view, remove) rather than edit
// someone else's content under their name. No Edit action here, unlike
// Events which are admin-owned.
function Actions({ post, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      <Link
        to={`/community/communityspace/${post.id}`} target="_blank" rel="noreferrer"
        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="View"
      >
        <Eye className="h-3.5 w-3.5" />
      </Link>
      <button onClick={() => onDelete(post)}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

const categoryColors = {
  Technical:    "bg-blue-50 text-blue-600",
  Showcase:     "bg-emerald-50 text-emerald-600",
  Question:     "bg-amber-50 text-amber-600",
  Social:       "bg-pink-50 text-pink-600",
  Announcement: "bg-red-50 text-red-600",
};

export default function AdminCommunity() {
  const [list, setList] = useState(initialCommunityPosts);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const confirmDelete = () => {
    setList(prev => prev.filter(p => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community</h1>
          <p className="mt-1 text-sm text-gray-500">{list.length} posts</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Post</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Author</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tags</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Engagement</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900 truncate max-w-[220px]">
                      {post.title ?? post.body}
                    </p>
                    <p className="text-xs text-gray-400 truncate max-w-[220px] mt-0.5">
                      {post.title ? post.body.slice(0, 60) + "…" : ""}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryColors[post.category] ?? "bg-gray-100 text-gray-600"}`}>
                      {post.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <img src={post.author.avatar} alt={post.author.name} className="h-6 w-6 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-gray-700 truncate max-w-[110px] text-xs font-medium">{post.author.name}</p>
                        <p className="text-gray-400 text-[10px]">{post.author.handle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(post.tags ?? []).slice(0, 3).map(t => (
                        <span key={t} className="inline-block bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-gray-600 text-xs tabular-nums">
                      {post.likes} likes · {post.comments?.length ?? 0} replies
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
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this post?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title ?? deleteTarget?.body?.slice(0, 60)}" will be removed from Community. This can't be undone.
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
