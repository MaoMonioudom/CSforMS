import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import CourseEditorForm from "../../components/course-editor/CourseEditorForm";
import { useAuth } from "../../hooks/useAuth";
import { getCourseById, saveCourse, createCourse } from "../../data/courseStore";
import NotFound from "../NotFound";

const LINKS = [{ to: "/lecturer", label: "My Courses", end: true }];

export default function LecturerCourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isNew = !id;
  const course = isNew ? null : getCourseById(id);

  // Editing someone else's course isn't allowed — bail out rather than
  // let a lecturer reach another instructor's content via a typed URL.
  if (!isNew && (!course || course.instructorId !== currentUser.id)) return <NotFound />;

  const handleSubmit = (courseData) => {
    if (isNew) createCourse(courseData);
    else saveCourse(courseData);
    navigate("/lecturer");
  };

  return (
    <DashboardLayout title={isNew ? "New Course" : `Edit: ${course.title}`} links={LINKS}>
      <CourseEditorForm
        initialCourse={course}
        mode="lecturer"
        currentUser={currentUser}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/lecturer")}
      />
    </DashboardLayout>
  );
}
