const SHELF_BOOKS = [
  { color: "#5C1A2E", height: 200, title: "Python"   }, // wine leather
  { color: "#1F3A3A", height: 220, title: "Robotics" }, // deep teal leather
  { color: "#6B3A12", height: 190, title: "Web Dev"  }, // chestnut leather
  { color: "#1F3A5F", height: 235, title: "ML"       }, // navy leather
  { color: "#5B4A1E", height: 205, title: "Arduino"  }, // olive-gold leather
  { color: "#2F4F3E", height: 215, title: "React"    }, // forest leather
  { color: "#4A2E1F", height: 180, title: "ROS"      }, // saddle brown leather
  { color: "#7C2A22", height: 195, title: "Circuits" }, // oxblood leather
];

// Leather grain noise texture, blended over each book cover
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")";

export default function HeroShelf() {
  return (
    <div
      aria-hidden="true"
      className="relative hidden items-end justify-center gap-1.5 p-8 min-[900px]:flex after:absolute after:bottom-7 after:left-[5%] after:h-1.5 after:w-[90%] after:rounded-sm after:bg-[linear-gradient(90deg,#6B4A1E,#C9A84C,#6B4A1E)] after:shadow-[0_4px_12px_rgba(88,58,26,0.35)] after:content-['']"
    >
      {SHELF_BOOKS.map((book) => (
        <div
          key={book.title}
          className="relative flex w-11 cursor-pointer items-center justify-center overflow-hidden rounded-[3px_1px_1px_3px] shadow-[3px_3px_14px_rgba(60,38,20,0.35),inset_0_0_18px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:-translate-y-3"
          style={{ height: book.height, background: book.color }}
        >
          {/* leather grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-50 mix-blend-overlay"
            style={{ backgroundImage: GRAIN }}
          />
          {/* embossed gold spine line */}
          <div className="absolute inset-y-0 left-0 w-[5px] rounded-l-[3px] bg-[linear-gradient(180deg,#C9A84C,#8B6914_45%,#C9A84C_90%)] shadow-[inset_-1px_0_1px_rgba(0,0,0,0.3)]" />
          {/* gilt bands top + bottom */}
          <div className="absolute left-[5px] right-0 top-0 h-[5px] bg-[linear-gradient(180deg,#E8D9A8,#C9A84C)]" />
          <span className="relative z-[1] rotate-180 px-1 py-3 font-display text-[0.6rem] font-semibold leading-[1.2] tracking-[0.08em] text-[#E8D9A8] [writing-mode:vertical-rl] [text-orientation:mixed] [text-shadow:0_1px_0_rgba(0,0,0,0.5),0_0_6px_rgba(201,168,76,0.25)]">
            {book.title}
          </span>
          <div className="absolute bottom-0 left-[5px] right-0 h-[5px] bg-[linear-gradient(180deg,#E8D9A8,#C9A84C)]" />
        </div>
      ))}
    </div>
  );
}
