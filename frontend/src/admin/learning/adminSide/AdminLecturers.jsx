import { useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useCourses } from "../../hooks/useCourses";
import { getLecturers, createLecturer, setUserActive } from "../../data/userStore";

const LINKS = [
  { to: "/admin/learning", label: "Overview", end: true },
  { to: "/admin/learning/courses", label: "Courses" },
  { to: "/admin/learning/lecturers", label: "Lecturers" },
];

const EMPTY_FORM = { name: "", email: "", password: "" };

export default function AdminLecturers() {
  const { courses } = useCourses();
  const [lecturers, setLecturers] = useState(() => getLecturers());
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const courseCountFor = (lecturerId) =>
    courses.filter((c) => c.instructorId === lecturerId).length;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Name, email, and password are all required.");
      return;
    }
    if (lecturers.some((l) => l.email.toLowerCase() === form.email.trim().toLowerCase())) {
      setError("A lecturer with that email already exists.");
      return;
    }
    createLecturer({ name: form.name.trim(), email: form.email.trim(), password: form.password });
    setLecturers(getLecturers());
    setForm(EMPTY_FORM);
    setShowForm(false);
    setError("");
  };

  const toggleActive = (lecturer) => {
    setUserActive(lecturer.id, !lecturer.active);
    setLecturers(getLecturers());
  };

  return (
    <DashboardLayout
      title="Lecturers"
      links={LINKS}
      actions={
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ Add Lecturer"}
        </button>
      }
    >
      {showForm && (
        <form className="editor-form" onSubmit={submit} style={{ marginBottom: "var(--space-6)" }}>
          <div className="editor-section">
            <div className="editor-row">
              <div className="form-group">
                <label className="form-label" htmlFor="lect-name">Name</label>
                <input id="lect-name" className="form-input" value={form.name} onChange={update("name")} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lect-email">Email</label>
                <input id="lect-email" className="form-input" value={form.email} onChange={update("email")} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lect-password">Password</label>
                <input
                  id="lect-password"
                  className="form-input"
                  value={form.password}
                  onChange={update("password")}
                />
              </div>
            </div>
            {error && <span className="form-error">{error}</span>}
            <div className="editor-footer">
              <button type="submit" className="btn btn-primary">Create Lecturer</button>
            </div>
          </div>
        </form>
      )}

      <table className="dash-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Courses</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {lecturers.map((l) => (
            <tr key={l.id}>
              <td>{l.name}</td>
              <td>{l.email}</td>
              <td>{courseCountFor(l.id)}</td>
              <td>
                <span className={`dash-badge dash-badge--${l.active ? "active" : "inactive"}`}>
                  {l.active ? "Active" : "Deactivated"}
                </span>
              </td>
              <td>
                <button className="dash-table__link" onClick={() => toggleActive(l)}>
                  {l.active ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashboardLayout>
  );
}
