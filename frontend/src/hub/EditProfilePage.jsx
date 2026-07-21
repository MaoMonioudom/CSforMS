import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { useAuth } from "./AuthContext";
import { TopNav } from "../components/TopNav";
import { BackBar } from "../components/BackBar";
import { updateMyProfile, uploadMyAvatar } from "../lib/user-profile-data";

const D = {
  bg:     "#eef5fc",
  bg2:    "#dceafa",
  card:   "#ffffff",
  border: "rgba(91,170,216,0.22)",
  muted:  "#5b7286",
  faint:  "#8aa0b2",
  text:   "#16324a",
};

const inputCls = "w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2";

function Avatar({ name, avatar, size = 76 }) {
  const initials = name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) ?? "?";
  if (avatar) {
    return <img src={avatar} alt={name} className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />;
  }
  return (
    <div className="rounded-full flex items-center justify-center font-extrabold text-white shrink-0"
      style={{ width: size, height: size, background: "linear-gradient(135deg,#c9a86c,#0891b2)", fontSize: size * 0.34 }}>
      {initials}
    </div>
  );
}

export default function EditProfilePage() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", phone_number: "", bio: "", profile_img_url: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    setForm({
      full_name: user.name || "",
      phone_number: user.phone || "",
      bio: user.bio || "",
      profile_img_url: user.avatar || "",
    });
  }, [user, authLoading, navigate]);

  if (!user) return null;

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB."); return; }
    setUploading(true);
    setError("");
    try {
      const url = await uploadMyAvatar(file);
      setForm((prev) => ({ ...prev, profile_img_url: url }));
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await updateMyProfile({
        full_name: form.full_name.trim(),
        phone_number: form.phone_number.trim(),
        bio: form.bio.trim(),
        profile_img_url: form.profile_img_url || null,
      });
      updateUser({ name: updated.full_name, avatar: updated.profile_img_url, phone: updated.phone_number, bio: updated.bio });
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${D.bg} 0%, ${D.bg2} 100%)` }}>
      <TopNav />
      <BackBar />

      <main className="relative z-10 mx-auto max-w-xl px-4 sm:px-6 py-12">
        <button onClick={() => navigate("/profile")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold mb-6 hover:opacity-70 transition-opacity"
          style={{ color: D.muted }}>
          <ArrowLeft size={14} /> Back to profile
        </button>

        <div className="rounded-2xl p-8" style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.08)" }}>
          <h1 className="text-xl font-extrabold mb-6" style={{ color: D.text }}>Edit profile</h1>

          {error && (
            <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={form.full_name} avatar={form.profile_img_url} />
              <div>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarSelect} />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-60"
                  style={{ color: D.text, borderColor: D.border }}>
                  <ImagePlus size={14} /> {uploading ? "Uploading…" : "Change photo"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: D.muted }}>Full name</label>
              <input required className={inputCls} style={{ borderColor: D.border, color: D.text }}
                value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: D.muted }}>Phone number <span className="font-normal" style={{ color: D.faint }}>(optional)</span></label>
              <input className={inputCls} style={{ borderColor: D.border, color: D.text }}
                value={form.phone_number} onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))} />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: D.muted }}>Bio <span className="font-normal" style={{ color: D.faint }}>(optional)</span></label>
              <textarea rows={3} className={inputCls} style={{ borderColor: D.border, color: D.text }}
                value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate("/profile")}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ color: D.text, border: `1px solid ${D.border}`, background: D.card }}>
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#c9a86c,#0891b2)" }}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
