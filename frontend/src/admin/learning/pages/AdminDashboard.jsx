import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  Users2,
  ClipboardList,
  BadgeDollarSign,
  ArrowUpRight,
  ShoppingCart,
  UserPlus,
} from "lucide-react";
import { useCourses } from "../../../hooks/learning/useCourses";
import { useLecturers } from "../../../hooks/learning/useLecturers";
import { learningApi } from "../../../lib/api/learning";

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

function timeAgo(value) {
  const seconds = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminDashboard() {
  const { courses } = useCourses();
  const { lecturers } = useLecturers();
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    learningApi.overview().then(setOverview).catch(() => {
      /* stats stay at 0 if the request fails; course cards still render */
    });
  }, []);

  const activity = overview?.activity || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of the CADT Learning platform.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Courses"     value={courses.length}                    icon={BookOpen}        bg="bg-emerald-50" iconColor="text-emerald-500" to="/admin/learning/courses" />
        <StatCard label="Lecturers"   value={lecturers.length}                  icon={GraduationCap}   bg="bg-violet-50"  iconColor="text-violet-500"  to="/admin/learning/lecturers" />
        <StatCard label="Students"    value={overview?.uniqueStudents ?? 0}     icon={Users2}          bg="bg-blue-50"    iconColor="text-blue-500"    to="/admin/learning/courses" />
        <StatCard label="Enrollments" value={overview?.totalEnrollments ?? 0}   icon={ClipboardList}   bg="bg-sky-50"     iconColor="text-sky-500"     to="/admin/learning/courses" />
        <StatCard label="Revenue"     value={`$${(overview?.totalRevenue ?? 0).toFixed(2)}`} icon={BadgeDollarSign} bg="bg-amber-50" iconColor="text-amber-500" to="/admin/learning/courses" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Enrollment per course */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Students per course</h2>
          {courses.length === 0 ? (
            <p className="text-sm text-gray-400">No courses yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {[...courses]
                .sort((a, b) => (b.students || 0) - (a.students || 0))
                .slice(0, 8)
                .map((c) => (
                  <Link
                    key={c.id}
                    to={`/admin/learning/courses/${c.id}/students`}
                    className="flex items-center justify-between py-2.5 group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {c.title}
                      </p>
                      <p className="text-xs text-gray-400">{c.category} · {c.instructor || "Unassigned"}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-500 tabular-nums shrink-0 ml-3">
                      {(c.students || 0).toLocaleString()} students
                    </span>
                  </Link>
                ))}
            </div>
          )}
        </div>

        {/* Recent enrollments & purchases */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Recent activity</h2>
          {activity.length === 0 ? (
            <p className="text-sm text-gray-400">No enrollments or purchases yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {activity.slice(0, 10).map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5">
                  <div className={`p-1.5 rounded-full shrink-0 ${a.type === "purchase" ? "bg-amber-50" : "bg-blue-50"}`}>
                    {a.type === "purchase" ? (
                      <ShoppingCart className="h-3.5 w-3.5 text-amber-500" />
                    ) : (
                      <UserPlus className="h-3.5 w-3.5 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-700 min-w-0 flex-1 truncate">
                    <span className="font-medium text-gray-900">{a.student}</span>
                    {a.type === "purchase" ? " purchased " : " enrolled in "}
                    <span className="font-medium text-gray-900">{a.courseTitle}</span>
                    {a.type === "purchase" && a.price != null && (
                      <span className="text-amber-600"> (${a.price.toFixed(2)})</span>
                    )}
                  </p>
                  <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">{timeAgo(a.at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
