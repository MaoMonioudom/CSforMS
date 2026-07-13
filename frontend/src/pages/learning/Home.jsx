import { Link } from "react-router-dom";
import { getAllCourses } from "../../data/courseStore";
import SectionHeader from "../../components/learning/ui/SectionHeader";
import HeroShelf from "../../components/learning/ui/HeroShelf";
import CourseCard from "../../components/learning/ui/CourseCard";
import { formatNumber } from "../../utils/format";

const HOW_STEPS = [
  { icon: "🔍", title: "Browse",    desc: "Explore our shelves and find the course that calls to you." },
  { icon: "📖", title: "Open",      desc: "Click any course to open the book and view the full curriculum." },
  { icon: "✍️", title: "Enroll",   desc: "Enroll and begin working through chapters at your own pace." },
  { icon: "🎓", title: "Graduate",  desc: "Complete lessons, build projects, and earn your certificate." },
];

// Warm paper-grain noise laid over the hero
const PAPER_GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.55  0 0 0 0 0.42  0 0 0 0 0.26  0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Deckled / torn-paper edge where the hero tears into the next section
const TEAR_CLIP =
  "polygon(0% 60%, 3% 20%, 6% 70%, 9% 30%, 12% 80%, 15% 10%, 18% 55%, 21% 25%, 24% 75%, 27% 15%, 30% 60%, 33% 35%, 36% 85%, 39% 20%, 42% 65%, 45% 30%, 48% 75%, 51% 10%, 54% 55%, 57% 25%, 60% 80%, 63% 20%, 66% 60%, 69% 30%, 72% 85%, 75% 15%, 78% 65%, 81% 35%, 84% 75%, 87% 10%, 90% 55%, 93% 25%, 96% 70%, 100% 20%, 100% 100%, 0% 100%)";

const CONTAINER = "mx-auto w-full max-w-[1200px] px-8 max-sm:px-4";
const BTN =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded px-7 py-[13px] font-body text-[0.9rem] font-semibold transition-all duration-300";

export default function Home() {
  const courses = getAllCourses();
  const featured = courses.slice(0, 3);
  const totalStudents = courses.reduce((sum, c) => sum + c.students, 0);
  const avgRating = courses.reduce((sum, c) => sum + c.rating, 0) / courses.length;
  const stats = [
    { value: `${courses.length}+`, label: "Courses" },
    { value: `${formatNumber(Math.round(totalStudents / 100) * 100)}+`, label: "Students" },
    { value: `${avgRating.toFixed(1)}★`, label: "Avg Rating" },
  ];

  return (
    <div className="bg-paper font-body">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[linear-gradient(160deg,#F4E8CB_0%,#EAD9AC_100%)] pb-16 pt-20 max-sm:py-12">
        {/* paper grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50 mix-blend-multiply"
          style={{ backgroundImage: PAPER_GRAIN }}
        />
        <div className={`${CONTAINER} relative z-[1] grid grid-cols-2 items-center gap-16 max-[900px]:grid-cols-1`}>
          <div>
            <span className="mb-5 inline-block rounded-full border border-oxblood/35 bg-oxblood/[0.06] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-oxblood">
              The Learning Library
            </span>
            <h1 className="mb-5 font-display text-[clamp(2.2rem,5vw,3.5rem)] leading-[1.15] text-ink">
              Where <em className="italic text-oxblood">curious minds</em>
              <br />come to master
              <br />technology.
            </h1>
            <p className="mb-8 max-w-[480px] text-[1.05rem] leading-[1.8] text-ink-soft">
              A curated collection of programming, robotics, and AI courses,
              presented as books in a library. Open one and start your journey.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/learning/courses"
                className={`${BTN} border border-oxblood bg-oxblood text-paper hover:border-oxblood-deep hover:bg-oxblood-deep`}
              >
                Browse the Library
              </Link>
              <Link
                to="/learning/about"
                className={`${BTN} border border-ink/35 bg-transparent text-ink hover:border-oxblood hover:text-oxblood`}
              >
                Our Story
              </Link>
            </div>
            <div className="mt-10 flex gap-8 border-t border-ink/[0.12] pt-8 max-sm:gap-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <span className="block font-display text-[1.6rem] font-bold text-ink">{s.value}</span>
                  <span className="mt-0.5 block text-[0.65rem] uppercase tracking-[0.08em] text-ink-soft">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <HeroShelf />
        </div>
        {/* torn-paper edge */}
        <div
          aria-hidden="true"
          className="absolute -bottom-px left-0 right-0 h-[22px] bg-[#F6ECD3] max-sm:h-3.5"
          style={{ clipPath: TEAR_CLIP }}
        />
      </section>

      {/* ── Featured courses ── */}
      <section className="bg-[#F6ECD3] py-20 max-sm:py-12">
        <div className={CONTAINER}>
          <SectionHeader
            tone="light"
            eyebrow="Featured Titles"
            title="Staff Picks This Term"
            subtitle="Handpicked courses our instructors recommend for beginners and seasoned learners alike."
          />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] justify-items-center gap-8 max-sm:grid-cols-1">
            {featured.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
          <div className="mt-12 text-center">
            <Link
              to="/learning/courses"
              className={`${BTN} border border-oxblood bg-oxblood text-paper hover:border-oxblood-deep hover:bg-oxblood-deep`}
            >
              View All Courses →
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-paper-deep py-20 max-sm:py-12">
        <div className={CONTAINER}>
          <SectionHeader
            tone="light"
            eyebrow="How It Works"
            title="Simple as Picking Up a Book"
          />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8">
            {HOW_STEPS.map((step) => (
              <div key={step.title} className="rounded border border-ink/10 bg-paper p-6">
                <div className="mb-3 text-[1.6rem]">{step.icon}</div>
                <h3 className="mb-2 font-display text-ink">{step.title}</h3>
                <p className="leading-[1.7] text-ink-soft">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
