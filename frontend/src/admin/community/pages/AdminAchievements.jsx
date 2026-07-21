import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, ImagePlus, Award } from "lucide-react";
import {
  fetchAchievements, createAchievement, updateAchievement, deleteAchievement,
  uploadAchievementIcon, REQUIREMENT_TYPE_LABELS,
} from "@/lib/achievements-data";
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from "@/components/community/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from "@/components/community/ui/alert-dialog";

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1";

const EMPTY_FORM = { title: "", description: "", requirement_type: "event_registrations", requirement_value: "1", icon_url: "" };

export default function AdminAchievements() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAchievements()
      .then(setList)
      .catch(() => setListError("Couldn't load achievements — please try refreshing."))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setFormOpen(true);
  };

  const openEdit = (a) => {
    setEditingId(a.achievement_id);
    setForm({
      title: a.title,
      description: a.description || "",
      requirement_type: a.requirement_type,
      requirement_value: String(a.requirement_value),
      icon_url: a.icon_url || "",
    });
    setError("");
    setFormOpen(true);
  };

  const handleIconSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Icon image must be under 5MB."); return; }
    setUploading(true);
    setError("");
    try {
      const url = await uploadAchievementIcon(file);
      setForm((prev) => ({ ...prev, icon_url: url }));
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      requirement_type: form.requirement_type,
      requirement_value: Number(form.requirement_value),
      icon_url: form.icon_url || null,
    };

    setSaving(true);
    setError("");
    try {
      if (editingId) {
        const updated = await updateAchievement(editingId, payload);
        setList((prev) => prev.map((a) => (a.achievement_id === editingId ? updated : a)));
      } else {
        const created = await createAchievement(payload);
        setList((prev) => [...prev, created]);
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
      await deleteAchievement(deleteTarget.achievement_id);
      setList((prev) => prev.filter((a) => a.achievement_id !== deleteTarget.achievement_id));
    } catch (err) {
      setListError(err.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
          <p className="mt-1 text-sm text-gray-500">Badges members can earn — {list.length} defined.</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          <Plus className="h-4 w-4" /> Add achievement
        </button>
      </div>

      {listError && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-600 text-sm px-4 py-2.5">{listError}</div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-400">No achievements yet — add one above.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((a) => (
            <div key={a.achievement_id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                {a.icon_url
                  ? <img src={a.icon_url} alt={a.title} className="h-full w-full object-cover" />
                  : <Award className="h-5 w-5 text-gray-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{a.title}</p>
                <p className="text-xs text-gray-400 truncate">{a.description || "No description"}</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  {REQUIREMENT_TYPE_LABELS[a.requirement_type] || a.requirement_type} ≥ {a.requirement_value}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <button onClick={() => openEdit(a)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setDeleteTarget(a)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit achievement" : "Add achievement"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update this badge's details or requirement." : "Define a new badge and what earns it."}
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
              <label className={labelCls}>Description <span className="font-normal text-gray-400">(optional)</span></label>
              <textarea className={inputCls} rows={2} value={form.description} onChange={updateField("description")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Requirement</label>
                <select className={inputCls} value={form.requirement_type} onChange={updateField("requirement_type")}>
                  {Object.entries(REQUIREMENT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>At least</label>
                <input type="number" min="1" className={inputCls} value={form.requirement_value} onChange={updateField("requirement_value")} required />
              </div>
            </div>

            <div>
              <label className={labelCls}>Badge icon <span className="font-normal text-gray-400">(optional)</span></label>
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  {form.icon_url
                    ? <img src={form.icon_url} alt="Badge icon" className="h-full w-full object-cover" />
                    : <ImagePlus className="h-5 w-5 text-gray-300" />}
                </div>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" className="hidden" onChange={handleIconSelect} />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60">
                  <ImagePlus className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : form.icon_url ? "Change icon" : "Upload icon"}
                </button>
                {form.icon_url && (
                  <button type="button" onClick={() => setForm((prev) => ({ ...prev, icon_url: "" }))}
                    className="text-sm font-medium text-red-500 hover:text-red-600">
                    Remove
                  </button>
                )}
              </div>
            </div>

            <DialogFooter className="mt-2">
              <button type="button" onClick={() => setFormOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors disabled:opacity-50">
                {editingId ? "Save changes" : "Create achievement"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the badge entirely, including everyone who's already earned it. This can't be undone.
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
