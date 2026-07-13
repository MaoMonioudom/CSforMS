import { useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Users, MessageSquare,
  UserCog, ArrowLeft, FolderOpen, Folder, ChevronDown,
  Boxes, Printer, RotateCcw, Inbox, CreditCard, Compass, Armchair,
  BookOpen, GraduationCap, LogOut,
} from "lucide-react";
import { useAuth } from "../../hub/AuthContext";

const ROLE_BADGE = {
  Admin: "bg-red-50 text-red-600",
  Staff: "bg-violet-50 text-violet-600",
};

// One shared admin sidebar for all three modules. Each module is a collapsible
// folder; the folder whose routes match the current URL starts open.
const FOLDERS = [
  {
    id: "community",
    label: "Community Space",
    match: (p) => p === "/admin" || ["/admin/events", "/admin/collaboration", "/admin/community", "/admin/users", "/admin/workspace"].some(r => p.startsWith(r)),
    items: [
      { label: "Dashboard",     to: "/admin",               icon: LayoutDashboard, end: true },
      { label: "Events",        to: "/admin/events",        icon: Calendar },
      { label: "Collaboration", to: "/admin/collaboration", icon: MessageSquare },
      { label: "Community",     to: "/admin/community",     icon: Users },
      { label: "Users",         to: "/admin/users",         icon: UserCog },
      { label: "Workspace",     to: "/admin/workspace",     icon: Armchair },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    match: (p) => p.startsWith("/admin/inventory"),
    items: [
      { label: "Dashboard", to: "/admin/inventory", icon: LayoutDashboard, end: true },
      {
        group: "Operation",
        items: [
          { label: "Browse Items", to: "/admin/inventory/catalog",  icon: Compass },
          { label: "Lab Services", to: "/admin/inventory/services", icon: Printer },
        ],
      },
      {
        group: "Inventory Management",
        items: [
          { label: "Requests",       to: "/admin/inventory/requests", icon: Inbox },
          { label: "Borrow Tracker", to: "/admin/inventory/borrows",  icon: RotateCcw },
          { label: "Manage Stock",   to: "/admin/inventory/manage",   icon: Boxes },
          { label: "Payment List",   to: "/admin/inventory/payments", icon: CreditCard },
        ],
      },
      { label: "Users & Roles", to: "/admin/inventory/users", icon: UserCog },
    ],
  },
  {
    id: "learning",
    label: "Learning",
    match: (p) => p.startsWith("/admin/learning"),
    items: [
      { label: "Dashboard", to: "/admin/learning", icon: LayoutDashboard, end: true },
      { label: "Courses", to: "/admin/learning/courses", icon: BookOpen },
      { label: "Lecturers", to: "/admin/learning/lecturers", icon: GraduationCap },
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
            ? "bg-gray-100 text-gray-900"
            : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-gray-700" : "text-gray-400"}`} />
          {label}
        </>
      )}
    </NavLink>
  );
}

export function AdminSidebar({ width = 224 }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const [open, setOpen] = useState(() => {
    const active = FOLDERS.find(f => f.match(pathname));
    return { community: false, inventory: false, learning: false, [active ? active.id : "community"]: true };
  });
  const toggle = (id) => setOpen(o => ({ ...o, [id]: !o[id] }));
  // Sub-folders (Operation / Inventory Management) start open — they're short lists.
  const [subOpen, setSubOpen] = useState({});
  const subIsOpen = (key) => subOpen[key] !== false;
  const toggleSub = (key) => setSubOpen(o => ({ ...o, [key]: !subIsOpen(key) }));

  return (
    <aside
      className="shrink-0 bg-white border-r border-gray-200 flex flex-col min-h-screen sticky top-0 h-screen"
      style={{ width }}
    >
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 shrink-0">
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">Admin Panel</p>
          <p className="text-[10px] text-gray-400 font-medium">CADT Makerspace</p>
        </div>
        {user?.role && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${ROLE_BADGE[user.role] ?? "bg-gray-100 text-gray-500"}`}>
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
                    ? "text-gray-900 bg-gray-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {isOpen
                  ? <FolderOpen className="h-4 w-4 shrink-0 text-amber-400" />
                  : <Folder className="h-4 w-4 shrink-0 text-amber-400" />
                }
                <span className="flex-1 text-left truncate">{folder.label}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`}
                />
              </button>

              {isOpen && (
                <div className="mt-0.5 ml-3 pl-3 border-l border-gray-100 space-y-0.5">
                  {folder.items.length === 0 && (
                    <p className="px-3 py-2 text-xs text-gray-400">Coming soon</p>
                  )}
                  {folder.items.map((entry) => entry.group ? (
                    // Sub-folder (e.g. Operation, Inventory Management)
                    <div key={entry.group}>
                      <button
                        onClick={() => toggleSub(entry.group)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        {subIsOpen(entry.group)
                          ? <FolderOpen className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                          : <Folder className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                        }
                        <span className="flex-1 text-left truncate">{entry.group}</span>
                        <ChevronDown className={`h-3 w-3 shrink-0 text-gray-400 transition-transform duration-200 ${subIsOpen(entry.group) ? "rotate-0" : "-rotate-90"}`} />
                      </button>
                      {subIsOpen(entry.group) && (
                        <div className="ml-2.5 pl-2.5 border-l border-gray-100 space-y-0.5">
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
      <div className="p-3 border-t border-gray-100 shrink-0 space-y-0.5">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back to site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Log out
        </button>
      </div>
    </aside>
  );
}
