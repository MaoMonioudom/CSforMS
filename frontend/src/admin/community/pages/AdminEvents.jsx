import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, Plus, Calendar, MapPin, Users, Bell, ImagePlus, ChevronUp, ChevronDown, UserPlus } from "lucide-react";
import {
  fetchEventsPage, createEvent, updateEvent, deleteEvent, formatEventDateShort,
  fetchEventRegistrants, sendEventReminder, removeEventRegistrant, addEventRegistrant, uploadEventImage,
  getEventStatus, PLACEHOLDER_IMAGE,
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
  capacity: "", images: [], registrationUrl: "", galleryUrl: "", description: "",
};

const PAGE_SIZE = 24;

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

// Ordered thumbnail list — add/reorder/remove, first item is the cover
// shown on cards. Mirrors LessonEditor's move-up/move-down/remove pattern
// (frontend/src/admin/learning/adminSide/CourseEditorForm.jsx).
function ImageListEditor({ images, onAdd, onRemove, onMove, uploading }) {
  const fileInputRef = useRef(null);

  const handleSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onAdd(file);
  };

  return (
    <div>
      <label className={labelCls}>Images <span className="font-normal text-gray-400">(first = cover, optional — shown at 2:1 on cards and the event page, e.g. 1600×800px)</span></label>
      <div className="space-y-2">
        {images.map((url, i) => (
          <div key={url + i} className="flex items-center gap-2 rounded-lg border border-gray-200 p-2">
            <div className="flex aspect-[2/1] w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-50">
              <img src={url} alt={`Image ${i + 1}`} className="h-full w-full object-contain" />
            </div>
            <span className="text-xs font-semibold text-gray-500 flex-1 truncate">
              {i === 0 ? "Cover" : `Image ${i + 1}`}
            </span>
            <button type="button" onClick={() => onMove(i, -1)} disabled={i === 0}
              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent">
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => onMove(i, 1)} disabled={i === images.length - 1}
              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent">
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => onRemove(i)}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleSelect} />
      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60">
        <ImagePlus className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Add image"}
      </button>
    </div>
  );
}

function RegistrantsDialog({ event, onOpenChange }) {
  const [registrants, setRegistrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!event) return;
    setLoading(true);
    setStatus("");
    setAddEmail("");
    fetchEventRegistrants(event.id)
      .then(setRegistrants)
      .catch(() => setStatus("Couldn't load registrants — please try again."))
      .finally(() => setLoading(false));
  }, [event]);

  // For events using an external registration link (event.registrationUrl),
  // sign-ups happen off-site — this is how staff keep the registrant list
  // and capacity accurate for those without an automatic pipeline back in.
  const handleAddRegistrant = async () => {
    const email = addEmail.trim();
    if (!email) return;
    setAdding(true);
    setStatus("");
    try {
      const added = await addEventRegistrant(event.id, email);
      setRegistrants((prev) => prev.some((r) => r.userId === added.userId) ? prev : [{ ...added }, ...prev]);
      setAddEmail("");
    } catch (err) {
      setStatus(err.message);
    } finally {
      setAdding(false);
    }
  };

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

        {event?.registrationUrl && (
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              placeholder="Add registrant by email…"
              className={inputCls}
            />
            <Button onClick={handleAddRegistrant} disabled={adding || !addEmail.trim()} className="shrink-0 bg-gray-900 text-white hover:bg-gray-700">
              <UserPlus className="h-3.5 w-3.5" /> {adding ? "Adding…" : "Add"}
            </Button>
          </div>
        )}
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

// event.status in the DB is set once at creation and never transitions on
// its own (no cron/trigger updates it) — so it only ever reflects an actual
// admin action (e.g. "cancelled"). Everything else (upcoming/ongoing/ended)
// has to be derived from the clock, same as the public Events pages.
const STATUS_STYLES = {
  upcoming: "bg-white/95 text-gray-700",
  ongoing: "bg-red-100 text-red-700",
  ended: "bg-gray-200 text-gray-500",
  cancelled: "bg-red-100 text-red-700",
};
function liveStatus(event) {
  return event.status === "cancelled" ? "cancelled" : getEventStatus(event);
}

function EventCard({ event, onEdit, onDelete, onViewRegistrants }) {
  const status = liveStatus(event);
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
        <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm capitalize ${STATUS_STYLES[status] || STATUS_STYLES.upcoming}`}>
          {status}
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
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [registrantsTarget, setRegistrantsTarget] = useState(null);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEventsPage({ page: 1, limit: PAGE_SIZE })
      .then(({ events, total }) => { setList(events); setTotal(total); })
      .catch(() => setListError("Couldn't load events — please try refreshing."))
      .finally(() => setLoading(false));
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setListError("");
    try {
      const nextPage = page + 1;
      const { events: more, total: freshTotal } = await fetchEventsPage({ page: nextPage, limit: PAGE_SIZE });
      setList((prev) => [...prev, ...more]);
      setTotal(freshTotal);
      setPage(nextPage);
    } catch {
      setListError("Couldn't load more events — please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAddImage = async (file) => {
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB."); return; }
    setUploading(true);
    setError("");
    try {
      const url = await uploadEventImage(file);
      setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) =>
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));

  const handleMoveImage = (index, dir) =>
    setForm((prev) => {
      const next = [...prev.images];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, images: next };
    });

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
      images: (ev.images || []).filter((url) => url !== PLACEHOLDER_IMAGE),
      registrationUrl: ev.registrationUrl || "",
      galleryUrl: ev.galleryUrl || "",
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
      images: form.images,
      registration_url: form.registrationUrl.trim() || null,
      gallery_url: form.galleryUrl.trim() || null,
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
        setTotal(t => t + 1);
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
      setTotal(t => t - 1);
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
          <p className="mt-1 text-sm text-gray-500">{total} total events</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Event
        </button>
      </div>

      {listError && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-600 text-sm px-4 py-2.5">{listError}</div>
      )}

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

      {!loading && list.length < total && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}

      {/* Add / Edit form — wide two-column layout, admin panel is desktop-only
          in practice, so there's no need to cram everything into one narrow
          stacked column like a mobile form would. */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit event" : "Add event"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the details for this event." : "Create a new event for the community bulletin board."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-5">
            {error && (
              <div className="rounded-lg bg-red-50 text-red-600 text-sm px-4 py-2.5">{error}</div>
            )}

            <div className="grid gap-5 lg:grid-cols-2 lg:gap-x-8">
              {/* Left column — the essentials */}
              <div className="grid gap-4 content-start">
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
                  <label className={labelCls}>Description</label>
                  <textarea className={inputCls} rows={6} value={form.description} onChange={updateField("description")} />
                </div>
              </div>

              {/* Right column — media and outbound links */}
              <div className="grid gap-4 content-start">
                <ImageListEditor
                  images={form.images}
                  onAdd={handleAddImage}
                  onRemove={handleRemoveImage}
                  onMove={handleMoveImage}
                  uploading={uploading}
                />

                <div>
                  <label className={labelCls}>Registration link <span className="font-normal text-gray-400">(optional — leave blank for in-app registration)</span></label>
                  <input
                    type="url"
                    className={inputCls}
                    value={form.registrationUrl}
                    onChange={updateField("registrationUrl")}
                    placeholder="https://forms.gle/…"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    If set, "Register" sends people to this link instead of registering in-app. Capacity and the registrant list still work — add registrants manually from the Registrants panel.
                  </p>
                </div>

                <div>
                  <label className={labelCls}>Photo gallery link <span className="font-normal text-gray-400">(optional — add after the event, e.g. a Google Drive folder)</span></label>
                  <input
                    type="url"
                    className={inputCls}
                    value={form.galleryUrl}
                    onChange={updateField("galleryUrl")}
                    placeholder="https://drive.google.com/…"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Shown as a "View event gallery" button once the event ends. Leave blank until photos are ready — attendees see "coming soon" until then.
                  </p>
                </div>
              </div>
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
