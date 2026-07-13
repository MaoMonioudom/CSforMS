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
    <DashboardLayout
      title="Courses"
      links={LINKS}
      actions={
        <button className="btn btn-primary" onClick={() => navigate("/admin/courses/new")}>
          + New Course
        </button>
      }
    >
      {courses.length === 0 ? (
        <p className="dash-table__empty">No courses yet.</p>
      ) : (
        <table className="dash-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Instructor</th>
              <th>Paths</th>
              <th>Students</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td>{c.title}</td>
                <td>{c.category}</td>
                <td>{c.instructor || "—"}</td>
                <td>{(c.paths || []).join(", ")}</td>
                <td>{(c.students || 0).toLocaleString()}</td>
                <td>
                  <div className="dash-table__actions">
                    <Link className="dash-table__link" to={`/admin/courses/${c.id}/edit`}>Edit</Link>
                    <button className="dash-table__link dash-table__link--danger" onClick={() => remove(c)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}
