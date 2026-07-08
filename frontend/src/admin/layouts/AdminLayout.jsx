import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../components/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 min-w-0 overflow-auto">
        <main className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
