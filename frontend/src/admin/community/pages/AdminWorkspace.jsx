import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { getRequests, setRequestStatus, getUpcomingDates } from "@/lib/workspace-data";

const DATES = getUpcomingDates(5);

const STATUS_STYLE = {
  pending:  { label: "Pending",  cls: "bg-amber-50 text-amber-600" },
  approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-600" },
  denied:   { label: "Denied",   cls: "bg-red-50 text-red-500" },
};

const FILTERS = ["pending", "approved", "denied", "all"];

export default function AdminWorkspace() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pending");

  useEffect(() => { setRequests(getRequests()); }, []);

  const act = (id, status) => setRequests(setRequestStatus(id, status));

  const counts = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    denied:   requests.filter(r => r.status === "denied").length,
  };

  const visible = requests
    .filter(r => filter === "all" || r.status === filter)
    .sort((a, b) => a.date.localeCompare(b.date) || a.requestedAt.localeCompare(b.requestedAt));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workspace Requests</h1>
        <p className="mt-1 text-sm text-gray-500">Approve or deny member requests for a personal desk or bench.</p>
      </div>

      <div className="flex gap-2 mb-4">
        {FILTERS.map(key => (
          <button key={key} onClick={() => setFilter(key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              filter === key ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}>
            {key.charAt(0).toUpperCase() + key.slice(1)} ({counts[key]})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Seat</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date &amp; time</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">No requests here.</td></tr>
              ) : visible.map(r => {
                const dateLabel = DATES.find(d => d.key === r.date)?.label ?? r.date;
                const s = STATUS_STYLE[r.status];
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{r.userName}</p>
                      <p className="text-xs text-gray-400">{r.userEmail}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{r.seatLabel}</td>
                    <td className="px-5 py-3.5 text-gray-600 text-xs">{dateLabel} · {r.slot}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        {r.status !== "approved" && (
                          <button onClick={() => act(r.id, "approved")}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Approve">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {r.status !== "denied" && (
                          <button onClick={() => act(r.id, "denied")}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Deny">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
