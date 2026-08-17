import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useCourses } from "../../../hooks/learning/useCourses";

export default function AdminCourses() {
  const { courses, deleteCourse } = useCourses();
  const navigate = useNavigate();

  const remove = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? This can't be undone.`)) return;
    try {
      await deleteCourse(course.id);
    } catch (err) {
      window.alert(err.message || "Could not delete the course.");
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">{courses.length} courses on the platform</p>
        </div>
        <button
          onClick={() => navigate("/admin/learning/courses/new")}
          className="inline-flex items-center gap-2 bg-foreground text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-foreground transition-colors"
        >
          <Plus className="h-4 w-4" /> New Course
        </button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Instructor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Paths</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Students</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {courses.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">No courses yet.</td></tr>
              ) : courses.map((c) => (
                <tr key={c.id} className="hover:bg-muted transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-foreground truncate max-w-[220px]">{c.title}</p>
                    <p className="text-xs text-muted-foreground sm:hidden">{c.category}</p>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden sm:table-cell">{c.category}</td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">{c.instructor || "—"}</td>
                  <td className="px-5 py-3.5 text-muted-foreground text-xs hidden lg:table-cell">{(c.paths || []).join(", ")}</td>
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/admin/learning/courses/${c.id}/students`}
                      className="text-foreground font-medium tabular-nums hover:text-blue-600 hover:underline transition-colors"
                      title="View enrolled students"
                    >
                      {(c.students || 0).toLocaleString()}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/admin/learning/courses/${c.id}/edit`}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => remove(c)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
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
