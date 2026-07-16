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

/* Asks the student to enroll before studying. Shown when they open a course
   (or click a lesson) without being enrolled; declining lets them browse the
   course page, but lessons stay locked. */
function EnrollPromptModal({ course, signedIn, enrolling, onEnroll, onSignIn, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] rounded-xl border border-gold/25 bg-navy p-7 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Enroll in this course"
      >
        <div className="mb-2 text-[34px]">🎓</div>
        <h2 className="mb-2 font-display text-xl font-semibold text-[#F7F5F0]">
          Do you want to enroll in this course?
        </h2>
        <p className="mb-6 text-[13.5px] leading-relaxed text-[#B9C2CE]">
          Enroll in <span className="font-semibold text-parchment">{course.title}</span> to
          open its lessons and rate the course. It's free — paid paths are unlocked separately.
        </p>
        <div className="flex justify-center gap-3">
          {signedIn ? (
            <button
              onClick={onEnroll}
              disabled={enrolling}
              className="cursor-pointer rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-navy-deep transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {enrolling ? "Enrolling…" : "Yes, enroll me"}
            </button>
          ) : (
            <button
              onClick={onSignIn}
              className="cursor-pointer rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-navy-deep transition-opacity hover:opacity-85"
            >
              Sign in to enroll
            </button>
          )}
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-white/20 px-6 py-2.5 text-sm font-medium text-[#B9C2CE] transition-colors hover:border-white/40 hover:text-parchment"
          >
            Just browsing
          </button>
        </div>
      </div>
    </div>
  );
}

/* 1–5 star picker shown to enrolled students. */
function StarRating({ myStars, onRate, saving }) {
  const [hover, setHover] = useState(0);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-[12px] text-[#B9C2CE]">{myStars ? "Your rating:" : "Rate this course:"}</span>
      <span className="inline-flex" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={saving}
            onClick={() => onRate(n)}
            onMouseEnter={() => setHover(n)}
            className="cursor-pointer px-0.5 text-[16px] leading-none transition-transform hover:scale-110 disabled:opacity-50"
            aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
          >
            <span className={(hover ? n <= hover : n <= myStars) ? "text-gold" : "text-white/25"}>★</span>
          </button>
        ))}
      </span>
    </span>
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { course, loading } = useCourse(id);
  const { isUnlocked, unlock } = useUnlockedPaths();
  const { signedIn, enrolled, enrolling, loaded, myStars, enroll, rate, setEnrolled } =
    useEnrollment(id);

  const [activePath, setActivePath] = useState("basic");
  const [showCheckout, setShowCheckout] = useState(false);
  const [showEnrollPrompt, setShowEnrollPrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const [ratingSaving, setRatingSaving] = useState(false);
  // Fresh average after the student rates, without refetching the course.
  const [liveRating, setLiveRating] = useState(null);

  // The course arrives async — once it does, start on its first path.
  useEffect(() => {
    if (course?.paths?.length) setActivePath(course.paths[0]);
  }, [course]);

  // Ask to enroll as soon as we know the student isn't (once per visit).
  useEffect(() => {
    if (course && loaded && !enrolled && !promptDismissed) setShowEnrollPrompt(true);
  }, [course, loaded, enrolled, promptDismissed]);

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
  const rating = liveRating?.rating ?? course.rating;
  const ratingCount = liveRating?.ratingCount ?? course.ratingCount;

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

  const handleEnroll = async () => {
    if (!signedIn) {
      navigate("/login");
      return;
    }
    const ok = await enroll();
    if (ok) setShowEnrollPrompt(false);
  };

  const dismissPrompt = () => {
    setShowEnrollPrompt(false);
    setPromptDismissed(true);
  };

  const openLesson = (lesson) => {
    if (!enrolled) {
      setShowEnrollPrompt(true);
      return;
    }
    navigate(`/learning/${course.id}/lessons/${lesson.id}?path=${activePath}`);
  };

  const handleRate = async (stars) => {
    setRatingSaving(true);
    try {
      const result = await rate(stars);
      if (result) setLiveRating(result);
    } catch {
      /* rating failed (offline?) — keep the previous value */
    } finally {
      setRatingSaving(false);
    }
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
          <span>
            ⭐ {rating}
            {ratingCount > 0 && <span className="text-[#B9C2CE]/60"> ({ratingCount})</span>}
          </span>
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
          {enrolled && <StarRating myStars={myStars} onRate={handleRate} saving={ratingSaving} />}
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
          <>
            {!enrolled && (
              <p className="mb-5 text-[12.5px] text-[#B9C2CE]/70">
                🔒 Lessons unlock after you enroll.
              </p>
            )}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-8 max-sm:grid-cols-1">
              {lessons.map((lesson, index) => (
                <LessonBookCard
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  course={course}
                  onClick={() => openLesson(lesson)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {showEnrollPrompt && !enrolled && (
        <EnrollPromptModal
          course={course}
          signedIn={signedIn}
          enrolling={enrolling}
          onEnroll={handleEnroll}
          onSignIn={() => navigate("/login")}
          onClose={dismissPrompt}
        />
      )}

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
