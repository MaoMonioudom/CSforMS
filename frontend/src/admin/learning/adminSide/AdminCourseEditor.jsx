import { useParams, useNavigate } from "react-router-dom";
import CourseEditorForm from "./CourseEditorForm";
import { getCourseById, saveCourse, createCourse } from "../../../data/courseStore";
import { getLecturers } from "../../../data/userStore";
import NotFound from "../../../pages/NotFound";

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
    navigate("/admin/learning/courses");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isNew ? "New Course" : `Edit: ${course.title}`}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isNew ? "Add a new course to the Learning platform." : "Update course details and lessons."}
        </p>
      </div>

      <CourseEditorForm
        initialCourse={course}
        lecturers={lecturers}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin/learning/courses")}
      />
    </div>
  );
}
