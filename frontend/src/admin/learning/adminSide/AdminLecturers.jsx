import { useState } from "react";
import { Plus, UserX, UserCheck } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from "@/components/community/ui/dialog";
import { useCourses } from "../../../hooks/learning/useCourses";
import { useLecturers } from "../../../hooks/learning/useLecturers";

const inputCls = "w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-border";

const statusColors = {
  Active:      "bg-emerald-50 text-emerald-600",
  Deactivated: "bg-red-50 text-red-500",
};

function AddLecturerDialog({ open, onOpenChange, onCreate }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Name, email, and password are all required.");
      return;
    }
    const result = await onCreate({ name: form.name.trim(), email: form.email.trim(), password: form.password });
    if (result?.error) {
      setError(result.error);
      return;
    }
    setForm({ name: "", email: "", password: "" });
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Add lecturer</DialogTitle>
            <DialogDescription>Create a lecturer account for the Learning module.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <input placeholder="Full name" value={form.name} onChange={set("name")} className={inputCls} autoFocus />
            <input placeholder="Email" value={form.email} onChange={set("email")} className={inputCls} />
            <input placeholder="Password" value={form.password} onChange={set("password")} className={inputCls} />
            {error && <span className="text-xs text-red-500">{error}</span>}
          </div>
          <DialogFooter className="mt-4">
            <button type="button" onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-foreground hover:bg-foreground transition-colors">
              Create lecturer
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminLecturers() {
  const { courses } = useCourses();
  const { lecturers, createLecturer, setActive } = useLecturers();
  const [addOpen, setAddOpen] = useState(false);

  const courseCountFor = (lecturerId) => courses.filter((c) => c.instructorId === lecturerId).length;

  const create = async ({ name, email, password }) => {
    try {
      await createLecturer({ name, email, password });
      setAddOpen(false);
      return { ok: true };
    } catch (err) {
      return { error: err.message || "Could not create the lecturer." };
    }
  };
  const toggleActive = async (lecturer) => {
    try {
      await setActive(lecturer.id, !lecturer.active);
    } catch (err) {
      window.alert(err.message || "Could not update the lecturer.");
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lecturers</h1>
          <p className="mt-1 text-sm text-muted-foreground">{lecturers.length} lecturer accounts</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 bg-foreground text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-foreground transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Lecturer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Courses</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lecturers.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">No lecturers yet.</td></tr>
              ) : lecturers.map((l) => {
                const status = l.active ? "Active" : "Deactivated";
                return (
                  <tr key={l.id} className="hover:bg-muted transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground">{l.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground hidden sm:table-cell">{l.email}</td>
                    <td className="px-5 py-3.5 text-foreground tabular-nums">{courseCountFor(l.id)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[status]}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end">
                        <button
                          onClick={() => toggleActive(l)}
                          className={`p-1.5 rounded-md transition-colors ${
                            l.active
                              ? "text-muted-foreground hover:text-amber-600 hover:bg-amber-50"
                              : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={l.active ? "Deactivate" : "Activate"}
                        >
                          {l.active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AddLecturerDialog open={addOpen} onOpenChange={setAddOpen} onCreate={create} />
    </div>
  );
}
