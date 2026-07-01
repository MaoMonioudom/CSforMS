import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { collabPosts } from "@/lib/collaboration-data";

function Actions() {
  return (
    <div className="flex items-center gap-1">
      <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="View">
        <Eye className="h-3.5 w-3.5" />
      </button>
      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

const typeColors = {
  recruiting:        "bg-emerald-50 text-emerald-600",
  "looking-for-team": "bg-blue-50 text-blue-600",
};

export default function AdminCollaboration() {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collaboration</h1>
          <p className="mt-1 text-sm text-gray-500">{collabPosts.length} open posts</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Post
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Project</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Author</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Roles needed</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Team</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {collabPosts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900 truncate max-w-200px">{post.projectTitle}</p>
                    <p className="text-xs text-gray-400">{post.category}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColors[post.type] ?? "bg-gray-100 text-gray-600"}`}>
                      {post.type === "looking-for-team" ? "Looking" : "Recruiting"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <img src={post.author.avatar} alt={post.author.name} className="h-6 w-6 rounded-full object-cover shrink-0" />
                      <span className="text-gray-700 truncate max-w-120px">{post.author.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {post.rolesNeeded.slice(0, 2).map(r => (
                        <span key={r} className="inline-block bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                          {r}
                        </span>
                      ))}
                      {post.rolesNeeded.length > 2 && (
                        <span className="text-[10px] text-gray-400">+{post.rolesNeeded.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-gray-600 tabular-nums">
                      {post.teamSize.current}/{post.teamSize.target}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end">
                      <Actions />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
