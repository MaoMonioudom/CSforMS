import { useEffect, useState } from "react";
import { Check, X, Plus, Power } from "lucide-react";
import {
  getUpcomingDates, fetchAllBookings, approveBooking, rejectBooking,
  fetchAllWorkspacesAdmin, createWorkspace, setWorkspaceStatus, fetchLocations,
} from "@/lib/workspace-data";

const DATES = getUpcomingDates(5);

const STATUS_STYLE = {
  pending:   { label: "Pending",   cls: "bg-amber-50 text-amber-600" },
  approved:  { label: "Approved",  cls: "bg-emerald-50 text-emerald-600" },
  denied:    { label: "Denied",    cls: "bg-red-50 text-red-500" },
  // Member cancelled their own still-pending request — not one of the
  // filter tabs (nothing to action), but still shows correctly under "All".
  cancelled: { label: "Cancelled", cls: "bg-gray-100 text-gray-500" },
};

const FILTERS = ["pending", "approved", "denied", "all"];

// Starting suggestions only — workspace_type is free text in the database
// (no CHECK constraint), so this isn't the full list of allowed values,
// just what shows up first before any custom types have been added yet.
const DEFAULT_DESK_TYPES = ["desk", "bench", "private_room"];
const EMPTY_DESK_FORM = { name: "", type: "desk", locationId: "", capacity: "1" };

function DesksPanel() {
  const [desks, setDesks] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_DESK_FORM);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    Promise.all([fetchAllWorkspacesAdmin(), fetchLocations()])
      .then(([ws, locs]) => { setDesks(ws); setLocations(locs); })
      .catch(() => setError("Couldn't load desks — please try refreshing."))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    setSaving(true);
    setError("");
    try {
      const created = await createWorkspace({
        name, type: form.type, locationId: form.locationId || null, capacity: Number(form.capacity) || 1,
      });
      setDesks((prev) => [...prev, created]);
      setForm(EMPTY_DESK_FORM);
      setFormOpen(false);
    } catch (err) {
      setError(err.message || "Couldn't add that desk — please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (desk) => {
    const nextStatus = desk.status === "available" ? "unavailable" : "available";
    setTogglingId(desk.id);
    setError("");
    try {
      await setWorkspaceStatus(desk.id, nextStatus);
      setDesks((prev) => prev.map((d) => (d.id === desk.id ? { ...d, status: nextStatus } : d)));
    } catch (err) {
      setError(err.message || "Couldn't update that desk — please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  const typeSuggestions = [...new Set([...DEFAULT_DESK_TYPES, ...desks.map((d) => d.type).filter(Boolean)])];

  return (
    <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Desks &amp; Rooms</h2>
          <p className="text-xs text-gray-500 mt-0.5">What members can pick from when requesting a space.</p>
        </div>
        <button onClick={() => setFormOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add desk
        </button>
      </div>

      {error && (
        <div className="mx-5 mt-4 rounded-lg bg-red-50 text-red-600 text-sm px-4 py-2.5">{error}</div>
      )}

      {formOpen && (
        <form onSubmit={handleAdd} className="px-5 py-4 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Name (e.g. Quiet Desk 3)" required
            className="sm:col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400" />
          <div>
            <input value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              list="workspace-type-suggestions" placeholder="Type (e.g. Meeting desk)"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400" />
            <datalist id="workspace-type-suggestions">
              {typeSuggestions.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>
          <select value={form.locationId} onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400">
            <option value="">No location set</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
              type="number" min="1" placeholder="Capacity"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400" />
            <button type="submit" disabled={saving}
              className="shrink-0 bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50">
              {saving ? "…" : "Add"}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td className="px-5 py-6 text-center text-sm text-gray-400">Loading…</td></tr>
            ) : desks.length === 0 ? (
              <tr><td className="px-5 py-6 text-center text-sm text-gray-400">No desks yet — add one above.</td></tr>
            ) : desks.map((desk) => (
              <tr key={desk.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">{desk.label}</p>
                  <p className="text-xs text-gray-400">
                    {desk.type || "—"} · {desk.locationLabel || "no location set"} · capacity {desk.capacity}
                  </p>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mr-3 ${
                    desk.status === "available" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    {desk.status === "available" ? "Available" : "Unavailable"}
                  </span>
                  <button onClick={() => handleToggle(desk)} disabled={togglingId === desk.id}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                    title={desk.status === "available" ? "Mark unavailable" : "Mark available"}>
                    <Power className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// How many OTHER requests for the same desk+slot are already approved —
// used to show occupancy and to stop an admin from approving past capacity
// before they even click (the backend blocks it too, but this avoids the
// round-trip error for the common case).
function approvedCountFor(requests, r) {
  return requests.filter((other) =>
    other.id !== r.id && other.workspaceId === r.workspaceId && other.date === r.date && other.slot === r.slot && other.status === "approved"
  ).length;
}

export default function AdminWorkspace() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("pending");
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    fetchAllBookings()
      .then(setRequests)
      .catch(() => setError("Couldn't load requests — please try refreshing."))
      .finally(() => setLoading(false));
  }, []);

  // Reversible with one more click (the other action is still right there
  // in the row), so no confirmation dialog here — unlike the destructive
  // deletes elsewhere in admin.
  const act = async (id, status) => {
    setActingId(id);
    setError("");
    try {
      if (status === "approved") await approveBooking(id);
      else await rejectBooking(id);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err) {
      setError(err.message || "Couldn't update that request — please try again.");
    } finally {
      setActingId(null);
    }
  };

  const counts = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    denied:   requests.filter(r => r.status === "denied").length,
  };

  // Newest submitted first — shows the full history (including requests
  // for dates that have already passed) rather than filtering anything out.
  const visible = requests
    .filter(r => filter === "all" || r.status === filter)
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workspace Requests</h1>
        <p className="mt-1 text-sm text-gray-500">Approve or deny member requests for a personal desk or bench.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-600 text-sm px-4 py-2.5">{error}</div>
      )}

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
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">Loading…</td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">No requests here.</td></tr>
              ) : visible.map(r => {
                const dateLabel = DATES.find(d => d.key === r.date)?.label ?? r.date;
                const s = STATUS_STYLE[r.status];
                const acting = actingId === r.id;
                const approvedCount = approvedCountFor(requests, r);
                const isFull = r.status !== "approved" && approvedCount >= r.capacity;
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{r.userName}</p>
                      <p className="text-xs text-gray-400">{r.userEmail}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">
                      <p>{r.seatLabel}</p>
                      {r.capacity > 1 && (
                        <p className={`text-[11px] ${isFull ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                          {approvedCount}/{r.capacity} approved{isFull ? " · Full" : ""}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 text-xs">{dateLabel} · {r.slot}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        {r.status === "cancelled" ? (
                          <span className="text-xs text-gray-400 italic">Withdrawn by member</span>
                        ) : (
                          <>
                            {r.status !== "approved" && (
                              <button onClick={() => act(r.id, "approved")} disabled={acting || isFull}
                                className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50" title={isFull ? "This slot is already full" : "Approve"}>
                                <Check className="h-5 w-5" /> {isFull ? "Full" : "Approve"}
                              </button>
                            )}
                            {r.status !== "denied" && (
                              <button onClick={() => act(r.id, "denied")} disabled={acting}
                                className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50" title="Deny">
                                <X className="h-5 w-5" /> Deny
                              </button>
                            )}
                          </>
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

      <DesksPanel />
    </div>
  );
}
