import { stripHtmlPreview } from "../../../utils/format";
import BookShell from "./BookShell";

/**
 * Shelf-style book card for a single lesson (mirrors BookCard's look).
 * Uses the parent course's cover/spine colour so every lesson in a
 * course reads as a chapter of the same book, not a different course.
 * Clicking calls onClick (parent handles navigation to the lesson page).
 */
export default function LessonBookCard({ lesson, index, course, onClick }) {
  return (
    <BookShell
      spineColor={course.spineColor}
      coverColor={course.coverColor}
      category={lesson.type}
      badge={`Lesson ${String(index + 1).padStart(2, "0")}`}
      title={lesson.title}
      subtitle={stripHtmlPreview(lesson.body)}
      ariaLabel={`Open lesson ${lesson.title}`}
      onClick={onClick}
      meta={
        <>
          <span>⏱ {lesson.duration}</span>
          {lesson.points?.length > 0 && <span>✓ {lesson.points.length} takeaways</span>}
        </>
      }
    />
  );
}
