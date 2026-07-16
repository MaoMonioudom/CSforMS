import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourse } from "../../hooks/learning/useCourses";
import { useEnrollment } from "../../hooks/learning/useEnrollment";
import LessonPageView from "../../components/learning/ui/BookReader/LessonPageView";
import NotFound from "../NotFound";

const CONTAINER = "mx-auto w-full max-w-[1200px] px-8 max-sm:px-4";

export default function LessonDetail() {
  const { id, lessonId } = useParams();
  const navigate = useNavigate();
  const { course, loading } = useCourse(id);
  const { enrolled, loaded } = useEnrollment(id);

  // Lessons are for enrolled students only — anyone else (guest or not yet
  // enrolled) is sent to the course page, where the enroll prompt appears.
  useEffect(() => {
    if (loaded && !enrolled) navigate(`/learning/course/${id}`, { replace: true });
  }, [loaded, enrolled, id, navigate]);

  if (loading || !loaded || !enrolled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-deep font-body">
        <p className="text-sm text-navy-muted">Opening the book…</p>
      </div>
    );
  }
  if (!course) return <NotFound />;

  const lesson = (course.lessons || []).find((l) => String(l.id) === lessonId);
  if (!lesson) return <NotFound />;

  return (
    <div className="min-h-screen bg-navy-deep pb-16 font-body">
      {/* Back link */}
      <div className={`${CONTAINER} flex items-center gap-4 pb-4 pt-6 max-sm:pt-4`}>
        <button
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-sm font-medium text-navy-muted opacity-70 transition-opacity duration-300 hover:text-gold hover:opacity-100"
          onClick={() => navigate(`/learning/course/${course.id}`)}
        >
          ← Back to {course.title}
        </button>
        <span className="overflow-hidden text-ellipsis whitespace-nowrap font-display text-[0.9rem] italic text-parchment/45 max-sm:hidden">
          {lesson.title}
        </span>
      </div>

      {/* Single-lesson book page — no cover/TOC/other lessons */}
      <div className={`${CONTAINER} pt-2`}>
        <LessonPageView course={course} lessonId={lesson.id} />
      </div>
    </div>
  );
}
