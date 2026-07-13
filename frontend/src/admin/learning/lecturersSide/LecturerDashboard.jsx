import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";
import { useCourses } from "../../hooks/useCourses";

const LINKS = [{ to: "/lecturer", label: "My Courses", end: true }];

export default function LecturerDashboard() {
  const { currentUser } = useAuth();
  const { courses, deleteCourse } = useCourses();
  const navigate = useNavigate();

  const myCourses = courses.filter((c) => c.instructorId === currentUser.id);

  const remove = (course) => {
    if (window.confirm(`Delete "${course.title}"? This can't be undone.`)) {
      deleteCourse(course.id);
    }
  };

  return (
    <DashboardLayout
      title="My Courses"
      links={LINKS}
      actions={
        <button className="btn btn-primary" onClick={() => navigate("/lecturer/courses/new")}>
          + New Course
        </button>
      }
    >
      {myCourses.length === 0 ? (
        <p className="dash-table__empty">You don't have any courses yet.</p>
      ) : (
        <table className="dash-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Lessons</th>
              <th>Paths</th>
              <th>Students</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {myCourses.map((c) => (
              <tr key={c.id}>
                <td>{c.title}</td>
                <td>{c.category}</td>
                <td>{(c.lessons || []).length}</td>
                <td>{(c.paths || []).join(", ")}</td>
                <td>{(c.students || 0).toLocaleString()}</td>
                <td>
                  <div className="dash-table__actions">
                    <button
                      className="dash-table__link"
                      onClick={() => navigate(`/lecturer/courses/${c.id}/edit`)}
                    >
                      Edit
                    </button>
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
