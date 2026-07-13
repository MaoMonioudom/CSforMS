import { useNavigate } from "react-router-dom";

/**
 * Course card — displays category, level, title, subtitle, and stats.
 * Simple lift + accent-glow hover. Clicking navigates to /learning/course/:id.
 */
export default function CourseCard({ course }) {
  const navigate = useNavigate();

  const goToCourse = () => navigate(`/learning/course/${course.id}`);

  return (
    <article
      className="relative flex min-h-[220px] w-[280px] cursor-pointer flex-col justify-between rounded-[10px] border border-white/10 bg-[#1B2430] p-[22px] font-body transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-(--accent) hover:shadow-[0_10px_28px_-12px_rgba(0,0,0,0.5),0_0_0_1px_var(--accent)] focus-visible:-translate-y-1 focus-visible:border-(--accent) focus-visible:outline-none active:-translate-y-px motion-reduce:transition-none"
      onClick={goToCourse}
      role="button"
      tabIndex={0}
      aria-label={`Open ${course.title}`}
      onKeyDown={(e) => e.key === "Enter" && goToCourse()}
      style={{ "--accent": course.accentColor || "#E8A33D" }}
    >
      <div className="mb-[18px] flex items-center justify-between">
        <span className="rounded-full bg-[#4F7C82]/[0.18] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#7FB2B8]">
          {course.category}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#B9C2CE]">
          {course.level}
        </span>
      </div>

      <div className="mb-5 flex-1">
        <h3 className="mb-2 font-display text-xl font-semibold leading-[1.25] text-[#F7F5F0]">
          {course.title}
        </h3>
        <p className="text-[13.5px] leading-normal text-[#B9C2CE]">{course.subtitle}</p>
      </div>

      <div className="flex items-center gap-4 border-t border-white/10 pt-3.5">
        <span className="inline-flex items-center gap-[5px] text-[12.5px] font-medium text-[#B9C2CE]">
          <span className="text-xs leading-none" aria-hidden="true">⏱</span>
          {course.duration}
        </span>
        <span className="inline-flex items-center gap-[5px] text-[12.5px] font-medium text-[#B9C2CE]">
          <span className="text-xs leading-none" aria-hidden="true">📖</span>
          {course.lessons?.length ?? 0} ch.
        </span>
        <span className="ml-auto inline-flex items-center gap-[5px] text-[12.5px] font-medium text-(--accent)">
          <span className="text-xs leading-none" aria-hidden="true">★</span>
          {course.rating}
        </span>
      </div>
    </article>
  );
}
