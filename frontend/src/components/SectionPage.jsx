function PushPin({ color = "#ef4444", size = 14 }) {
  return (
    <svg width={size} height={size * 2} viewBox="0 0 14 28" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="6.5" fill={color} />
      <circle cx="5" cy="5" r="2" fill="rgba(255,255,255,0.4)" />
      <line x1="7" y1="13" x2="7" y2="28" stroke="#888" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function StatPinCard({ value, label, rotate = 0, pinColor = "#dc2626", plus = true }) {
  return (
    <div
      className="relative transition-all duration-300 hover:scale-[1.04]"
      style={{ transform: `rotate(${rotate}deg)`, transformOrigin: "top center" }}
    >
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 drop-shadow">
        <PushPin color={pinColor} size={12} />
      </div>
      <div
        className="bg-white px-5 py-4 text-center min-w-[110px]"
        style={{ boxShadow: "3px 4px 14px rgba(0,0,0,0.24)" }}
      >
        <p className="text-3xl font-extrabold text-foreground">
          {value}{plus ? "+" : ""}
        </p>
        <p className="mt-1 text-[10px] font-semibold text-muted-foreground leading-tight">{label}</p>
      </div>
    </div>
  );
}

function MakerCircuitOverlay() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.07, zIndex: 0, overflow: "hidden" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <pattern id="sp-circuit" x="0" y="0" width="180" height="180" patternUnits="userSpaceOnUse">
            <line x1="10" y1="50" x2="80" y2="50" stroke="#3a2008" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="80" cy="50" r="5" fill="none" stroke="#3a2008" strokeWidth="2" />
            <line x1="80" y1="50" x2="80" y2="113" stroke="#3a2008" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="68" y="108" width="24" height="13" fill="none" stroke="#3a2008" strokeWidth="2" rx="2" />
            <line x1="80" y1="121" x2="80" y2="155" stroke="#3a2008" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="80" cy="155" r="4" fill="#3a2008" />
            <circle cx="10" cy="50" r="4" fill="#3a2008" />
            <line x1="120" y1="10" x2="168" y2="10" stroke="#3a2008" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="168" y1="10" x2="168" y2="78" stroke="#3a2008" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="168" cy="78" r="5" fill="none" stroke="#3a2008" strokeWidth="2" />
            <circle cx="120" cy="10" r="4" fill="#3a2008" />
            <line x1="20" y1="142" x2="58" y2="142" stroke="#3a2008" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="58" cy="142" r="4" fill="none" stroke="#3a2008" strokeWidth="2" />
            <circle cx="20" cy="142" r="3" fill="#3a2008" />
            <line x1="130" y1="110" x2="130" y2="160" stroke="#3a2008" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="130" cy="110" r="4" fill="#3a2008" />
            <line x1="130" y1="160" x2="165" y2="160" stroke="#3a2008" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="165" cy="160" r="3" fill="#3a2008" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sp-circuit)" />
      </svg>
    </div>
  );
}

function TornEdge() {
  return (
    <div aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, pointerEvents: "none" }}>
      <svg viewBox="0 0 1440 56" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "56px" }}>
        <path
          d="M0,56 L0,36 L48,22 L96,40 L144,16 L192,34 L240,10 L288,28 L336,8 L384,26 L432,6 L480,24 L528,4 L576,20 L624,2 L672,18 L720,0 L768,16 L816,4 L864,20 L912,2 L960,18 L1008,4 L1056,20 L1104,6 L1152,22 L1200,8 L1248,24 L1296,10 L1344,26 L1392,12 L1440,28 L1440,56 Z"
          fill="#fef9f0"
        />
      </svg>
    </div>
  );
}

const corkBackground = {
  backgroundColor: "#d4bc94",
  backgroundImage: `
    radial-gradient(ellipse at 0% 0%,   rgba(180,155,105,0.55) 0%, transparent 50%),
    radial-gradient(ellipse at 100% 0%,  rgba(150,125,80,0.4)  0%, transparent 45%),
    radial-gradient(ellipse at 0% 100%,  rgba(145,120,75,0.4)  0%, transparent 45%),
    radial-gradient(ellipse at 100% 100%,rgba(120,95,55,0.5)   0%, transparent 45%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65 0.4' numOctaves='6' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0.18 0 0 0 0.74 0.14 0 0 0 0.62 0.09 0 0 0 0.42 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23p)'/%3E%3C/svg%3E")
  `,
};

const toneMap = {
  events: "bg-events text-events-foreground",
  collaboration: "bg-collaboration text-collaboration-foreground",
  technical: "bg-technical text-technical-foreground",
  social: "bg-social text-social-foreground",
  community: "bg-community text-community-foreground",
};

export function SectionPage({
  eyebrow,
  title,
  description,
  tone = "events",
  children,
  bulletin = false,
  stats,
  ghostLetter,
  tapeColor = "rgba(255,230,120,0.85)",
}) {
  if (bulletin) {
    return (
      <>
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            paddingBottom: "56px",
            ...corkBackground,
          }}
        >
          <MakerCircuitOverlay />

          {ghostLetter && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                right: "5%",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "clamp(130px, 19vw, 210px)",
                fontWeight: 900,
                color: "rgba(255,255,255,0.13)",
                fontFamily: "'Caveat', cursive",
                lineHeight: 1,
                userSelect: "none",
                pointerEvents: "none",
                zIndex: 0,
              }}
            >
              {ghostLetter}
            </div>
          )}

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-10 sm:gap-16">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.22em] text-white/55 font-bold mb-5">
                  {eyebrow}
                </p>
                <div
                  style={{
                    display: "inline-block",
                    background: tapeColor,
                    padding: "8px 26px 8px 18px",
                    transform: "rotate(-1.3deg)",
                    boxShadow: "1px 2px 10px rgba(0,0,0,0.22)",
                    borderRadius: "1px",
                  }}
                >
                  <h1
                    className="text-5xl sm:text-6xl font-bold leading-tight"
                    style={{ color: "rgba(28,14,0,0.88)" }}
                  >
                    {title}
                  </h1>
                </div>
                <p className="mt-6 text-white/70 text-base max-w-lg leading-relaxed">
                  {description}
                </p>
              </div>

              {stats && stats.length > 0 && (
                <div className="hidden sm:flex flex-col gap-8 pt-4 shrink-0">
                  {stats.map((stat) => (
                    <StatPinCard key={stat.label} {...stat} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <TornEdge />
        </section>

        {children ? (
          <section className="dot-grid" style={{ backgroundColor: "#fef9f0" }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
              {children}
            </div>
          </section>
        ) : null}
      </>
    );
  }

  return (
    <>
      <section className={`${toneMap[tone]} ${children ? "" : "min-h-[calc(100vh-4rem)]"}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <p className="text-xs uppercase tracking-[0.2em] opacity-70 mb-6">{eyebrow}</p>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.02]">
            {title}
          </h1>
          <p className="mt-8 max-w-2xl text-lg sm:text-xl opacity-90">{description}</p>
        </div>
      </section>
      {children ? (
        <section className="bg-background dot-grid">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            {children}
          </div>
        </section>
      ) : null}
    </>
  );
}
