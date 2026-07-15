import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

export default function LecturerCourseStudents() {
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

  return (
    <div>
      <Link
        to="/lecturer/learning/courses"
        className="inline-flex items-center gap-1.5 text-sm text-navy-muted hover:text-parchment transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to my courses
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-parchment">
          {loading ? "Loading…" : data?.courseTitle || "Course students"}
        </h1>
        <p className="mt-1 text-sm text-navy-muted">{students.length} enrolled students</p>
      </div>

      {error && (
        <div className="bg-oxblood/15 border border-red-400/30 text-red-300 text-sm rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <div className="bg-navy-deep rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-5 py-3 text-xs font-semibold text-navy-muted uppercase tracking-wider">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-navy-muted uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-navy-muted uppercase tracking-wider">Enrolled</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-navy-muted uppercase tracking-wider hidden md:table-cell">Interactive path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-navy-muted">Loading students…</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-navy-muted">No students enrolled yet.</td></tr>
              ) : students.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-parchment">{s.name}</p>
                    <p className="text-xs text-navy-muted sm:hidden">{s.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-navy-muted hidden sm:table-cell">{s.email}</td>
                  <td className="px-5 py-3.5 text-navy-muted whitespace-nowrap">{formatDate(s.enrolledAt)}</td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    {s.purchasedInteractive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 text-emerald-300 text-xs font-medium px-2.5 py-1">
                        Purchased{s.pricePaid != null ? ` · $${s.pricePaid.toFixed(2)}` : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-navy-muted">—</span>
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
