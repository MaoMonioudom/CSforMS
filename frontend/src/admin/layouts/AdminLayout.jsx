import { Outlet, useLocation } from "react-router-dom";
import { AdminSidebar } from "../components/AdminSidebar";

export default function AdminLayout() {
  // Inventory pages render their own full-width top bar right of the sidebar,
  // so they get the raw area; other modules keep the padded, centered main.
  const fullBleed = useLocation().pathname.startsWith("/admin/inventory");
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
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
