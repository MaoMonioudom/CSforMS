import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import CourseEditorForm from "../../components/course-editor/CourseEditorForm";
import { getCourseById, saveCourse, createCourse } from "../../data/courseStore";
import { getLecturers } from "../../data/userStore";
import NotFound from "../NotFound";

const LINKS = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/courses", label: "Courses" },
  { to: "/admin/lecturers", label: "Lecturers" },
];

export default function AdminCourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const course = isNew ? null : getCourseById(id);

  if (!isNew && !course) return <NotFound />;

  const lecturers = getLecturers().filter((l) => l.active);

  const handleSubmit = (courseData) => {
    if (isNew) createCourse(courseData);
    else saveCourse(courseData);
    navigate("/admin/courses");
  };

  return (
    <DashboardLayout title={isNew ? "New Course" : `Edit: ${course.title}`} links={LINKS}>
      <CourseEditorForm
        initialCourse={course}
        mode="admin"
        lecturers={lecturers}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin/courses")}
      />
    </DashboardLayout>
  );
}
