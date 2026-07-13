import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AdminSidebar } from "../components/AdminSidebar";

const MIN_WIDTH = 200;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 224;
const STORAGE_KEY = "cadt_admin_sidebar_width";

export default function AdminLayout() {
  const [width, setWidth] = useState(() => {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    return saved >= MIN_WIDTH && saved <= MAX_WIDTH ? saved : DEFAULT_WIDTH;
  });
  const [resizing, setResizing] = useState(false);

  // Inventory pages render their own full-width top bar right of the sidebar,
  // so they get the raw area; other modules keep the padded, centered main.
  const fullBleed = useLocation().pathname.startsWith("/admin/inventory");

  useEffect(() => {
    if (!resizing) return;

    const onMove = (e) => setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX)));
    const onUp = () => setResizing(false);

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [resizing]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(width));
  }, [width]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar width={width} />

      {/* Drag handle — VS Code style: invisible until hovered/dragged */}
      <div
        onPointerDown={(e) => { e.preventDefault(); setResizing(true); }}
        className={`w-1 shrink-0 cursor-col-resize transition-colors ${resizing ? "bg-blue-500/70" : "hover:bg-blue-400/50"}`}
      />

      <div className="flex-1 min-w-0 overflow-auto">
        {fullBleed ? (
          <Outlet />
        ) : (
          <main className="p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </main>
        )}
      </div>
    </div>
  );
}
