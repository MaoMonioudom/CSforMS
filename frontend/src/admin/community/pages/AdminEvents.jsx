import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, Plus, Calendar, MapPin } from "lucide-react";
import { events as initialEvents, formatEventDateShort } from "@/lib/events-data";
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from "@/components/community/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from "@/components/community/ui/alert-dialog";

// Admin has no backend yet — CRUD lives in local state, seeded from the mock
// data. Wiring this to real persistence later is a matter of swapping these
// setters for API calls; the form/dialog plumbing stays the same.
const DEFAULT_AUTHOR = { name: "Admin Team", role: "Event Organizer", avatar: "https://i.pravatar.cc/120?img=68" };

const EMPTY_FORM = {
  title: "", location: "", date: "", endDate: "",
  capacity: "", participants: "0", tags: "", image: "",
  shortDescription: "", description: "",
};

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "event";
}

// datetime-local <-> ISO helpers. The mock data stores UTC ISO strings with
// seconds ("2026-07-12T10:00:00Z"); toISOString() already gives us that.
function toLocalInput(iso) {
  return iso ? new Date(iso).toISOString().slice(0, 16) : "";
}
function toIso(local) {
  return local ? `${local}:00Z` : undefined;
}

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1";

function Actions({ event, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      <Link
        to={`/community/eventspace/${event.id}`} target="_blank" rel="noreferrer"
        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="View"
      >
        <Eye className="h-3.5 w-3.5" />
      </Link>
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

function EventCard({ event, onEdit, onDelete }) {
  const pct = Math.round((event.participants / event.capacity) * 100);
  const fillColor = pct >= 90 ? "#f87171" : pct >= 70 ? "#fb923c" : "#34d399";

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
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="font-medium text-gray-900 truncate">{event.title}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" /> {event.location}
        </p>

        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Spots</span>
            <span className="text-xs font-semibold tabular-nums" style={{ color: fillColor }}>
              {event.participants}/{event.capacity}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: fillColor }} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1 flex-1">
          {event.tags.map(t => (
            <span key={t} className="inline-block bg-orange-50 text-orange-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-50 flex justify-end">
          <Actions event={event} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}

export default function AdminEvents() {
  const [list, setList] = useState(initialEvents);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const updateField = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (ev) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      location: ev.location,
      date: toLocalInput(ev.date),
      endDate: ev.endDate ? toLocalInput(ev.endDate) : "",
      capacity: String(ev.capacity),
      participants: String(ev.participants),
      tags: ev.tags.join(", "),
      image: ev.image || "",
      shortDescription: ev.shortDescription || "",
      description: ev.description || "",
    });
    setFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    const payload = {
      title: form.title.trim(),
      location: form.location.trim(),
      date: toIso(form.date),
      endDate: form.endDate ? toIso(form.endDate) : undefined,
      capacity: Number(form.capacity) || 0,
      participants: Number(form.participants) || 0,
      tags,
      image: form.image.trim() || undefined,
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
    };

    if (editingId) {
      setList(prev => prev.map(ev => ev.id === editingId ? { ...ev, ...payload } : ev));
    } else {
      const id = `${slugify(payload.title)}-${Math.random().toString(36).slice(2, 6)}`;
      setList(prev => [{ id, author: DEFAULT_AUTHOR, ...payload }, ...prev]);
    }
    setFormOpen(false);
  };

  const confirmDelete = () => {
    setList(prev => prev.filter(ev => ev.id !== deleteTarget.id));
    setDeleteTarget(null);
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {list.map(ev => (
          <EventCard key={ev.id} event={ev} onEdit={openEdit} onDelete={setDeleteTarget} />
        ))}
      </div>

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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Capacity</label>
                <input type="number" min="0" className={inputCls} value={form.capacity} onChange={updateField("capacity")} required />
              </div>
              <div>
                <label className={labelCls}>Registered</label>
                <input type="number" min="0" className={inputCls} value={form.participants} onChange={updateField("participants")} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Tags <span className="font-normal text-gray-400">(comma separated)</span></label>
              <input className={inputCls} value={form.tags} onChange={updateField("tags")} placeholder="workshop, electronics, beginner" />
            </div>

            <div>
              <label className={labelCls}>Image URL <span className="font-normal text-gray-400">(optional)</span></label>
              <input className={inputCls} value={form.image} onChange={updateField("image")} placeholder="https://..." />
            </div>

            <div>
              <label className={labelCls}>Short description</label>
              <textarea className={inputCls} rows={2} value={form.shortDescription} onChange={updateField("shortDescription")} />
            </div>

            <div>
              <label className={labelCls}>Full description</label>
              <textarea className={inputCls} rows={4} value={form.description} onChange={updateField("description")} />
            </div>

            <DialogFooter className="mt-2">
              <button type="button" onClick={() => setFormOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors">
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
    </div>
  );
}
