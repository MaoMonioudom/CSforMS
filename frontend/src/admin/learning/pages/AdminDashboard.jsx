import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, Users2, ArrowUpRight } from "lucide-react";
import { useCourses } from "../../../hooks/learning/useCourses";
import { useLecturers } from "../../../hooks/learning/useLecturers";

function StatCard({ label, value, icon: Icon, bg, iconColor, to }) {
  return (
    <Link
      to={to}
      className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${bg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      <p className="mt-4 text-xs text-gray-400 flex items-center gap-1 group-hover:text-gray-600 transition-colors">
        Manage <ArrowUpRight className="h-3 w-3" />
      </p>
    </Link>
  );
}

export default function AdminDashboard() {
  const { courses } = useCourses();
  const { lecturers } = useLecturers();
  const totalStudents = courses.reduce((sum, c) => sum + (c.students || 0), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of the CADT Learning platform.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Courses"   value={courses.length}   icon={BookOpen}       bg="bg-emerald-50" iconColor="text-emerald-500" to="/admin/learning/courses" />
        <StatCard label="Lecturers" value={lecturers.length} icon={GraduationCap}  bg="bg-violet-50"  iconColor="text-violet-500"  to="/admin/learning/lecturers" />
        <StatCard label="Students"  value={totalStudents}    icon={Users2}         bg="bg-blue-50"    iconColor="text-blue-500"    to="/admin/learning/courses" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-bold text-gray-800 mb-3">Recent courses</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-gray-400">No courses yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {courses.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                  <p className="text-xs text-gray-400">{c.category} · {c.instructor || "Unassigned"}</p>
                </div>
                <span className="text-xs font-medium text-gray-500 tabular-nums shrink-0 ml-3">
                  {(c.students || 0).toLocaleString()} students
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
