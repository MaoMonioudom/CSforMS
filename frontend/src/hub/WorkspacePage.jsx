import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Armchair, Check, Clock } from "lucide-react";
import { useAuth } from "./AuthContext";
import { TopNav } from "../components/TopNav";
import {
  SEATS, TIME_SLOTS, getUpcomingDates, getRequests, addRequest, isSlotTaken,
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dateKey, setDateKey] = useState(DATES[0].key);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!user.isMember) navigate("/membership");
  }, [user, navigate]);

  useEffect(() => { setRequests(getRequests()); }, []);

  if (!user || !user.isMember) return null;

  const request = (seat, slot) => {
    const next = addRequest({
      userEmail: user.email,
      userName:  user.name,
      seatId:    seat.id,
      seatLabel: seat.label,
      date:      dateKey,
      slot,
    });
    setRequests(next);
  };

  const myRequests = useMemo(
    () => requests.filter(r => r.userEmail === user.email).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
    [requests, user.email]
  );

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
          <div className="rounded-2xl overflow-hidden" style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
            {SEATS.map((seat, i) => (
              <div key={seat.id} className="flex items-center gap-3 px-4 py-3.5 flex-wrap"
                style={{ borderBottom: i < SEATS.length - 1 ? "1px solid rgba(15,50,80,0.08)" : "none" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(99,102,241,0.10)" }}>
                  <Armchair size={16} style={{ color: "#6366f1" }} />
                </div>
                <div className="min-w-[120px] mr-1">
                  <p className="text-sm font-semibold" style={{ color: D.text }}>{seat.label}</p>
                  <p className="text-[11px]" style={{ color: D.faint }}>{seat.zone}</p>
                </div>
                <div className="flex gap-1.5 flex-wrap flex-1 justify-end">
                  {TIME_SLOTS.map(slot => {
                    const taken = isSlotTaken(requests, seat.id, dateKey, slot);
                    return (
                      <button key={slot} disabled={taken} onClick={() => request(seat, slot)}
                        className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all disabled:cursor-not-allowed"
                        style={taken
                          ? { background: "rgba(15,50,80,0.05)", color: D.faint }
                          : { background: "rgba(99,102,241,0.10)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.24)" }}>
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My requests */}
        <div>
          <SectionLabel>My Requests</SectionLabel>
          {myRequests.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: D.card, border: `1px solid ${D.border}` }}>
              <Clock size={22} style={{ color: D.faint }} className="mx-auto mb-2" />
              <p className="text-xs" style={{ color: D.muted }}>No requests yet — pick an open slot above.</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: "0 2px 20px rgba(15,50,80,0.06)" }}>
              {myRequests.map((r, i) => {
                const s = STATUS_STYLE[r.status];
                const label = DATES.find(d => d.key === r.date)?.label ?? r.date;
                return (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-3.5"
                    style={{ borderBottom: i < myRequests.length - 1 ? "1px solid rgba(15,50,80,0.08)" : "none" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: D.text }}>{r.seatLabel}</p>
                      <p className="text-[11px]" style={{ color: D.faint }}>{label} · {r.slot}</p>
                    </div>
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
