import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Users2, BadgeDollarSign } from "lucide-react";
import { learningApi } from "../../../lib/api/learning";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value) {
  return value ? dateFmt.format(new Date(value)) : "—";
}

export default function AdminCourseStudents() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    learningApi
      .courseStudents(id)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load students");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const students = data?.students || [];
  const buyers = students.filter((s) => s.purchasedInteractive);
  const revenue = buyers.reduce((sum, s) => sum + (s.pricePaid || 0), 0);

  return (
    <div>
      <Link
        to="/admin/learning/courses"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to courses
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {loading ? "Loading…" : data?.courseTitle || "Course students"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">Enrolled students and interactive-path purchases.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Users2 className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Students</p>
            <p className="text-xl font-bold text-gray-900 tabular-nums">{students.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50">
            <BadgeDollarSign className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Purchases</p>
            <p className="text-xl font-bold text-gray-900 tabular-nums">
              {buyers.length} <span className="text-sm font-medium text-gray-400">(${revenue.toFixed(2)})</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrolled</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Interactive path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">Loading students…</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">No students enrolled yet.</td></tr>
              ) : students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400 sm:hidden">{s.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 hidden sm:table-cell">{s.email}</td>
                  <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{formatDate(s.enrolledAt)}</td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    {s.purchasedInteractive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium px-2.5 py-1">
                        Purchased{s.pricePaid != null ? ` · $${s.pricePaid.toFixed(2)}` : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
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
