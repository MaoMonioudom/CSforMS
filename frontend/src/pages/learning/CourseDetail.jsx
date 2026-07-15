import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourse } from "../../hooks/learning/useCourses";
import LessonBookCard from "../../components/learning/ui/LessonBookCard";
import PathSelector from "../../components/learning/ui/PathSelector";
import CheckoutModal from "../../components/learning/ui/Checkout/CheckoutModal";
import { useUnlockedPaths } from "../../hooks/learning/useUnlockedPaths";
import { useEnrollment } from "../../hooks/learning/useEnrollment";
import NotFound from "../NotFound";

const CONTAINER = "mx-auto w-full max-w-[1200px] px-8 max-sm:px-4";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { course, loading } = useCourse(id);
  const { isUnlocked, unlock } = useUnlockedPaths();
  const { signedIn, enrolled, enrolling, enroll, setEnrolled } = useEnrollment(id);

  const [activePath, setActivePath] = useState("basic");
  const [showCheckout, setShowCheckout] = useState(false);

  // The course arrives async — once it does, start on its first path.
  useEffect(() => {
    if (course?.paths?.length) setActivePath(course.paths[0]);
  }, [course]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-deep font-body">
        <p className="text-sm text-navy-muted">Opening the book…</p>
      </div>
    );
  }
  if (!course) return <NotFound />;

  const lessons = course.lessons || [];
  const interactiveUnlocked = isUnlocked(course.id);

  const selectPath = (pathId) => {
    if (pathId === "interactive" && !interactiveUnlocked) {
      setShowCheckout(true);
      return;
    }
    setActivePath(pathId);
  };

  const handlePaymentSuccess = () => {
    unlock(course.id);
    // The unlock endpoint also enrolls the buyer server-side; mirror it here.
    if (signedIn) setEnrolled(true);
    setActivePath("interactive");
    setShowCheckout(false);
  };

  const handleEnroll = () => {
    if (!signedIn) {
      navigate("/login");
      return;
    }
    enroll();
  };

  return (
    <div className="min-h-screen bg-navy-deep pb-16 font-body">
      {/* Back link */}
      <div className={`${CONTAINER} flex items-center gap-4 pb-4 pt-6 max-sm:pt-4`}>
        <button
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-sm font-medium text-navy-muted opacity-70 transition-opacity duration-300 hover:text-gold hover:opacity-100"
          onClick={() => navigate("/learning/courses")}
        >
          ← Back to Library
        </button>
        <span className="overflow-hidden text-ellipsis whitespace-nowrap font-display text-[0.9rem] italic text-parchment/45 max-sm:hidden">
          {course.title}
        </span>
      </div>

      {/* Course intro */}
      <div className={`${CONTAINER} pb-2 pt-8`}>
        <span className="rounded-full bg-[#4F7C82]/[0.18] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#7FB2B8]">
          {course.category}
        </span>
        <h1 className="mb-1.5 mt-3.5 font-display text-[32px] font-semibold text-[#F7F5F0]">
          {course.title}
        </h1>
        <p className="mb-4 max-w-[640px] text-[15px] text-[#B9C2CE]">{course.subtitle}</p>
        <div className="flex flex-wrap items-center gap-[18px] border-b border-[#F7F5F0]/10 pb-6 text-[13px] text-[#B9C2CE]">
          <span>⏱ {course.duration}</span>
          <span>📖 {lessons.length} lessons</span>
          <span>⭐ {course.rating}</span>
          <span>👥 {(course.students || 0).toLocaleString()} students</span>
          {enrolled ? (
            <span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-[12px] font-semibold text-emerald-300">
              ✓ Enrolled
            </span>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="cursor-pointer rounded-full bg-gold px-4 py-1.5 text-[12px] font-semibold text-navy-deep transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {enrolling ? "Enrolling…" : signedIn ? "Enroll in this course" : "Sign in to enroll"}
            </button>
          )}
        </div>

        {/* Path selection */}
        <PathSelector
          course={course}
          activePath={activePath}
          unlocked={interactiveUnlocked}
          onSelect={selectPath}
        />
      </div>

      {/* Lesson list */}
      <div className={`${CONTAINER} pb-[60px] pt-7`}>
        {lessons.length === 0 ? (
          <p className="text-sm text-[#B9C2CE]">No lessons yet for this course.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-8 max-sm:grid-cols-1">
            {lessons.map((lesson, index) => (
              <LessonBookCard
                key={lesson.id}
                lesson={lesson}
                index={index}
                course={course}
                onClick={() =>
                  navigate(`/learning/${course.id}/lessons/${lesson.id}?path=${activePath}`)
                }
              />
            ))}
          </div>
        )}
      </div>

      {showCheckout && (
        <CheckoutModal
          course={course}
          price={course.interactivePrice}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}
