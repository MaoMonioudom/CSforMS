/**
 * Reusable centred section header: eyebrow → title → optional subtitle.
 * tone="dark" for navy sections (light text), tone="light" for paper sections.
 */
export default function SectionHeader({ eyebrow, title, subtitle, tone = "dark" }) {
  const onDark = tone === "dark";
  return (
    <div className="mb-12 text-center">
      {eyebrow && (
        <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.15em] text-community-gold">
          {eyebrow}
        </span>
      )}
      <h2
        className={`mb-4 text-[clamp(1.6rem,4vw,2.2rem)] leading-tight ${
          onDark ? "text-parchment" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mx-auto max-w-[540px] text-base leading-[1.75] ${
            onDark ? "text-navy-muted" : "text-ink-soft"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
