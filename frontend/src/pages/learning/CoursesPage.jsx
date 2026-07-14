import { COURSE_CATEGORIES } from "../../data/courses";
import { useCourseFilter } from "../../hooks/learning/useCourseFilter";
import CourseCard from "../../components/learning/ui/CourseCard";

const CONTAINER = "mx-auto w-full max-w-[1200px] px-8 max-sm:px-4";

export default function CoursesPage() {
  const { active, setActive, filtered, loading } = useCourseFilter();

  return (
    <div className="bg-paper font-body">
      {/* Page header */}
      <div className="border-b border-oxblood/15 bg-paper-deep pb-8 pt-16">
        <div className={CONTAINER}>
          <h1 className="mb-3 font-display text-[clamp(2rem,4vw,3rem)] leading-tight text-ink">
            The Course Library
          </h1>
          <p className="mb-6 text-base text-ink-soft">
            {loading
              ? "Opening the library…"
              : filtered.length > 0
                ? `${filtered.length} volumes across programming, robotics, and AI — each a complete learning journey.`
                : "No courses match the selected category yet."}
          </p>

          {/* Category filters */}
          <div className="mt-2 flex flex-wrap gap-2">
            {COURSE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm transition-colors duration-150 ${
                  active === cat
                    ? "border-oxblood bg-oxblood text-paper"
                    : "border-ink/25 bg-transparent text-ink-soft hover:border-oxblood hover:text-oxblood"
                }`}
                onClick={() => setActive(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Book grid */}
      <section className="bg-[#F6ECD3] py-20 max-sm:py-12">
        <div className={CONTAINER}>
          <p className="mb-6 text-sm text-ink-soft">
            Showing {filtered.length} course{filtered.length !== 1 ? "s" : ""}
            {active !== "All" ? ` in ${active}` : ""}
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] justify-items-center gap-8 max-sm:grid-cols-1">
            {filtered.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
