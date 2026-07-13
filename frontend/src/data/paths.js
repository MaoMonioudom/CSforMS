/**
 * Learning path types a course can offer. Which paths a given course
 * exposes is declared per-course via `course.paths` in data/courses.js.
 */
export const PATH_TYPES = {
  basic: {
    id: "basic",
    label: "Basic",
    icon: "📘",
    tagline: "Read at your own pace",
    free: true,
  },
  stepByStep: {
    id: "stepByStep",
    label: "Step-by-Step",
    icon: "🪜",
    tagline: "Guided, one step at a time",
    free: true,
  },
  interactive: {
    id: "interactive",
    label: "Interactive",
    icon: "🤖",
    tagline: "AI-guided walkthroughs",
    free: false,
  },
};

export const PATH_ORDER = ["basic", "stepByStep", "interactive"];
