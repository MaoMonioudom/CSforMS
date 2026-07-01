import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Users, MessageSquare,
  UserCog, ArrowLeft, FolderOpen, Folder, ChevronDown,
} from "lucide-react";

const folderItems = [
  { label: "Dashboard",     to: "/admin",               icon: LayoutDashboard, end: true },
  { label: "Events",        to: "/admin/events",         icon: Calendar },
  { label: "Collaboration", to: "/admin/collaboration",  icon: MessageSquare },
  { label: "Community",     to: "/admin/community",      icon: Users },
];

export function AdminSidebar() {
  const { pathname } = useLocation();
  const folderIsActive = pathname === "/admin" || pathname.startsWith("/admin/events") || pathname.startsWith("/admin/collaboration") || pathname.startsWith("/admin/community");
  const [open, setOpen] = useState(true);

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col min-h-screen sticky top-0 h-screen">
      {/* Brand */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100 shrink-0">
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">Admin Panel</p>
          <p className="text-[10px] text-gray-400 font-medium">CADT Community</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">

        {/* Folder: Community Space */}
        <button
          onClick={() => setOpen(v => !v)}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            folderIsActive && !open
              ? "text-gray-900 bg-gray-50"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          {open
            ? <FolderOpen className="h-4 w-4 shrink-0 text-amber-400" />
            : <Folder className="h-4 w-4 shrink-0 text-amber-400" />
          }
          <span className="flex-1 text-left truncate">Community Space</span>
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
          />
        </button>

        {/* Folder children */}
        {open && (
          <div className="mt-0.5 ml-3 pl-3 border-l border-gray-100 space-y-0.5">
            {folderItems.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
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
            ))}
          </div>
        )}

        {/* Users — outside the folder */}
        <div className="mt-1">
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <UserCog className={`h-4 w-4 shrink-0 ${isActive ? "text-gray-700" : "text-gray-400"}`} />
                Users
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* Back to site */}
      <div className="p-3 border-t border-gray-100 shrink-0">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back to site
        </Link>
      </div>
    </aside>
  );
}
