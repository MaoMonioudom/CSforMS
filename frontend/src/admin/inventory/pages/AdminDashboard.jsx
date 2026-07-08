import { Package } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of the CADT Inventory platform.</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
        <Package className="h-8 w-8 text-gray-300" />
        <p className="mt-3 text-sm font-medium text-gray-500">Inventory admin is coming soon</p>
        <p className="mt-1 text-xs text-gray-400">This space will manage inventory items, stock, and requests.</p>
      </div>
    </div>
  );
}
