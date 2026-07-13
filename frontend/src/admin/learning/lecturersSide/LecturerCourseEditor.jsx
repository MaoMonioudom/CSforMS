import { useParams, useNavigate } from "react-router-dom";
import CourseEditorForm from "../adminSide/CourseEditorForm";
import { useAuth } from "../../../hub/AuthContext";
import { getCourseById, saveCourse, createCourse } from "../../../data/courseStore";
import NotFound from "../../../pages/NotFound";

export default function LecturerCourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = !id;
  const course = isNew ? null : getCourseById(id);

  // Editing someone else's course isn't allowed — bail out rather than let a
  // lecturer reach another instructor's content via a typed URL.
  if (!isNew && (!course || course.instructorId !== user.id)) return <NotFound />;

  const handleSubmit = (courseData) => {
    if (isNew) createCourse(courseData);
    else saveCourse(courseData);
    navigate("/lecturer/learning/courses");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-parchment">{isNew ? "New Course" : `Edit: ${course.title}`}</h1>
        <p className="mt-1 text-sm text-navy-muted">
          {isNew ? "Add a new course you'll teach." : "Update course details and lessons."}
        </p>
      </div>

      <CourseEditorForm
        initialCourse={course}
        lecturers={[{ id: user.id, name: user.name }]}
        lockInstructorId={user.id}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/lecturer/learning/courses")}
      />
    </div>
  );
}
