import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { normalizeLessonBody } from "../../../utils/format";

const inputCls = "w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-border";
const errorInputCls = "w-full rounded-lg border border-red-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-400";
const labelCls = "block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5";
const fieldErrorCls = "mt-1 text-xs text-red-500";

function RequiredLabel({ children }) {
  return (
    <label className={labelCls}>
      {children} <span className="text-red-400">*</span>
    </label>
  );
}

const PATH_OPTIONS = [
  { key: "basic", label: "Basic" },
  { key: "stepByStep", label: "Step-by-step" },
  { key: "interactive", label: "Interactive" },
];

const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
// Values must match the backend's lesson_type CHECK constraint (lowercase).
const LESSON_TYPES = [
  { value: "video", label: "Video" },
  { value: "reading", label: "Reading" },
  { value: "lab", label: "Lab" },
  { value: "project", label: "Project" },
];
const COLOR_PRESETS = ["#2D6A4F", "#7B2D8B", "#C9600A", "#1A5276", "#7D6608", "#1B6B5A"];
const HEX_COLOR_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const MAX_LENGTHS = { title: 255, subtitle: 255, category: 100, duration: 50 };

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

function LessonEditor({ lesson, index, paths, error, onChange, onRemove, onMove, isFirst, isLast }) {
  const set = (field) => (e) => onChange(index, { ...lesson, [field]: e.target.value });

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">Lesson {index + 1}</p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onMove(index, -1)} disabled={isFirst}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded disabled:opacity-30 disabled:hover:bg-transparent">
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => onMove(index, 1)} disabled={isLast}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded disabled:opacity-30 disabled:hover:bg-transparent">
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => onRemove(index)}
            className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <RequiredLabel>Title</RequiredLabel>
          <input className={error?.title ? errorInputCls : inputCls} value={lesson.title} onChange={set("title")} placeholder="Lesson title" />
          {error?.title && <p className={fieldErrorCls}>{error.title}</p>}
        </div>
        <div>
          <RequiredLabel>Duration</RequiredLabel>
          <input className={error?.duration ? errorInputCls : inputCls} value={lesson.duration} onChange={set("duration")} placeholder="e.g. 45 min" />
          {error?.duration && <p className={fieldErrorCls}>{error.duration}</p>}
        </div>
      </div>

      <div>
        <label className={labelCls}>Type</label>
        <select className={inputCls} value={lesson.type} onChange={set("type")}>
          {LESSON_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div>
        <RequiredLabel>Basic content</RequiredLabel>
        <textarea className={error?.body ? errorInputCls : inputCls} rows={4} value={lesson.body} onChange={set("body")}
          placeholder="The lesson as plain reading material (shown on the Basic path)" />
        {error?.body && <p className={fieldErrorCls}>{error.body}</p>}
      </div>

      {paths.includes("stepByStep") && (
        <div>
          <label className={labelCls}>Step-by-step — one step per line</label>
          <textarea className={inputCls} rows={4} value={lesson.stepsBody} onChange={set("stepsBody")}
            placeholder={"Install Python from python.org\nOpen VS Code and create hello.py\nRun the script from the terminal"} />
          <p className="mt-1 text-xs text-muted-foreground">Each line becomes one checklist step. Empty = steps are made from the Basic content's lines.</p>
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
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};

    if (!form.title.trim()) errs.title = "Title is required.";
    else if (form.title.trim().length > MAX_LENGTHS.title) errs.title = `Title must be ${MAX_LENGTHS.title} characters or fewer.`;

    if (form.subtitle.trim().length > MAX_LENGTHS.subtitle) errs.subtitle = `Subtitle must be ${MAX_LENGTHS.subtitle} characters or fewer.`;

    if (!form.category.trim()) errs.category = "Category is required.";
    else if (form.category.trim().length > MAX_LENGTHS.category) errs.category = `Category must be ${MAX_LENGTHS.category} characters or fewer.`;

    if (!form.duration.trim()) errs.duration = "Duration is required.";
    else if (form.duration.trim().length > MAX_LENGTHS.duration) errs.duration = `Duration must be ${MAX_LENGTHS.duration} characters or fewer.`;

    if (!form.description.trim()) errs.description = "Description is required.";

    if (form.coverColor.trim() && !HEX_COLOR_RE.test(form.coverColor.trim())) errs.coverColor = "Enter a valid hex color, e.g. #2D6A4F.";
    if (form.spineColor.trim() && !HEX_COLOR_RE.test(form.spineColor.trim())) errs.spineColor = "Enter a valid hex color, e.g. #1B4332.";

    if (form.paths.length === 0) errs.paths = "Select at least one learning path.";

    if (form.paths.includes("interactive")) {
      if (form.interactivePrice !== "") {
        const price = Number(form.interactivePrice);
        if (Number.isNaN(price) || price < 0) errs.interactivePrice = "Enter a valid, non-negative price.";
      }
      if (form.aiAgentUrl.trim()) {
        try {
          new URL(form.aiAgentUrl.trim());
        } catch {
          errs.aiAgentUrl = "Enter a valid URL, e.g. https://example.com/chat.";
        }
      }
    }

    const lessonErrors = lessons.map((l) => {
      const le = {};
      if (!l.title.trim()) le.title = "Lesson title is required.";
      if (!l.duration.trim()) le.duration = "Duration is required.";
      if (!l.body.trim()) le.body = "Basic content is required.";
      return Object.keys(le).length ? le : null;
    });
    if (lessonErrors.some(Boolean)) errs.lessons = lessonErrors;

    return errs;
  };

  const togglePath = (key) => {
    setForm((f) => ({
      ...f,
      paths: f.paths.includes(key) ? f.paths.filter((p) => p !== key) : [...f.paths, key],
    }));
  };

  const addLesson = () => setLessons((l) => [...l, emptyLesson()]);
  const updateLesson = (index, next) => {
    setLessons((l) => l.map((ls, i) => (i === index ? next : ls)));
    if (errors.lessons?.[index]) {
      setErrors((er) => ({
        ...er,
        lessons: er.lessons.map((le, i) => (i === index ? null : le)),
      }));
    }
  };
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
    setError("");

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      setError("Please fix the highlighted fields below.");
      return;
    }
    setErrors({});

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

      <div className="bg-white rounded-xl border border-border p-5 space-y-4">
        <h2 className="text-sm font-bold text-foreground">Course details</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <RequiredLabel>Title</RequiredLabel>
            <input className={errors.title ? errorInputCls : inputCls} value={form.title} onChange={set("title")} placeholder="Course title" autoFocus />
            {errors.title && <p className={fieldErrorCls}>{errors.title}</p>}
          </div>
          <div>
            <label className={labelCls}>Subtitle</label>
            <input className={errors.subtitle ? errorInputCls : inputCls} value={form.subtitle} onChange={set("subtitle")} placeholder="Short tagline" />
            {errors.subtitle && <p className={fieldErrorCls}>{errors.subtitle}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <RequiredLabel>Category</RequiredLabel>
            <input className={errors.category ? errorInputCls : inputCls} value={form.category} onChange={set("category")} placeholder="e.g. Programming" />
            {errors.category && <p className={fieldErrorCls}>{errors.category}</p>}
          </div>
          <div>
            <label className={labelCls}>Level</label>
            <select className={inputCls} value={form.level} onChange={set("level")}>
              {LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <RequiredLabel>Duration</RequiredLabel>
            <input className={errors.duration ? errorInputCls : inputCls} value={form.duration} onChange={set("duration")} placeholder="e.g. 12 weeks" />
            {errors.duration && <p className={fieldErrorCls}>{errors.duration}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Cover color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-10 w-14 rounded-lg border border-border bg-white p-1"
                value={form.coverColor}
                onChange={set("coverColor")}
                aria-label="Cover color picker"
              />
              <input
                className={errors.coverColor ? errorInputCls : inputCls}
                value={form.coverColor}
                onChange={set("coverColor")}
                placeholder="#2D6A4F"
              />
            </div>
            {errors.coverColor ? (
              <p className={fieldErrorCls}>{errors.coverColor}</p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">Use a hex value or the picker.</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, coverColor: color }))}
                  className="h-6 w-6 rounded-full border border-border shadow-sm"
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
                className="h-10 w-14 rounded-lg border border-border bg-white p-1"
                value={form.spineColor}
                onChange={set("spineColor")}
                aria-label="Spine color picker"
              />
              <input
                className={errors.spineColor ? errorInputCls : inputCls}
                value={form.spineColor}
                onChange={set("spineColor")}
                placeholder="#1B4332"
              />
            </div>
            {errors.spineColor ? (
              <p className={fieldErrorCls}>{errors.spineColor}</p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">Use a hex value or the picker.</p>
            )}
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
          <RequiredLabel>Learning paths</RequiredLabel>
          <div className="flex flex-wrap gap-4">
            {PATH_OPTIONS.map((p) => (
              <label key={p.key} className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.paths.includes(p.key)}
                  onChange={() => {
                    togglePath(p.key);
                    if (errors.paths) setErrors((er) => ({ ...er, paths: undefined }));
                  }}
                  className="rounded border-border text-foreground focus:ring-gray-900/10"
                />
                {p.label}
              </label>
            ))}
          </div>
          {errors.paths && <p className={fieldErrorCls}>{errors.paths}</p>}
        </div>

        {form.paths.includes("interactive") && (
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Interactive price (USD)</label>
              <input type="number" min="0" step="0.01" className={errors.interactivePrice ? errorInputCls : inputCls} value={form.interactivePrice} onChange={set("interactivePrice")} placeholder="24.99" />
              {errors.interactivePrice && <p className={fieldErrorCls}>{errors.interactivePrice}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>AI agent link</label>
              <input type="url" className={errors.aiAgentUrl ? errorInputCls : inputCls} value={form.aiAgentUrl} onChange={set("aiAgentUrl")}
                placeholder="https://your-ai-agent.example.com/chat" />
              {errors.aiAgentUrl ? (
                <p className={fieldErrorCls}>{errors.aiAgentUrl}</p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Embedded in the AI guide panel on Interactive lessons. Empty = built-in demo chat.</p>
              )}
            </div>
          </div>
        )}

        <div>
          <RequiredLabel>Description</RequiredLabel>
          <textarea className={errors.description ? errorInputCls : inputCls} rows={3} value={form.description} onChange={set("description")} placeholder="What will students learn?" />
          {errors.description && <p className={fieldErrorCls}>{errors.description}</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Lessons ({lessons.length})</h2>
          <button type="button" onClick={addLesson}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-foreground">
            <Plus className="h-3.5 w-3.5" /> Add lesson
          </button>
        </div>

        {lessons.length === 0 ? (
          <p className="text-sm text-muted-foreground">No lessons yet — add one above.</p>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, i) => (
              <LessonEditor
                key={i}
                lesson={lesson}
                index={i}
                paths={form.paths}
                error={errors.lessons?.[i]}
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
          className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-foreground hover:bg-foreground transition-colors">
          {isNew ? "Create course" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
