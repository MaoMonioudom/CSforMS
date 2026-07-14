import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CourseEditorForm from "../adminSide/CourseEditorForm";
import { useAuth } from "../../../hub/AuthContext";
import { useCourse } from "../../../hooks/learning/useCourses";
import { learningApi } from "../../../lib/api/learning";
import NotFound from "../../../pages/NotFound";

export default function LecturerCourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = !id;
  const { course, loading } = useCourse(id);
  const [error, setError] = useState("");

  if (!isNew && loading) {
    return <p className="text-sm text-navy-muted">Loading course…</p>;
  }

  // Editing someone else's course isn't allowed — bail out rather than let a
  // lecturer reach another instructor's content via a typed URL. (The
  // backend enforces this too; this just avoids a confusing form.)
  if (!isNew && (!course || course.instructorId !== user.id)) return <NotFound />;

  const handleSubmit = async (courseData) => {
    try {
      if (isNew) await learningApi.createCourse(courseData);
      else await learningApi.updateCourse(id, courseData);
      navigate("/lecturer/learning/courses");
    } catch (err) {
      setError(err.message || "Could not save the course.");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-parchment">{isNew ? "New Course" : `Edit: ${course.title}`}</h1>
        <p className="mt-1 text-sm text-navy-muted">
          {isNew ? "Add a new course you'll teach." : "Update course details and lessons."}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-600 text-sm px-4 py-2.5">{error}</div>
      )}

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
