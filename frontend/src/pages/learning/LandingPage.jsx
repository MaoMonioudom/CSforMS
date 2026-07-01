import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BookOpen, Clock, Users, Search, ChevronRight, ArrowRight, Star, Bookmark, LayoutGrid, List } from "lucide-react";
import { TopNav } from "../../components/TopNav";
import { AppFooter } from "../../components/AppFooter";

// ── Palette ────────────────────────────────────────────────────────────────────
const RED    = "#c0392b";
const RED_DK = "#922b21";

// ── Mock data ──────────────────────────────────────────────────────────────────
const COURSES = [
  {
    id: 1, title: "Introduction to Electronics",
    category: "Hardware", chapters: 12, duration: "8h 30m",
    students: 243, rating: 4.8, progress: 0,
    spine: "#8b1a1a", cover: "#c0392b",
    desc: "Understand circuits, components, and how to read schematics from scratch.",
    tags: ["Beginner", "Circuits", "Components"],
  },
  {
    id: 2, title: "Web Development Fundamentals",
    category: "Software", chapters: 18, duration: "14h 20m",
    students: 389, rating: 4.9, progress: 65,
    spine: "#6b1111", cover: "#922b21",
    desc: "HTML, CSS, JavaScript — build your first interactive web projects.",
    tags: ["Beginner", "HTML", "JavaScript"],
  },
  {
    id: 3, title: "3D Printing & Design",
    category: "Fabrication", chapters: 8, duration: "6h 10m",
    students: 156, rating: 4.6, progress: 30,
    spine: "#5c2d0d", cover: "#8b4513",
    desc: "Model, slice, and print your ideas with FDM printers and CAD tools.",
    tags: ["Intermediate", "CAD", "Printing"],
  },
  {
    id: 4, title: "Python for Makers",
    category: "Software", chapters: 15, duration: "11h 45m",
    students: 512, rating: 4.9, progress: 0,
    spine: "#0e2e42", cover: "#1a5276",
    desc: "Automate, control hardware, and analyze data with Python.",
    tags: ["Beginner", "Python", "Automation"],
  },
  {
    id: 5, title: "IoT & Connectivity",
    category: "Hardware", chapters: 10, duration: "9h 00m",
    students: 198, rating: 4.7, progress: 0,
    spine: "#0a3219", cover: "#145a32",
    desc: "Connect microcontrollers to the cloud with MQTT, Wi-Fi, and sensors.",
    tags: ["Intermediate", "ESP32", "MQTT"],
  },
  {
    id: 6, title: "PCB Design Basics",
    category: "Hardware", chapters: 9, duration: "7h 15m",
    students: 134, rating: 4.5, progress: 0,
    spine: "#2c1535", cover: "#4a235a",
    desc: "Design and fabricate your first printed circuit board with KiCad.",
    tags: ["Intermediate", "KiCad", "PCB"],
  },
];

const CATEGORIES = ["All", "Hardware", "Software", "Fabrication"];

// ── Book SVG illustration ──────────────────────────────────────────────────────
function BookIllustration() {
  const books = [
    { x: 60,  w: 38, h: 160, color: "#c0392b", spine: "#8b1a1a",  tilt: 0   },
    { x: 100, w: 32, h: 145, color: "#1a5276", spine: "#0e2e42",  tilt: -3  },
    { x: 134, w: 36, h: 170, color: "#145a32", spine: "#0a3219",  tilt: 0   },
    { x: 172, w: 28, h: 138, color: "#6c3483", spine: "#4a235a",  tilt: 2   },
    { x: 202, w: 40, h: 155, color: "#8b4513", spine: "#5c2d0d",  tilt: -1  },
    { x: 244, w: 30, h: 148, color: "#7b241c", spine: "#521610",  tilt: 0   },
    { x: 276, w: 36, h: 162, color: "#1a3a5c", spine: "#0d1f30",  tilt: 1   },
  ];
  const shelf = 200;
  return (
    <svg viewBox="0 0 400 230" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto">
      {/* Shelf shadow */}
      <rect x="40" y={shelf + 12} width="320" height="8" rx="2" fill="rgba(0,0,0,0.18)" />
      {/* Shelf wood */}
      <rect x="40" y={shelf} width="320" height="12" rx="2" fill="#8B6914" />
      <rect x="40" y={shelf} width="320" height="3" rx="1" fill="rgba(255,255,255,0.15)" />

      {books.map((b, i) => {
        const top = shelf - b.h;
        return (
          <g key={i} transform={`rotate(${b.tilt}, ${b.x + b.w / 2}, ${shelf})`}>
            {/* Spine shadow */}
            <rect x={b.x + b.w - 4} y={top} width={5} height={b.h} fill="rgba(0,0,0,0.22)" />
            {/* Cover */}
            <rect x={b.x} y={top} width={b.w} height={b.h} fill={b.color} rx="1" />
            {/* Spine stripe */}
            <rect x={b.x} y={top} width={6} height={b.h} fill={b.spine} />
            {/* Page edge */}
            <rect x={b.x + b.w - 3} y={top + 2} width={3} height={b.h - 4} fill="#f0ead6" />
            {/* Cover lines */}
            <rect x={b.x + 10} y={top + 16} width={b.w - 18} height={2} rx="1" fill="rgba(255,255,255,0.4)" />
            <rect x={b.x + 10} y={top + 22} width={b.w - 22} height={1} rx="0.5" fill="rgba(255,255,255,0.2)" />
          </g>
        );
      })}

      {/* Lamp */}
      <rect x="310" y="110" width="5" height="90" rx="2" fill="#888" />
      <ellipse cx="312" cy="110" rx="30" ry="8" fill="#e8c84a" opacity="0.9" />
      <polygon points="282,110 342,110 334,140 290,140" fill="#e8c84a" opacity="0.7" />
      <ellipse cx="312" cy="140" rx="30" ry="6" fill="rgba(232,200,74,0.25)" />

      {/* Floating particles */}
      {[[100, 40], [200, 20], [260, 55], [155, 60]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="rgba(192,57,43,0.25)" />
      ))}
    </svg>
  );
}

// ── Course card (book style) ───────────────────────────────────────────────────
function CourseCard({ course }) {
  return (
    <div className="group flex gap-4 rounded-2xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-lg">
      {/* Book spine visual */}
      <div
        className="shrink-0 w-3 rounded self-stretch"
        style={{ background: `linear-gradient(180deg, ${course.cover}, ${course.spine})` }}
      />
      {/* Book cover mini */}
      <div
        className="shrink-0 w-12 h-16 rounded-sm flex items-center justify-center"
        style={{ background: course.cover }}
      >
        <BookOpen size={18} color="rgba(255,255,255,0.8)" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-extrabold text-sm leading-tight text-neutral-900 group-hover:text-red-700 transition-colors line-clamp-2">
            {course.title}
          </h3>
          {course.progress > 0 && (
            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
              {course.progress}%
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-500 line-clamp-2 mb-2">{course.desc}</p>

        {/* Progress bar */}
        {course.progress > 0 && (
          <div className="h-1 w-full rounded-full bg-neutral-100 mb-2">
            <div className="h-full rounded-full" style={{ width: `${course.progress}%`, background: RED }} />
          </div>
        )}

        <div className="flex items-center gap-3 text-[10px] text-neutral-400 font-medium flex-wrap">
          <span className="flex items-center gap-1"><Clock size={10} /> {course.duration}</span>
          <span className="flex items-center gap-1"><BookOpen size={10} /> {course.chapters} ch.</span>
          <span className="flex items-center gap-1"><Users size={10} /> {course.students}</span>
          <span className="flex items-center gap-1 text-amber-500"><Star size={10} fill="currentColor" /> {course.rating}</span>
        </div>
      </div>

      <div className="shrink-0 flex items-center">
        <ChevronRight size={16} className="text-neutral-300 group-hover:text-red-600 transition-colors" />
      </div>
    </div>
  );
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function Stat({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-extrabold" style={{ color: RED }}>{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5 font-medium">{label}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LearningLandingPage() {
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState("All");
  const [query, setQuery]       = useState(searchParams.get("q") || "");

  useEffect(() => { setQuery(searchParams.get("q") || ""); }, [searchParams]);

  const filtered = COURSES.filter(c =>
    (category === "All" || c.category === category) &&
    (!query || c.title.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div style={{ minHeight: "100vh", background: "#faf8f5" }}>
      <TopNav />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-10 pb-0"
        style={{ background: "linear-gradient(160deg, #1a0a06 0%, #3d1008 60%, #6b1111 100%)" }}
      >
        {/* Subtle page-texture overlay */}
        <div aria-hidden className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 32px)" }} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center pb-16">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ background: "rgba(192,57,43,0.2)", color: "#e88070", border: "1px solid rgba(192,57,43,0.35)" }}>
                <BookOpen size={10} /> Room B02 — Learning Module
              </div>
              <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight text-white mb-4">
                The Digital<br />
                <span style={{ color: "#e88070" }}>Library.</span>
              </h1>
              <p className="text-base text-white/55 leading-relaxed max-w-md mb-8">
                Courses built like books — every module is a volume, every topic a chapter.
                Learn at your own pace and track progress like turning pages.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white"
                  style={{ background: RED }}>
                  Browse Courses <ArrowRight size={14} />
                </button>
                <Link to="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
                  style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}>
                  Back to Hub
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <BookIllustration />
            </div>
          </div>

          {/* Stats strip */}
          <div className="border-t border-white/10 py-6 grid grid-cols-3 gap-4 text-center">
            {[
              { value: `${COURSES.length}`, label: "Courses available" },
              { value: "1,632",             label: "Enrolled students" },
              { value: "72",                label: "Chapters published" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-white/45 mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Course shelf ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900">Course Shelf</h2>
            <p className="text-sm text-neutral-500 mt-0.5">{filtered.length} titles found</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Category tabs */}
            <div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={category === cat
                    ? { background: RED, color: "#fff" }
                    : { color: "#666" }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                placeholder="Search courses…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="pl-8 pr-3 py-2 rounded-full border border-neutral-200 bg-white text-xs outline-none focus:border-red-300 w-44"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => <CourseCard key={c.id} course={c} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-neutral-400">
            <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No courses match your search.</p>
          </div>
        )}
      </section>

      {/* ── In-progress strip ───────────────────────────────────────────── */}
      {COURSES.filter(c => c.progress > 0).length > 0 && (
        <section style={{ background: "#fff", borderTop: "1px solid #f0ece6" }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <h2 className="text-lg font-extrabold text-neutral-900 mb-4">Continue Reading</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {COURSES.filter(c => c.progress > 0).map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          </div>
        </section>
      )}

      <AppFooter />
    </div>
  );
}
