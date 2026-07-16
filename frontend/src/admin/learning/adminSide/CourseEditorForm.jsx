import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { normalizeLessonBody } from "../../../utils/format";

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

const PATH_OPTIONS = [
  { key: "basic", label: "Basic" },
  { key: "stepByStep", label: "Step-by-step" },
  { key: "interactive", label: "Interactive" },
];

const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const LESSON_TYPES = ["video", "reading", "Lab", "Project", "Assignment"];
const COLOR_PRESETS = ["#2D6A4F", "#7B2D8B", "#C9600A", "#1A5276", "#7D6608", "#1B6B5A"];

function emptyLesson() {
  return { title: "", duration: "", type: "video", body: "", stepsBody: "", interactiveBody: "", points: "" };
}

function toFormLesson(lesson) {
  return {
    id: lesson.id,
    title: lesson.title || "",
    duration: lesson.duration || "",
    type: lesson.type || "video",
    body: normalizeLessonBody(lesson.body || ""),
    stepsBody: normalizeLessonBody(lesson.stepsBody || ""),
    interactiveBody: normalizeLessonBody(lesson.interactiveBody || ""),
    points: (lesson.points || []).join("\n"),
  };
}

function LessonEditor({ lesson, index, paths, onChange, onRemove, onMove, isFirst, isLast }) {
  const set = (field) => (e) => onChange(index, { ...lesson, [field]: e.target.value });

  return (
    <div className="rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500">Lesson {index + 1}</p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onMove(index, -1)} disabled={isFirst}
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent">
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => onMove(index, 1)} disabled={isLast}
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent">
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => onRemove(index)}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className={labelCls}>Title</label>
          <input className={inputCls} value={lesson.title} onChange={set("title")} placeholder="Lesson title" />
        </div>
        <div>
          <label className={labelCls}>Duration</label>
          <input className={inputCls} value={lesson.duration} onChange={set("duration")} placeholder="e.g. 45 min" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Type</label>
        <select className={inputCls} value={lesson.type} onChange={set("type")}>
          {LESSON_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label className={labelCls}>Basic content</label>
        <textarea className={inputCls} rows={4} value={lesson.body} onChange={set("body")}
          placeholder="The lesson as plain reading material (shown on the Basic path)" />
      </div>

      {paths.includes("stepByStep") && (
        <div>
          <label className={labelCls}>Step-by-step — one step per line</label>
          <textarea className={inputCls} rows={4} value={lesson.stepsBody} onChange={set("stepsBody")}
            placeholder={"Install Python from python.org\nOpen VS Code and create hello.py\nRun the script from the terminal"} />
          <p className="mt-1 text-xs text-gray-400">Each line becomes one checklist step. Empty = steps are made from the Basic content's lines.</p>
        </div>
      )}

      {paths.includes("interactive") && (
        <div>
          <label className={labelCls}>Interactive content (optional)</label>
          <textarea className={inputCls} rows={4} value={lesson.interactiveBody} onChange={set("interactiveBody")}
            placeholder="Content shown on the Interactive path, next to the AI guide. Empty = reuses the Basic content." />
        </div>
      )}

      <div>
        <label className={labelCls}>Key points (one per line)</label>
        <textarea className={inputCls} rows={3} value={lesson.points} onChange={set("points")}
          placeholder={"First takeaway\nSecond takeaway"} />
      </div>
    </div>
  );
}

export default function CourseEditorForm({ initialCourse, lecturers, lockInstructorId, onSubmit, onCancel }) {
  const isNew = !initialCourse;

  const [form, setForm] = useState(() => ({
    title: initialCourse?.title || "",
    subtitle: initialCourse?.subtitle || "",
    category: initialCourse?.category || "",
    level: initialCourse?.level || LEVEL_OPTIONS[0],
    duration: initialCourse?.duration || "",
    instructorId: initialCourse?.instructorId || lockInstructorId || "",
    coverColor: initialCourse?.coverColor || "#2D6A4F",
    spineColor: initialCourse?.spineColor || "#1B4332",
    paths: initialCourse?.paths?.length ? initialCourse.paths : ["basic"],
    interactivePrice: initialCourse?.interactivePrice ?? "",
    aiAgentUrl: initialCourse?.aiAgentUrl || "",
    tags: (initialCourse?.tags || []).join(", "),
    description: initialCourse?.description || "",
  }));
  const [lessons, setLessons] = useState(() =>
    initialCourse?.lessons?.length ? initialCourse.lessons.map(toFormLesson) : []
  );
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const togglePath = (key) => {
    setForm((f) => ({
      ...f,
      paths: f.paths.includes(key) ? f.paths.filter((p) => p !== key) : [...f.paths, key],
    }));
  };

  const addLesson = () => setLessons((l) => [...l, emptyLesson()]);
  const updateLesson = (index, next) => setLessons((l) => l.map((ls, i) => (i === index ? next : ls)));
  const removeLesson = (index) => setLessons((l) => l.filter((_, i) => i !== index));
  const moveLesson = (index, dir) => {
    setLessons((l) => {
      const next = [...l];
      const target = index + dir;
      if (target < 0 || target >= next.length) return l;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (form.paths.length === 0) {
      setError("Select at least one learning path.");
      return;
    }

    const instructor = lecturers.find((l) => l.id === form.instructorId);

    const courseData = {
      ...(initialCourse || {}),
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      category: form.category.trim(),
      level: form.level,
      duration: form.duration.trim(),
      instructorId: form.instructorId || null,
      instructor: instructor?.name || "",
      coverColor: form.coverColor.trim() || undefined,
      spineColor: form.spineColor.trim() || undefined,
      paths: form.paths,
      interactivePrice: form.paths.includes("interactive") && form.interactivePrice !== ""
        ? Number(form.interactivePrice)
        : undefined,
      aiAgentUrl: form.paths.includes("interactive") ? form.aiAgentUrl.trim() : "",
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      description: form.description.trim(),
      lessons: lessons.map((l, i) => ({
        id: l.id ?? i + 1,
        title: l.title.trim(),
        duration: l.duration.trim(),
        type: l.type,
        body: l.body.trim(),
        stepsBody: l.stepsBody.trim(),
        interactiveBody: l.interactiveBody.trim(),
        points: l.points.split("\n").map((p) => p.trim()).filter(Boolean),
      })),
    };

    onSubmit(courseData);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 text-red-600 text-sm px-4 py-2.5">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-bold text-gray-800">Course details</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Title</label>
            <input className={inputCls} value={form.title} onChange={set("title")} placeholder="Course title" autoFocus />
          </div>
          <div>
            <label className={labelCls}>Subtitle</label>
            <input className={inputCls} value={form.subtitle} onChange={set("subtitle")} placeholder="Short tagline" />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Category</label>
            <input className={inputCls} value={form.category} onChange={set("category")} placeholder="e.g. Programming" />
          </div>
          <div>
            <label className={labelCls}>Level</label>
            <select className={inputCls} value={form.level} onChange={set("level")}>
              {LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Duration</label>
            <input className={inputCls} value={form.duration} onChange={set("duration")} placeholder="e.g. 12 weeks" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Cover color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-10 w-14 rounded-lg border border-gray-200 bg-white p-1"
                value={form.coverColor}
                onChange={set("coverColor")}
                aria-label="Cover color picker"
              />
              <input
                className={inputCls}
                value={form.coverColor}
                onChange={set("coverColor")}
                placeholder="#2D6A4F"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">Use a hex value or the picker.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, coverColor: color }))}
                  className="h-6 w-6 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: color }}
                  aria-label={`Set cover color to ${color}`}
                />
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Spine color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-10 w-14 rounded-lg border border-gray-200 bg-white p-1"
                value={form.spineColor}
                onChange={set("spineColor")}
                aria-label="Spine color picker"
              />
              <input
                className={inputCls}
                value={form.spineColor}
                onChange={set("spineColor")}
                placeholder="#1B4332"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">Use a hex value or the picker.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Instructor</label>
            {lockInstructorId ? (
              <input className={inputCls} value={lecturers.find((l) => l.id === lockInstructorId)?.name || ""} disabled />
            ) : (
              <select className={inputCls} value={form.instructorId} onChange={set("instructorId")}>
                <option value="">Unassigned</option>
                {lecturers.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className={labelCls}>Tags (comma separated)</label>
            <input className={inputCls} value={form.tags} onChange={set("tags")} placeholder="Python, Scripting, Beginner" />
          </div>
        </div>

        <div>
          <label className={labelCls}>Learning paths</label>
          <div className="flex flex-wrap gap-4">
            {PATH_OPTIONS.map((p) => (
              <label key={p.key} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.paths.includes(p.key)}
                  onChange={() => togglePath(p.key)}
                  className="rounded border-gray-300 text-gray-900 focus:ring-gray-900/10"
                />
                {p.label}
              </label>
            ))}
          </div>
        </div>

        {form.paths.includes("interactive") && (
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Interactive price (USD)</label>
              <input type="number" min="0" step="0.01" className={inputCls} value={form.interactivePrice} onChange={set("interactivePrice")} placeholder="24.99" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>AI agent link</label>
              <input type="url" className={inputCls} value={form.aiAgentUrl} onChange={set("aiAgentUrl")}
                placeholder="https://your-ai-agent.example.com/chat" />
              <p className="mt-1 text-xs text-gray-400">Embedded in the AI guide panel on Interactive lessons. Empty = built-in demo chat.</p>
            </div>
          </div>
        )}

        <div>
          <label className={labelCls}>Description</label>
          <textarea className={inputCls} rows={3} value={form.description} onChange={set("description")} placeholder="What will students learn?" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800">Lessons ({lessons.length})</h2>
          <button type="button" onClick={addLesson}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900">
            <Plus className="h-3.5 w-3.5" /> Add lesson
          </button>
        </div>

        {lessons.length === 0 ? (
          <p className="text-sm text-gray-400">No lessons yet — add one above.</p>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, i) => (
              <LessonEditor
                key={i}
                lesson={lesson}
                index={i}
                paths={form.paths}
                onChange={updateLesson}
                onRemove={removeLesson}
                onMove={moveLesson}
                isFirst={i === 0}
                isLast={i === lessons.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 transition-colors">
          {isNew ? "Create course" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
