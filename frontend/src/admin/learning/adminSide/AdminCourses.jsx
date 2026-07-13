import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useCourses } from "../../hooks/useCourses";

const LINKS = [
  { to: "/admin/learning", label: "Overview", end: true },
  { to: "/admin/learning/courses", label: "Courses" },
  { to: "/admin/learning/lecturers", label: "Lecturers" },
];

export default function AdminCourses() {
  const { courses, deleteCourse } = useCourses();
  const navigate = useNavigate();

  const remove = (course) => {
    if (window.confirm(`Delete "${course.title}"? This can't be undone.`)) {
      deleteCourse(course.id);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="mt-1 text-sm text-gray-500">{courses.length} courses on the platform</p>
        </div>
        <button
          onClick={() => navigate("/admin/learning/courses/new")}
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Course
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Instructor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Paths</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Students</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {courses.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No courses yet.</td></tr>
              ) : courses.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900 truncate max-w-[220px]">{c.title}</p>
                    <p className="text-xs text-gray-400 sm:hidden">{c.category}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 hidden sm:table-cell">{c.category}</td>
                  <td className="px-5 py-3.5 text-gray-600 hidden md:table-cell">{c.instructor || "—"}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs hidden lg:table-cell">{(c.paths || []).join(", ")}</td>
                  <td className="px-5 py-3.5 text-gray-700 font-medium tabular-nums">{(c.students || 0).toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/admin/learning/courses/${c.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => remove(c)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
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
