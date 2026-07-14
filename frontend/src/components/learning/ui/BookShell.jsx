// Leather grain noise texture, blended over the cover
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")";

/**
 * Shared leather-bound book visual with 3-D page-turn hover.
 * Horizontal orientation: spine along the top edge, cover below,
 * gilt page edges along the bottom.
 * Used by BookCard (course) and LessonBookCard (lesson).
 */
export default function BookShell({
  spineColor,
  coverColor,
  category,
  badge,
  title,
  subtitle,
  meta,
  onClick,
  ariaLabel,
}) {
  return (
    <article
      className="group cursor-pointer outline-none [perspective:1200px]"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="relative aspect-[4.4/3] w-full max-sm:aspect-[4/3]">
        <div className="absolute inset-0 flex origin-top flex-col overflow-hidden rounded-[3px_3px_6px_6px] shadow-[6px_4px_18px_rgba(60,38,20,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-[transform,box-shadow] duration-[450ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] [transform-style:preserve-3d] group-hover:shadow-[14px_10px_26px_rgba(60,38,20,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] group-hover:[transform:rotateX(-8deg)_translateY(-2px)] group-focus-visible:shadow-[0_0_0_3px_#7C2A22] group-focus-visible:[transform:rotateX(-8deg)_translateY(-2px)]">
          {/* Spine with gilt edges */}
          <div
            className="relative h-3.5 shrink-0 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.35)] after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(201,168,76,0.5),transparent_12%,transparent_88%,rgba(201,168,76,0.5))] after:content-['']"
            style={{ background: spineColor }}
          />

          {/* Cover */}
          <div
            className="relative flex flex-1 flex-col p-5 font-body text-[#EFE4C4] after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(120%_60%_at_15%_0%,rgba(255,255,255,0.16),transparent_55%),linear-gradient(180deg,rgba(0,0,0,0)_70%,rgba(0,0,0,0.25)_100%)] after:content-[''] max-sm:p-4"
            style={{ background: coverColor }}
          >
            {/* leather grain */}
            <div
              className="pointer-events-none absolute inset-0 opacity-55 mix-blend-overlay"
              style={{ backgroundImage: GRAIN }}
            />

            <span className="relative z-[1] inline-block h-fit w-fit max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-full border border-gold/45 bg-black/[0.28] px-2.5 py-[3px] text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[#F3E7C8]">
              {category}
            </span>

            {/* Hanging luggage-tag badge */}
            <span className="absolute right-3 top-4 z-[2] inline-flex h-[22px] w-fit origin-top-left rotate-[4deg] items-center whitespace-nowrap bg-[linear-gradient(180deg,#c8c2ae,#dfb132)] pl-[18px] pr-2.5 text-[0.65rem] font-semibold text-ink shadow-[0_3px_8px_rgba(0,0,0,0.3)] [clip-path:polygon(11px_0,100%_0,100%_100%,11px_100%,0_50%)] before:absolute before:left-[5px] before:top-1/2 before:h-1 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-[#3A2A12] before:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.35)] before:content-[''] max-sm:right-2.5 max-sm:top-3 max-sm:h-5 max-sm:pl-4 max-sm:pr-2">
              {badge}
            </span>

            <div className="relative z-[1] flex min-h-0 flex-1 flex-col justify-end">
              <p className="mb-1 line-clamp-2 font-display text-lg font-bold leading-[1.25] text-[#F6ECD3] [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">
                {title}
              </p>
              <p className="mb-3 overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-normal text-[#F6ECD3]/80">
                {subtitle}
              </p>
              <div className="mt-3 flex w-full items-center">
                <div className="flex min-w-0 gap-1.5 overflow-hidden text-[0.65rem] text-[#F6ECD3]/85 max-sm:text-[0.68rem] [&>span]:whitespace-nowrap">
                  {meta}
                </div>
              </div>
            </div>
          </div>

          {/* Gilt page edges along the bottom */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-[3px] right-[3px] h-1.5 bg-[repeating-linear-gradient(90deg,#E8D9A8_0px,#C9A84C_2px,#E8D9A8_3px)] shadow-[inset_0_2px_3px_rgba(0,0,0,0.2)]"
          />
        </div>
      </div>
    </article>
  );
}