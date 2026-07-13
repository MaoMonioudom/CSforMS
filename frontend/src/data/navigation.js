/**
 * Central navigation config.
 * Add or remove routes here; Navbar + Footer pick them up automatically.
 */
export const NAV_LINKS = [
  { to: "/",        label: "Home"    },
  { to: "/courses", label: "Courses" },
  { to: "/about",   label: "About"   },
  { to: "/contact", label: "Contact" },
];

export const FOOTER_LIBRARY_LINKS = [
  { to: "/courses",                   label: "All Courses"  },
  { to: "/courses?cat=Programming",   label: "Programming"  },
  { to: "/courses?cat=Robotics",      label: "Robotics"     },
  { to: "/courses?cat=AI+%26+ML",     label: "AI & ML"      },
];

export const FOOTER_INFO_LINKS = [
  { to: "/about",   label: "About"   },
  { to: "/contact", label: "Contact" },
];
