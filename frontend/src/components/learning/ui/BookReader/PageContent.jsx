import { formatNumber, getInitials } from "../../../../utils/format";
import { normalizeLessonBody } from "../../../../utils/format";
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
      <span className="badge badge-sm mb-3 w-fit bg-community-gold/[0.18] uppercase tracking-[0.13em] text-community-gold-light-foreground">
        {course.category}
      </span>
      <h1 className="mb-[5px] text-[clamp(18px,2.8vw,26px)] font-bold leading-[1.22] text-ink max-[699px]:text-xl">
        {course.title}
      </h1>
      <p className="mb-3.5 text-sm italic text-black/[0.42]">{course.subtitle}</p>
      <div className="mb-3.5 h-0.5 w-[38px] bg-community-gold" />
      <p className="mb-3.5 text-xs leading-[1.85] text-[#2C2C2C]/80 max-[699px]:text-sm">
        {course.description}
      </p>
      <div className="mb-3 flex flex-wrap gap-[5px]">
        <span className="badge badge-sm bg-black/[0.07] text-black/[0.52]">⏱ {course.duration}</span>
        <span className="badge badge-sm bg-black/[0.07] text-black/[0.52]">📖 {course.lessons.length} lessons</span>
        <span className="badge badge-sm bg-black/[0.07] text-black/[0.52]">👥 {formatNumber(course.students)}</span>
        <span className="badge badge-sm bg-black/[0.07] text-black/[0.52]">⭐ {course.rating}</span>
        <span className="badge badge-sm bg-black/[0.07] text-black/[0.52]">🎯 {course.level}</span>
      </div>
      <div className="mb-3.5 flex flex-wrap gap-[5px]">
        {course.tags.map((t) => (
          <span
            key={t}
            className="badge badge-sm border border-[#1B2A3B]/[0.12] bg-[#1B2A3B]/10 text-[#1B2A3B]/60"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center gap-2.5 rounded border-l-[3px] border-community-gold bg-black/5 px-3 py-2.5">
        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-community-gold">
          {getInitials(course.instructor)}
        </div>
        <div>
          <div className="mb-px text-xs uppercase tracking-[0.09em] text-black/[0.38]">Instructor</div>
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
      <h2 className="mb-[3px] text-lg font-bold text-ink max-[699px]:text-xl">Contents</h2>
      <p className="mb-3.5 text-xs italic text-black/40">
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
          <div className="h-[5px] w-[5px] shrink-0 rounded-full bg-community-gold" />
          <span className="min-w-4 text-xs text-black/[0.28]">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="flex-1 text-xs font-medium text-ink group-hover:text-community-gold-light-foreground">
            {l.title}
          </span>
          <span className={typeBadgeClass(l.type)}>{l.type}</span>
          <span className="whitespace-nowrap text-xs text-black/[0.33]">{l.duration}</span>
        </div>
      ))}
    </>
  );
}

/* ── Lesson ── */
export function LessonPage({ page, course }) {
  const { lesson: l, num } = page;
  const bodyText = normalizeLessonBody(l.body);
  return (
    <>
      <span className={typeBadgeClass(l.type)}>{l.type}</span>
      <div className={LESSON_NUM}>
        Lesson {String(num).padStart(2, "0")} of {course.lessons.length}
      </div>
      <h2 className={LESSON_TITLE}>{l.title}</h2>
      <div className={LESSON_DUR}>⏱ {l.duration}</div>
      <div className={`${LESSON_BODY} whitespace-pre-wrap`}>{bodyText}</div>
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
      <div className="mb-0.5 text-4xl">🎓</div>
      <div className="text-xl font-bold text-ink">Ready to begin?</div>
      <p className="max-w-[200px] text-xs leading-[1.7] text-black/[0.48]">
        You've read all {course.lessons.length} lessons of {course.title}. Enroll
        to unlock exercises, labs, and your certificate.
      </p>
      <button
        className={`mt-1 cursor-pointer tracking-[0.02em] ${
          enrolled
            ? "btn-secondary border-[#326E37]/[0.28] bg-[#326E37]/10 text-[#2D6A30]"
            : "btn-primary border-none bg-navy text-community-gold hover:bg-[#253a50]"
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
