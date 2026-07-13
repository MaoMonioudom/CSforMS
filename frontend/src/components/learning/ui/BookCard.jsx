import { useNavigate } from "react-router-dom";
import BookShell from "./BookShell";

/**
 * Shelf-style book card with 3-D page-turn hover effect.
 * Clicking navigates to /learning/course/:id.
 */
export default function BookCard({ course }) {
  const navigate = useNavigate();

  return (
    <BookShell
      spineColor={course.spineColor}
      coverColor={course.coverColor}
      category={course.category}
      badge={course.level}
      title={course.title}
      subtitle={course.subtitle}
      ariaLabel={`Open ${course.title}`}
      onClick={() => navigate(`/learning/course/${course.id}`)}
      meta={
        <>
          <span>⏱ {course.duration}</span>
          <span>📖 {course.lessons?.length ?? 0} ch.</span>
          <span>⭐ {course.rating}</span>
        </>
      }
    />
  );
}
