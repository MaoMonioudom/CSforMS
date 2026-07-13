import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { LecturerSidebar } from "../components/LecturerSidebar";

const MIN_WIDTH = 200;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 224;
const STORAGE_KEY = "cadt_lecturer_sidebar_width";

export default function LecturerLayout() {
  const [width, setWidth] = useState(() => {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    return saved >= MIN_WIDTH && saved <= MAX_WIDTH ? saved : DEFAULT_WIDTH;
  });
  const [resizing, setResizing] = useState(false);

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
    <div className="flex min-h-screen bg-navy">
      <LecturerSidebar width={width} />

      {/* Drag handle — VS Code style: invisible until hovered/dragged */}
      <div
        onPointerDown={(e) => { e.preventDefault(); setResizing(true); }}
        className={`w-1 shrink-0 cursor-col-resize transition-colors ${resizing ? "bg-gold/70" : "hover:bg-gold-light/40"}`}
      />

      <div className="flex-1 min-w-0 overflow-auto">
        <main className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
