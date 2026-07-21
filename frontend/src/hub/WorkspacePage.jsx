import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Armchair, Check, Clock } from "lucide-react";
import { useAuth } from "./AuthContext";
import { TopNav } from "../components/TopNav";
import {
  TIME_SLOTS, getUpcomingDates, fetchWorkspaces, fetchTakenSlots,
  fetchMyBookings, createBooking, cancelBooking, getSlotOccupancy,
} from "../lib/workspace-data";

const D = {
  bg:     "#eef5fc",
  bg2:    "#dceafa",
  card:   "#ffffff",
  border: "rgba(91,170,216,0.22)",
  muted:  "#5b7286",
  faint:  "#8aa0b2",
  text:   "#16324a",
};

const STATUS_STYLE = {
  pending:  { label: "Pending",  bg: "rgba(245,158,11,0.12)", color: "#b45309" },
  approved: { label: "Approved", bg: "rgba(16,185,129,0.12)", color: "#10b981" },
  denied:   { label: "Denied",   bg: "rgba(239,68,68,0.12)",  color: "#dc2626" },
};

const DATES = getUpcomingDates(5);

function SectionLabel({ children }) {
  return <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: D.muted }}>{children}</p>;
}

export default function WorkspacePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [dateKey, setDateKey] = useState(DATES[0].key);
  const [workspaces, setWorkspaces] = useState([]);
  const [takenSlots, setTakenSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingKey, setSubmittingKey] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState("");

  // Wait for AuthContext to finish confirming a stored token before
  // deciding the user is logged out — otherwise a refresh bounces someone
  // who's genuinely still logged in through /login and out to /inventory,
  // since `user` briefly reads null while that check is still in flight.
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    if (!user.isMember) navigate("/membership");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user?.isMember) return;
    Promise.all([fetchWorkspaces(), fetchMyBookings()])
      .then(([ws, mine]) => { setWorkspaces(ws); setMyBookings(mine); })
      .catch(() => setError("Couldn't load workspace data — please try refreshing."))
      .finally(() => setLoading(false));
  }, [user?.isMember]);

  useEffect(() => {
    if (!user?.isMember) return;
    fetchTakenSlots(dateKey).then(setTakenSlots).catch(() => {});
  }, [dateKey, user?.isMember]);

  if (!user || !user.isMember) return null;

  const request = async (seat, slot) => {
    const key = `${seat.id}-${slot.label}`;
    setSubmittingKey(key);
    setError("");
    try {
      const booking = await createBooking({ workspaceId: seat.id, dateKey, slot });
      setMyBookings((prev) => [booking, ...prev]);
      const fresh = await fetchTakenSlots(dateKey);
      setTakenSlots(fresh);
    } catch (err) {
      setError(err.message || "Couldn't submit that request — please try again.");
      fetchTakenSlots(dateKey).then(setTakenSlots).catch(() => {});
    } finally {
      setSubmittingKey(null);
    }
  };

  const handleCancel = async (id) => {
    setCancellingId(id);
    setError("");
    try {
      await cancelBooking(id);
      setMyBookings((prev) => prev.filter((b) => b.id !== id));
      const fresh = await fetchTakenSlots(dateKey);
      setTakenSlots(fresh);
    } catch (err) {
      setError(err.message || "Couldn't cancel that request — please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const dateLabel = DATES.find(d => d.key === dateKey)?.label;

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${D.bg} 0%, ${D.bg2} 100%)` }}>
      <div aria-hidden className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: `linear-gradient(rgba(99,102,241,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.05) 1px,transparent 1px)`, backgroundSize: "48px 48px" }} />

      <TopNav />

      <main className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 py-12">

        {/* Hero */}
        <div className="rounded-2xl p-8 mb-8 text-center relative overflow-hidden"
          style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.08)" }}>
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 2, background: "linear-gradient(90deg,transparent,#6366f1,#a855f7,transparent)" }} />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.28)" }}>
            <Armchair size={24} style={{ color: "#6366f1" }} />
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: D.text }}>Request a Working Space</h1>
          <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: D.muted }}>
            Pick a date and an open slot below. Staff will review and approve your request.
          </p>
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 mb-6 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}>
            {error}
          </div>
        )}

        {/* Date picker */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {DATES.map(d => {
            const active = d.key === dateKey;
            return (
              <button key={d.key} onClick={() => setDateKey(d.key)}
                className="shrink-0 text-xs font-bold px-3.5 py-2 rounded-full transition-all"
                style={active
                  ? { background: "#6366f1", color: "white", border: "1px solid #6366f1" }
                  : { background: D.card, color: D.muted, border: `1px solid ${D.border}` }}>
                {d.label}
              </button>
            );
          })}
        </div>

        {/* Seat availability */}
        <div className="mb-8">
          <SectionLabel>Availability — {dateLabel}</SectionLabel>
          {loading ? (
            <p className="text-xs" style={{ color: D.muted }}>Loading…</p>
          ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
            {workspaces.map((seat, i) => (
              <div key={seat.id} className="flex items-center gap-3 px-4 py-3.5 flex-wrap"
                style={{ borderBottom: i < workspaces.length - 1 ? "1px solid rgba(15,50,80,0.08)" : "none" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(99,102,241,0.10)" }}>
                  <Armchair size={16} style={{ color: "#6366f1" }} />
                </div>
                <div className="min-w-[120px] mr-1">
                  <p className="text-sm font-semibold" style={{ color: D.text }}>{seat.label}</p>
                  <p className="text-[11px]" style={{ color: D.faint }}>{seat.zone}</p>
                </div>
                <div className="flex gap-1.5 flex-wrap flex-1 justify-end">
                  {TIME_SLOTS.map(slot => {
                    const { count, full } = getSlotOccupancy(takenSlots, seat.id, dateKey, slot, seat.capacity);
                    // One request per person per (desk, slot) regardless of
                    // capacity — no reason to hold more than one seat for
                    // yourself in the same room at the same time.
                    const alreadyMine = myBookings.some((b) =>
                      b.workspaceId === seat.id && b.date === dateKey && b.slot === slot.label && (b.status === "pending" || b.status === "approved")
                    );
                    const key = `${seat.id}-${slot.label}`;
                    const submitting = submittingKey === key;
                    const disabled = full || alreadyMine || submitting;
                    return (
                      <button key={slot.label} disabled={disabled} onClick={() => request(seat, slot)}
                        className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all disabled:cursor-not-allowed"
                        style={disabled
                          ? { background: "rgba(15,50,80,0.05)", color: D.faint }
                          : { background: "rgba(99,102,241,0.10)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.24)" }}>
                        {submitting
                          ? "…"
                          : alreadyMine
                            ? `${slot.label} (Requested)`
                            : seat.capacity > 1 ? `${slot.label} (${count}/${seat.capacity})` : slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* My requests */}
        <div>
          <SectionLabel>My Requests</SectionLabel>
          {loading ? (
            <p className="text-xs" style={{ color: D.muted }}>Loading…</p>
          ) : myBookings.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: D.card, border: `1px solid ${D.border}` }}>
              <Clock size={22} style={{ color: D.faint }} className="mx-auto mb-2" />
              <p className="text-xs" style={{ color: D.muted }}>No requests yet — pick an open slot above.</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
              {myBookings.map((r, i) => {
                const s = STATUS_STYLE[r.status];
                const label = DATES.find(d => d.key === r.date)?.label ?? r.date;
                const cancelling = cancellingId === r.id;
                return (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-3.5"
                    style={{ borderBottom: i < myBookings.length - 1 ? "1px solid rgba(15,50,80,0.08)" : "none" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: D.text }}>{r.seatLabel}</p>
                      <p className="text-[11px]" style={{ color: D.faint }}>{label} · {r.slot}</p>
                    </div>
                    {r.status === "pending" && (
                      <button onClick={() => handleCancel(r.id)} disabled={cancelling}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 transition-colors disabled:opacity-50"
                        style={{ color: D.muted, border: `1px solid ${D.border}` }}>
                        {cancelling ? "…" : "Cancel"}
                      </button>
                    )}
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0"
                      style={{ background: s.bg, color: s.color }}>
                      {r.status === "approved" && <Check size={11} className="inline -mt-0.5 mr-0.5" />}
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
