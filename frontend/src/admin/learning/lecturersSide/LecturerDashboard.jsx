import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../../../hub/AuthContext";
import { useCourses } from "../../../hooks/learning/useCourses";

export default function LecturerDashboard() {
  const { user } = useAuth();
  const { courses, deleteCourse } = useCourses();
  const navigate = useNavigate();

  const myCourses = courses.filter((c) => c.instructorId === user.id);

  const remove = (course) => {
    if (window.confirm(`Delete "${course.title}"? This can't be undone.`)) {
      deleteCourse(course.id);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-parchment">My Courses</h1>
          <p className="mt-1 text-sm text-navy-muted">{myCourses.length} courses you teach</p>
        </div>
        <button
          onClick={() => navigate("/lecturer/learning/courses/new")}
          className="inline-flex items-center gap-2 bg-gold text-navy-deep text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gold-light transition-colors"
        >
          <Plus className="h-4 w-4" /> New Course
        </button>
      </div>

      <div className="bg-navy-deep rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-5 py-3 text-xs font-semibold text-navy-muted uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-navy-muted uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-navy-muted uppercase tracking-wider hidden md:table-cell">Lessons</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-navy-muted uppercase tracking-wider hidden lg:table-cell">Paths</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-navy-muted uppercase tracking-wider">Students</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-navy-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {myCourses.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-navy-muted">You don't have any courses yet.</td></tr>
              ) : myCourses.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-parchment truncate max-w-[220px]">{c.title}</p>
                    <p className="text-xs text-navy-muted sm:hidden">{c.category}</p>
                  </td>
                  <td className="px-5 py-3.5 text-navy-muted hidden sm:table-cell">{c.category}</td>
                  <td className="px-5 py-3.5 text-navy-muted hidden md:table-cell">{(c.lessons || []).length}</td>
                  <td className="px-5 py-3.5 text-navy-muted text-xs hidden lg:table-cell">{(c.paths || []).join(", ")}</td>
                  <td className="px-5 py-3.5 text-parchment font-medium tabular-nums">{(c.students || 0).toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/lecturer/learning/courses/${c.id}/edit`}
                        className="p-1.5 text-navy-muted hover:text-parchment hover:bg-white/10 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => remove(c)}
                        className="p-1.5 text-navy-muted hover:text-red-400 hover:bg-oxblood/15 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
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
