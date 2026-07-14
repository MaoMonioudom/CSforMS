import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CourseEditorForm from "./CourseEditorForm";
import { useCourse } from "../../../hooks/learning/useCourses";
import { useLecturers } from "../../../hooks/learning/useLecturers";
import { learningApi } from "../../../lib/api/learning";
import NotFound from "../../../pages/NotFound";

export default function AdminCourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const { course, loading } = useCourse(id);
  const { lecturers } = useLecturers();
  const [error, setError] = useState("");

  if (!isNew && loading) {
    return <p className="text-sm text-gray-400">Loading course…</p>;
  }
  if (!isNew && !course) return <NotFound />;

  const handleSubmit = async (courseData) => {
    try {
      if (isNew) await learningApi.createCourse(courseData);
      else await learningApi.updateCourse(id, courseData);
      navigate("/admin/learning/courses");
    } catch (err) {
      setError(err.message || "Could not save the course.");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isNew ? "New Course" : `Edit: ${course.title}`}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isNew ? "Add a new course to the Learning platform." : "Update course details and lessons."}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-600 text-sm px-4 py-2.5">{error}</div>
      )}

      <CourseEditorForm
        initialCourse={course}
        lecturers={lecturers.filter((l) => l.active)}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin/learning/courses")}
      />
    </div>
  );
}
