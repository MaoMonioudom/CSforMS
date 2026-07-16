import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LessonPage } from "./PageContent";
import StepByStepLesson from "./StepByStepLesson";
import AIGuidePanel from "./AIGuidePanel";
import { useUnlockedPaths } from "../../../../hooks/learning/useUnlockedPaths";
import {
  SCENE, BOOK_SINGLE, BG_SINGLE, EDGES_RIGHT, PAGES_STACK,
  NAV, NAV_ARROW, NAV_LABEL, NAV_HINT,
} from "./bookStyles";

/**
 * Open-book page showing a single lesson only — no cover, table of
 * contents, other lessons, or enroll page. Prev/Next move directly
 * between this course's lessons, keeping the current path.
 *
 * Renders one of three ways depending on the `?path=` query param:
 *  - basic       → the lesson as-is (default)
 *  - stepByStep  → the same content broken into a checklist
 *  - interactive → the lesson plus an AI guide panel (requires the
 *                  course to have unlocked Interactive; otherwise
 *                  falls back to basic — payment happens on the course
 *                  page, not here)
 */
export default function LessonPageView({ course, lessonId }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isUnlocked } = useUnlockedPaths();

  const lessons = course.lessons || [];
  const index = lessons.findIndex((l) => String(l.id) === String(lessonId));
  const lesson = lessons[index];
  const prevLesson = lessons[index - 1];
  const nextLesson = lessons[index + 1];

  const requestedPath = searchParams.get("path") || course.paths?.[0] || "basic";
  const interactiveAllowed =
    course.paths?.includes("interactive") && isUnlocked(course.id);
  const path =
    requestedPath === "interactive" && !interactiveAllowed ? "basic" : requestedPath;

  const goTo = (l) =>
    l && navigate(`/learning/${course.id}/lessons/${l.id}?path=${path}`);
  const goPrev = () => goTo(prevLesson);
  const goNext = () => goTo(nextLesson);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // goNext/goPrev are stable per render of these deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevLesson, nextLesson, path, course.id]);

  if (!lesson) return null;

  return (
    <div className={SCENE}>
      <div className={BOOK_SINGLE}>
        <div className={BG_SINGLE}>
          <div className={EDGES_RIGHT} />
          {path === "stepByStep" ? (
            <StepByStepLesson
              key={lesson.id}
              lesson={lesson}
              num={index + 1}
              total={lessons.length}
            />
          ) : (
            <LessonPage
              page={{
                type: "lesson",
                // Interactive path shows its dedicated content when the
                // author wrote some; otherwise the basic body.
                lesson:
                  path === "interactive" && lesson.interactiveBody?.trim()
                    ? { ...lesson, body: lesson.interactiveBody }
                    : lesson,
                num: index + 1,
              }}
              course={course}
            />
          )}
        </div>
        <div className={PAGES_STACK} />
      </div>

      {path === "interactive" && (
        <AIGuidePanel key={lesson.id} lessonTitle={lesson.title} agentUrl={course.aiAgentUrl} />
      )}

      <div className={NAV}>
        <button
          className={NAV_ARROW}
          onClick={goPrev}
          disabled={!prevLesson}
          aria-label="Previous lesson"
        >
          ←
        </button>

        <p className={`${NAV_LABEL} m-0 flex-1`}>
          Lesson {index + 1} of {lessons.length}
        </p>

        <button
          className={NAV_ARROW}
          onClick={goNext}
          disabled={!nextLesson}
          aria-label="Next lesson"
        >
          →
        </button>
      </div>

      <p className={NAV_HINT}>use the arrows to move between lessons</p>
    </div>
  );
}
