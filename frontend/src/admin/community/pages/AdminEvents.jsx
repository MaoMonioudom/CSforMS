import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, Plus, Calendar, MapPin, Users, Bell } from "lucide-react";
import {
  fetchEvents, createEvent, updateEvent, deleteEvent, formatEventDateShort,
  fetchEventRegistrants, sendEventReminder, removeEventRegistrant,
} from "@/lib/events-data";
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from "@/components/community/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from "@/components/community/ui/alert-dialog";
import { Button } from "@/components/community/ui/button";

const EMPTY_FORM = {
  title: "", location: "", date: "", endDate: "",
  capacity: "", image: "", description: "",
};

// datetime-local <-> ISO helpers.
function toLocalInput(iso) {
  return iso ? new Date(iso).toISOString().slice(0, 16) : "";
}
function toIso(local) {
  return local ? `${local}:00Z` : undefined;
}

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1";

function Actions({ event, onEdit, onDelete, onViewRegistrants }) {
  return (
    <div className="flex items-center gap-1">
      <Link
        to={`/community/eventspace/${event.id}`} target="_blank" rel="noreferrer"
        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="View"
      >
        <Eye className="h-3.5 w-3.5" />
      </Link>
      <button onClick={() => onViewRegistrants(event)}
        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Registrants">
        <Users className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => onEdit(event)}
        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => onDelete(event)}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function RegistrantsDialog({ event, onOpenChange }) {
  const [registrants, setRegistrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!event) return;
    setLoading(true);
    setStatus("");
    fetchEventRegistrants(event.id).then(setRegistrants).finally(() => setLoading(false));
  }, [event]);

  const handleRemind = async () => {
    setSending(true);
    setStatus("");
    try {
      const sent = await sendEventReminder(event.id);
      setStatus(sent > 0 ? `Reminder sent to ${sent} ${sent === 1 ? "person" : "people"}.` : "No one is registered yet.");
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSending(false);
    }
  };

  // Registration has no self-cancel by design — this is the only way a
  // registrant comes off the list once they're on it.
  const handleRemove = async (registrant) => {
    setStatus("");
    try {
      await removeEventRegistrant(event.id, registrant.userId);
      setRegistrants((prev) => prev.filter((r) => r.userId !== registrant.userId));
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onOpenChange(null)}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrants — {event?.title}</DialogTitle>
          <DialogDescription>{registrants.length} registered</DialogDescription>
        </DialogHeader>

        <Button onClick={handleRemind} disabled={sending || loading} className="w-full bg-gray-900 text-white hover:bg-gray-700">
          <Bell className="h-3.5 w-3.5" /> {sending ? "Sending…" : "Send reminder"}
        </Button>
        {status && <p className="text-xs text-gray-500">{status}</p>}

        {loading ? (
          <p className="text-sm text-gray-400 py-6 text-center">Loading…</p>
        ) : registrants.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No one has registered yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {registrants.map((r) => (
              <li key={r.userId} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-gray-900 truncate">{r.name}</span>
                  <span className="text-xs text-gray-400 truncate">{r.email}</span>
                </div>
                <button onClick={() => handleRemove(r)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0" title="Remove">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EventCard({ event, onEdit, onDelete, onViewRegistrants }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all flex flex-col">
      <div className="relative h-32 bg-gray-100 shrink-0">
        {event.image ? (
          <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Calendar className="h-8 w-8 text-gray-300" />
          </div>
        )}
        <span className="absolute top-2 left-2 bg-white/95 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
          {formatEventDateShort(event.date)}
        </span>
        <span className="absolute top-2 right-2 bg-white/95 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm capitalize">
          {event.status}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="font-medium text-gray-900 truncate">{event.title}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" /> {event.location}
        </p>
        <p className="text-xs text-gray-400 mt-1">Capacity: {event.capacity || "—"}</p>

        <div className="mt-3 pt-3 border-t border-gray-50 flex-1 flex items-end justify-end">
          <Actions event={event} onEdit={onEdit} onDelete={onDelete} onViewRegistrants={onViewRegistrants} />
        </div>
      </div>
    </div>
  );
}

export default function AdminEvents() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [registrantsTarget, setRegistrantsTarget] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEvents().then(setList).finally(() => setLoading(false));
  }, []);

  const updateField = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setFormOpen(true);
  };

  const openEdit = (ev) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      location: ev.location,
      date: toLocalInput(ev.date),
      endDate: ev.endDate ? toLocalInput(ev.endDate) : "",
      capacity: String(ev.capacity || ""),
      image: ev.image || "",
      description: ev.description || "",
    });
    setError("");
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      location: form.location.trim(),
      start_date: toIso(form.date),
      end_date: form.endDate ? toIso(form.endDate) : null,
      max_participants: form.capacity ? Number(form.capacity) : null,
      image_url: form.image.trim() || null,
      description: form.description.trim(),
    };

    setSaving(true);
    setError("");
    try {
      if (editingId) {
        const updated = await updateEvent(editingId, payload);
        setList(prev => prev.map(ev => ev.id === editingId ? updated : ev));
      } else {
        const created = await createEvent(payload);
        setList(prev => [created, ...prev]);
      }
      setFormOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteEvent(deleteTarget.id);
      setList(prev => prev.filter(ev => ev.id !== deleteTarget.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="mt-1 text-sm text-gray-500">{list.length} total events</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Event
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading events…</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-400">No events yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {list.map(ev => (
            <EventCard key={ev.id} event={ev} onEdit={openEdit} onDelete={setDeleteTarget} onViewRegistrants={setRegistrantsTarget} />
          ))}
        </div>
      )}

      {/* Add / Edit form */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit event" : "Add event"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the details for this event." : "Create a new event for the community bulletin board."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4">
            {error && (
              <div className="rounded-lg bg-red-50 text-red-600 text-sm px-4 py-2.5">{error}</div>
            )}

            <div>
              <label className={labelCls}>Title</label>
              <input className={inputCls} value={form.title} onChange={updateField("title")} required />
            </div>

            <div>
              <label className={labelCls}>Location</label>
              <input className={inputCls} value={form.location} onChange={updateField("location")} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Starts</label>
                <input type="datetime-local" className={inputCls} value={form.date} onChange={updateField("date")} required />
              </div>
              <div>
                <label className={labelCls}>Ends <span className="font-normal text-gray-400">(optional)</span></label>
                <input type="datetime-local" className={inputCls} value={form.endDate} onChange={updateField("endDate")} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Capacity <span className="font-normal text-gray-400">(optional)</span></label>
              <input type="number" min="0" className={inputCls} value={form.capacity} onChange={updateField("capacity")} />
            </div>

            <div>
              <label className={labelCls}>Image URL <span className="font-normal text-gray-400">(optional)</span></label>
              <input className={inputCls} value={form.image} onChange={updateField("image")} placeholder="https://..." />
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows={4} value={form.description} onChange={updateField("description")} />
            </div>

            <DialogFooter className="mt-2">
              <button type="button" onClick={() => setFormOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors disabled:opacity-50">
                {editingId ? "Save changes" : "Create event"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the event from the bulletin board. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RegistrantsDialog event={registrantsTarget} onOpenChange={setRegistrantsTarget} />
    </div>
  );
}
