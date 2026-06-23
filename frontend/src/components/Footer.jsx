import { Link } from "react-router-dom";
import { Github, Mail } from "lucide-react";
import logo from "../assets/makerspace_logo.png"
const links = [
  { label: "About", to: "/" },
  { label: "Events", to: "/events" },
  { label: "Collaboration", to: "/collaboration" },
  { label: "Community", to: "/community" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Main body */}
      <div className="border-t border-background/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 w-fit">
              <img src={logo} alt="Makerspace Logo" className="h-8 w-auto" />   
            </Link>
            <p className="text-sm leading-relaxed max-w-xs text-background/70">
              A community hub for makers, builders, and curious minds. Find events, teammates, and conversations.
            </p>
            <div className="flex items-center gap-3 mt-1">
              <a
                href="mailto:hello@makerspace.example"
                aria-label="Email"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/15 hover:bg-background/25 transition-colors"
              >
                <Mail className="h-4 w-4 text-background" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/15 hover:bg-background/25 transition-colors"
              >
                <Github className="h-4 w-4 text-background" />
              </a>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-extrabold uppercase tracking-widest mb-1 text-background/50">
              Navigate
            </p>
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm font-semibold w-fit text-background/80 hover:text-background transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Pinned notice */}
          <div className="flex flex-col justify-center">
            <div
              className="relative paper px-6 py-5 max-w-xs"
              style={{
                transform: "rotate(-1.2deg)",
                boxShadow: "0 6px 24px rgba(0,0,0,0.32)",
              }}
            >
              {/* Pin */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    background: "radial-gradient(circle at 35% 30%, #ff8a80, #c62828)",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.35)",
                  }}
                />
                <div className="w-px h-1.5 bg-zinc-400" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Notice board</p>
              <p className="text-sm font-semibold leading-snug text-foreground">
                Got an idea for an event or project?{" "}
                <Link
                  to="/community"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Post it in the community
                </Link>{" "}
                and find your crew.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-background/50">
          <span>© {new Date().getFullYear()} Makerspace Community. All rights reserved.</span>
          <span>Built with care by the community.</span>
        </div>
      </div>
    </footer>
  );
}
