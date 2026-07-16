import { useState } from "react";
import { normalizeLessonBody, parseBodySteps } from "../../../../utils/format";
import {
  typeBadgeClass,
  LESSON_NUM,
  LESSON_TITLE,
  LESSON_DUR,
  LESSON_POINTS,
  LESSON_POINTS_TITLE,
  LESSON_POINTS_LIST,
} from "./bookStyles";

/**
 * Step-by-Step path: a checklist the learner ticks off in order. Uses the
 * lesson's dedicated step content (one step per line) when the author
 * provided it; otherwise falls back to splitting the basic body's lines.
 */
function getSteps(lesson) {
  if (lesson.stepsBody?.trim()) {
    const items = normalizeLessonBody(lesson.stepsBody)
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    return { intro: "", items };
  }
  return parseBodySteps(lesson.body);
}

export default function StepByStepLesson({ lesson, num, total }) {
  const { intro, items } = getSteps(lesson);
  const [done, setDone] = useState(() => items.map(() => false));

  const toggle = (i) =>
    setDone((d) => d.map((v, idx) => (idx === i ? !v : v)));

  const doneCount = done.filter(Boolean).length;
  const progress = items.length ? (doneCount / items.length) * 100 : 0;

  return (
    <>
      <span className={typeBadgeClass(lesson.type)}>{lesson.type}</span>
      <div className={LESSON_NUM}>
        Lesson {String(num).padStart(2, "0")} of {total} · Step-by-Step
      </div>
      <h2 className={LESSON_TITLE}>{lesson.title}</h2>
      <div className={LESSON_DUR}>⏱ {lesson.duration}</div>

      {intro && (
        <p className="mb-3 text-[12.5px] leading-[1.8] text-[#2C2C2C]/80">{intro}</p>
      )}

      <div className="mb-3.5 flex items-center gap-2.5">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full bg-gold transition-[width] duration-250"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="whitespace-nowrap text-[10.5px] text-black/45">
          {doneCount} / {items.length} steps
        </span>
      </div>

      <ol className="m-0 mb-1 flex flex-1 list-none flex-col gap-2.5 overflow-y-auto p-0">
        {items.map((step, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <button
              type="button"
              className={`flex h-[22px] w-[22px] shrink-0 cursor-pointer items-center justify-center rounded-full border text-[11px] font-semibold transition-all duration-150 ${
                done[i]
                  ? "border-gold bg-gold text-navy-deep"
                  : "border-black/25 bg-black/[0.04] text-black/50"
              }`}
              onClick={() => toggle(i)}
              aria-pressed={done[i]}
              aria-label={`Mark step ${i + 1} ${done[i] ? "incomplete" : "complete"}`}
            >
              {done[i] ? "✓" : i + 1}
            </button>
            <span
              className={`text-[12.5px] leading-[1.7] ${
                done[i] ? "text-[#2C2C2C]/40 line-through" : "text-[#2C2C2C]/80"
              }`}
            >
              {step}
            </span>
          </li>
        ))}
      </ol>

      {lesson.points && lesson.points.length > 0 && (
        <div className={LESSON_POINTS}>
          <div className={LESSON_POINTS_TITLE}>Key takeaways</div>
          <ul className={LESSON_POINTS_LIST}>
            {lesson.points.map((pt, i) => (
              <li key={i}>{pt}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
