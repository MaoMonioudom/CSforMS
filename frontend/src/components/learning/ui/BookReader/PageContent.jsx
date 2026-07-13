import { formatNumber, getInitials } from "../../../../utils/format";
import {
  typeBadgeClass,
  LESSON_NUM,
  LESSON_TITLE,
  LESSON_DUR,
  LESSON_BODY,
  LESSON_POINTS,
  LESSON_POINTS_TITLE,
  LESSON_POINTS_LIST,
} from "./bookStyles";

/* ── Cover ── */
function CoverPage({ course }) {
  return (
    <>
      <span className="mb-3 inline-block w-fit rounded-sm bg-gold/[0.18] px-2.5 py-[3px] text-[10px] font-semibold uppercase tracking-[0.13em] text-gold-dark">
        {course.category}
      </span>
      <h1 className="mb-[5px] font-display text-[clamp(18px,2.8vw,26px)] font-bold leading-[1.22] text-ink max-[699px]:text-xl">
        {course.title}
      </h1>
      <p className="mb-3.5 font-display text-[13px] italic text-black/[0.42]">{course.subtitle}</p>
      <div className="mb-3.5 h-0.5 w-[38px] bg-gold" />
      <p className="mb-3.5 text-[12.5px] leading-[1.85] text-[#2C2C2C]/80 max-[699px]:text-[13px]">
        {course.description}
      </p>
      <div className="mb-3 flex flex-wrap gap-[5px]">
        <span className="rounded-sm bg-black/[0.07] px-2 py-[3px] text-[10.5px] font-medium text-black/[0.52]">⏱ {course.duration}</span>
        <span className="rounded-sm bg-black/[0.07] px-2 py-[3px] text-[10.5px] font-medium text-black/[0.52]">📖 {course.lessons.length} lessons</span>
        <span className="rounded-sm bg-black/[0.07] px-2 py-[3px] text-[10.5px] font-medium text-black/[0.52]">👥 {formatNumber(course.students)}</span>
        <span className="rounded-sm bg-black/[0.07] px-2 py-[3px] text-[10.5px] font-medium text-black/[0.52]">⭐ {course.rating}</span>
        <span className="rounded-sm bg-black/[0.07] px-2 py-[3px] text-[10.5px] font-medium text-black/[0.52]">🎯 {course.level}</span>
      </div>
      <div className="mb-3.5 flex flex-wrap gap-[5px]">
        {course.tags.map((t) => (
          <span
            key={t}
            className="rounded-sm border border-[#1B2A3B]/[0.12] bg-[#1B2A3B]/10 px-2 py-0.5 text-[10px] font-medium text-[#1B2A3B]/60"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center gap-2.5 rounded border-l-[3px] border-gold bg-black/5 px-3 py-2.5">
        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-navy font-display text-xs font-bold text-gold">
          {getInitials(course.instructor)}
        </div>
        <div>
          <div className="mb-px text-[9px] uppercase tracking-[0.09em] text-black/[0.38]">Instructor</div>
          <div className="text-xs font-semibold text-ink">{course.instructor}</div>
        </div>
      </div>
    </>
  );
}

/* ── Table of contents ── */
function TocPage({ course, onJumpToLesson }) {
  return (
    <>
      <h2 className="mb-[3px] font-display text-lg font-bold text-ink max-[699px]:text-xl">Contents</h2>
      <p className="mb-3.5 text-[11px] italic text-black/40">
        {course.lessons.length} lessons · {course.duration}
      </p>
      {course.lessons.map((l, i) => (
        <div
          key={l.id}
          className="group flex cursor-pointer items-center gap-[7px] border-b border-black/[0.07] py-[7px] transition-colors duration-150"
          onClick={() => onJumpToLesson(i)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onJumpToLesson(i)}
        >
          <div className="h-[5px] w-[5px] shrink-0 rounded-full bg-gold" />
          <span className="min-w-4 font-display text-[10px] text-black/[0.28]">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="flex-1 text-[11.5px] font-medium text-ink group-hover:text-gold-dark">
            {l.title}
          </span>
          <span className={typeBadgeClass(l.type)}>{l.type}</span>
          <span className="whitespace-nowrap text-[10px] text-black/[0.33]">{l.duration}</span>
        </div>
      ))}
    </>
  );
}

/* ── Lesson ── */
export function LessonPage({ page, course }) {
  const { lesson: l, num } = page;
  return (
    <>
      <span className={typeBadgeClass(l.type)}>{l.type}</span>
      <div className={LESSON_NUM}>
        Lesson {String(num).padStart(2, "0")} of {course.lessons.length}
      </div>
      <h2 className={LESSON_TITLE}>{l.title}</h2>
      <div className={LESSON_DUR}>⏱ {l.duration}</div>
      <div className={LESSON_BODY} dangerouslySetInnerHTML={{ __html: l.body }} />
      {l.points && l.points.length > 0 && (
        <div className={LESSON_POINTS}>
          <div className={LESSON_POINTS_TITLE}>Key takeaways</div>
          <ul className={LESSON_POINTS_LIST}>
            {l.points.map((pt, i) => (
              <li key={i}>{pt}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

/* ── Enroll ── */
function EnrollPage({ course, enrolled, onEnroll }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-[11px] text-center">
      <div className="mb-0.5 text-[34px]">🎓</div>
      <div className="font-display text-xl font-bold text-ink">Ready to begin?</div>
      <p className="max-w-[200px] text-xs leading-[1.7] text-black/[0.48]">
        You've read all {course.lessons.length} lessons of {course.title}. Enroll
        to unlock exercises, labs, and your certificate.
      </p>
      <button
        className={`mt-1 cursor-pointer rounded px-7 py-[11px] font-body text-[13px] font-semibold tracking-[0.02em] transition-colors duration-200 ${
          enrolled
            ? "border border-[#326E37]/[0.28] bg-[#326E37]/10 text-[#2D6A30]"
            : "border-none bg-navy text-gold hover:bg-[#253a50]"
        }`}
        onClick={onEnroll}
      >
        {enrolled ? "✓ Enrolled — start learning" : "Enroll Now"}
      </button>
    </div>
  );
}

/* ── Router ── */
export default function PageContent({ page, course, onJumpToLesson, enrolled, onEnroll }) {
  if (!page) return null;
  if (page.type === "cover")  return <CoverPage course={course} />;
  if (page.type === "toc")    return <TocPage course={course} onJumpToLesson={onJumpToLesson} />;
  if (page.type === "lesson") return <LessonPage page={page} course={course} />;
  if (page.type === "enroll") return <EnrollPage course={course} enrolled={enrolled} onEnroll={onEnroll} />;
  return null;
}
