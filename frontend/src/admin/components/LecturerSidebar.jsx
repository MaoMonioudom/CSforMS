import { useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft, FolderOpen, Folder, ChevronDown,
  GraduationCap, LogOut,
} from "lucide-react";
import { useAuth } from "../../hub/AuthContext";

const ROLE_BADGE = {
  Lecturer: "bg-gold/15 text-gold-light",
};

// One shared admin sidebar for all three modules. Each module is a collapsible
// folder; the folder whose routes match the current URL starts open.
const FOLDERS = [
  {
    id: "learning",
    label: "Learning",
    match: (p) => p.startsWith("/lecturer"),
    items: [
      { label: "Courses", to: "/lecturer/learning/courses", icon: GraduationCap },
    ],
  },
];

function NavItem({ label, to, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-white/10 text-parchment"
            : "text-navy-muted hover:text-parchment hover:bg-white/5"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-gold-light" : "text-navy-muted"}`} />
          {label}
        </>
      )}
    </NavLink>
  );
}

export function LecturerSidebar({ width = 224 }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [open, setOpen] = useState(() => {
    const active = FOLDERS.find((f) => f.match(pathname));
    return { [active ? active.id : FOLDERS[0].id]: true };
  });
  const toggle = (id) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  // Sub-folders (Operation / Inventory Management) start open — they're short lists.
  const [subOpen, setSubOpen] = useState({});
  const subIsOpen = (key) => subOpen[key] !== false;
  const toggleSub = (key) => setSubOpen((o) => ({ ...o, [key]: !subIsOpen(key) }));

  return (
    <aside
      className="shrink-0 bg-navy-deep border-r border-white/10 flex flex-col min-h-screen sticky top-0 h-screen"
      style={{ width }}
    >
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/10 shrink-0">
        <div>
          <p className="text-sm font-bold text-parchment leading-tight">Lecturer Panel</p>
          <p className="text-[10px] text-navy-muted font-medium">CADT Makerspace</p>
        </div>
        {user?.role && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${ROLE_BADGE[user.role] ?? "bg-white/10 text-navy-muted"}`}>
            {user.role}
          </span>
        )}
      </div>

      {/* Nav — one folder per module */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-1">
        {FOLDERS.map((folder) => {
          const isOpen = open[folder.id];
          const folderIsActive = folder.match(pathname);
          return (
            <div key={folder.id}>
              <button
                onClick={() => toggle(folder.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  folderIsActive && !isOpen
                    ? "text-parchment bg-white/5"
                    : "text-navy-muted hover:text-parchment hover:bg-white/5"
                }`}
              >
                {isOpen
                  ? <FolderOpen className="h-4 w-4 shrink-0 text-gold" />
                  : <Folder className="h-4 w-4 shrink-0 text-gold" />
                }
                <span className="flex-1 text-left truncate">{folder.label}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 text-navy-muted transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`}
                />
              </button>

              {isOpen && (
                <div className="mt-0.5 ml-3 pl-3 border-l border-white/10 space-y-0.5">
                  {folder.items.length === 0 && (
                    <p className="px-3 py-2 text-xs text-navy-muted">Coming soon</p>
                  )}
                  {folder.items.map((entry) => entry.group ? (
                    // Sub-folder (e.g. Operation, Inventory Management)
                    <div key={entry.group}>
                      <button
                        onClick={() => toggleSub(entry.group)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-navy-muted hover:text-parchment hover:bg-white/5 transition-colors"
                      >
                        {subIsOpen(entry.group)
                          ? <FolderOpen className="h-3.5 w-3.5 shrink-0 text-gold-light" />
                          : <Folder className="h-3.5 w-3.5 shrink-0 text-gold-light" />
                        }
                        <span className="flex-1 text-left truncate">{entry.group}</span>
                        <ChevronDown className={`h-3 w-3 shrink-0 text-navy-muted transition-transform duration-200 ${subIsOpen(entry.group) ? "rotate-0" : "-rotate-90"}`} />
                      </button>
                      {subIsOpen(entry.group) && (
                        <div className="ml-2.5 pl-2.5 border-l border-white/10 space-y-0.5">
                          {entry.items.map((it) => <NavItem key={it.to} {...it} />)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <NavItem key={entry.to} {...entry} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Back to site / log out */}
      <div className="p-3 border-t border-white/10 shrink-0 space-y-0.5">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-navy-muted hover:text-parchment hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back to site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-navy-muted hover:text-red-400 hover:bg-oxblood/15 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Log out
        </button>
      </div>
    </aside>
  );
}
