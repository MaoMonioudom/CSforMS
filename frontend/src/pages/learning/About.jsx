import { Link } from "react-router-dom";

const VALUES = [
  {
    icon: "🎯",
    title: "Path of Courses",
    desc: "We offer three learning paths: Basic, Step by Step, and Interactive.",
  },
  {
    icon: "🔨",
    title: "Basic Path",
    desc: "Learn the fundamentals of each course, free of charge.",
  },
  {
    icon: "🪜",
    title: "Step by Step Path",
    desc: "Similar to the Basic Path, but with more hands-on activities that walk you through each step in a guided flow.",
  },
  {
    icon: "💵",
    title: "Interactive Path",
    desc: "In this path, students pay to learn with AI support. An AI agent helps students as they study and answers their questions along the way.",
  },
];

const CONTAINER = "mx-auto w-full max-w-[1200px] px-8 max-sm:px-4";
const EYEBROW =
  "mb-3 block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-gold";

export default function About() {
  return (
    <div className="font-body">
      {/* Hero */}
      <div className="border-b border-gold/15 bg-navy pb-16 pt-20">
        <div className={`${CONTAINER} !max-w-[720px]`}>
          <span className={EYEBROW}>Our Story</span>
          <h1 className="mb-4 mt-2 font-display text-[clamp(2rem,4vw,3rem)] leading-tight text-parchment">
            Learning should feel like discovery, not obligation.
          </h1>
          <p className="text-base leading-[1.8] text-navy-muted">
            Makerspace Learning was born from a simple idea: the best way to learn
            technology is to treat it like a great book, something you pick up
            with curiosity and can't put down.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="bg-navy-deep py-20 max-sm:py-12">
        <div className={`${CONTAINER} grid grid-cols-2 items-start gap-12 max-[900px]:grid-cols-1`}>
          {/* Story text */}
          <div>
            <h2 className="mb-4 font-display text-[1.6rem] text-parchment">Why we built this</h2>
            <p className="mb-4 text-[0.9rem] leading-[1.8] text-navy-muted">
              Most online learning platforms overwhelm learners with endless
              lists and fragmented content. We believed there was a better
              way, one inspired by the quiet focus of a library.
            </p>
            <p className="mb-4 text-[0.9rem] leading-[1.8] text-navy-muted">
              Each course is structured like a well-written book: with a clear
              beginning, a narrative arc, and a satisfying conclusion. You
              always know where you are, how far you've come, and what comes
              next.
            </p>
            <p className="mb-4 text-[0.9rem] leading-[1.8] text-navy-muted">
              Our instructors are practitioners who have built real things,
              robots, web applications, machine learning models, and they
              teach from that experience.
            </p>
            <Link
              to="/learning/courses"
              className="mt-8 inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-gold px-7 py-[13px] text-[0.9rem] font-semibold text-navy transition-all duration-300 hover:-translate-y-px hover:bg-gold-light"
            >
              Explore the Library
            </Link>
          </div>

          {/* Values */}
          <div className="flex flex-col gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded border border-gold/15 bg-navy p-5">
                <div className="mb-2 text-2xl">{v.icon}</div>
                <h3 className="mb-1 font-display text-base text-parchment">{v.title}</h3>
                <p className="text-sm leading-[1.65] text-navy-muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
