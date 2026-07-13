import { Link } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useCourses } from "../../hooks/useCourses";
import { getLecturers } from "../../data/userStore";

const LINKS = [
  { to: "/admin/learning", label: "Overview", end: true },
  { to: "/admin/learning/courses", label: "Courses" },
  { to: "/admin/learning/lecturers", label: "Lecturers" },
];

export default function AdminDashboard() {
  const { courses } = useCourses();
  const lecturers = getLecturers();

  const totalStudents = courses.reduce((sum, c) => sum + (c.students || 0), 0);
  const interactiveCourses = courses.filter((c) => c.paths?.includes("interactive")).length;

  return (
    <DashboardLayout title="Admin Overview" links={LINKS}>
      <div className="dash-stats">
        <div className="dash-stat">
          <div className="dash-stat__value">{courses.length}</div>
          <div className="dash-stat__label">Courses</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__value">{lecturers.length}</div>
          <div className="dash-stat__label">Lecturers</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__value">{totalStudents.toLocaleString()}</div>
          <div className="dash-stat__label">Students</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat__value">{interactiveCourses}</div>
          <div className="dash-stat__label">With Interactive path</div>
        </div>
      </div>

      <p>
        Manage the course catalog in <Link className="dash-table__link" to="/admin/courses">Courses</Link>,
        or manage lecturer accounts and access in <Link className="dash-table__link" to="/admin/lecturers">Lecturers</Link>.
      </p>
    </DashboardLayout>
  );
}
