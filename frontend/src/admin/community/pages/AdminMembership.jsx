import { useState, useEffect } from "react";
import { Search, Coins, BadgeCheck, Loader2 } from "lucide-react";
import { api } from "../../../lib/api/client";

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400";

const ROLE_BADGE = {
  admin: "bg-red-50 text-red-600",
  staff: "bg-violet-50 text-violet-600",
  user: "bg-gray-100 text-gray-500",
};

function StatusPill({ isMember }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
      isMember ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
    }`}>
      {isMember ? <BadgeCheck className="h-3 w-3" /> : null}
      {isMember ? "Active member" : "Not a member"}
    </span>
  );
}

export default function AdminMembership() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selected, setSelected] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loadingMembership, setLoadingMembership] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");

  useEffect(() => {
    api.get("/api/users")
      .then(({ data }) => setUsers(data))
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false));
  }, []);

  const results = query.trim()
    ? users.filter(u =>
        u.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        u.email?.toLowerCase().includes(query.toLowerCase()) ||
        u.student_id?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const selectUser = (u) => {
    setSelected(u);
    setQuery("");
    setError("");
    setTopUpOpen(false);
    setTopUpAmount("");
    setLoadingMembership(true);
    api.get(`/api/membership/${u.user_id}`)
      .then(({ data }) => setMembership(data))
      .catch(() => setError("Couldn't load membership for this user."))
      .finally(() => setLoadingMembership(false));
  };

  const activate = async () => {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(`/api/membership/${selected.user_id}/activate`, {});
      setMembership(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitTopUp = async (e) => {
    e.preventDefault();
    const credits = Number(topUpAmount);
    if (!credits || credits <= 0) {
      setError("Enter a positive number of credits.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(`/api/membership/${selected.user_id}/topup`, { credits });
      setMembership(data);
      setTopUpOpen(false);
      setTopUpAmount("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Membership &amp; Credits</h1>
        <p className="mt-1 text-sm text-gray-500">
          Search a student to activate their membership or add credits after they pay at the front desk.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={loadingUsers ? "Loading users…" : "Search by name, email, or student ID…"}
            disabled={loadingUsers}
            className={`${inputCls} pl-9`}
          />

          {results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden max-h-64 overflow-y-auto">
              {results.map((u) => (
                <button
                  key={u.user_id}
                  onClick={() => selectUser(u)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.full_name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROLE_BADGE[u.role] ?? "bg-gray-100 text-gray-500"}`}>
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {!selected ? (
          <p className="text-sm text-gray-400 py-6 text-center">Search for a student above to get started.</p>
        ) : (
          <div className="rounded-lg border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{selected.full_name}</p>
                <p className="text-xs text-gray-400 truncate">{selected.email}{selected.student_id ? ` · ${selected.student_id}` : ""}</p>
              </div>
              {loadingMembership ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400 shrink-0" />
              ) : membership && <StatusPill isMember={membership.isMember} />}
            </div>

            {!loadingMembership && membership && (
              <>
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <Coins className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 leading-none">{membership.credits}</p>
                    <p className="text-[11px] text-gray-400">credits available</p>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 text-red-600 text-sm px-4 py-2.5 mb-4">{error}</div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  {!membership.isMember && (
                    <button
                      onClick={activate}
                      disabled={busy}
                      className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      <BadgeCheck className="h-4 w-4" /> Activate Membership
                    </button>
                  )}

                  {membership.isMember && !topUpOpen && (
                    <button
                      onClick={() => setTopUpOpen(true)}
                      className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Coins className="h-4 w-4" /> Add Credits
                    </button>
                  )}
                </div>

                {topUpOpen && (
                  <form onSubmit={submitTopUp} className="flex items-center gap-2 mt-4">
                    <input
                      type="number" min="1" autoFocus value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      placeholder="Credits to add"
                      className={`${inputCls} max-w-[160px]`}
                    />
                    <button type="submit" disabled={busy}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50">
                      Add
                    </button>
                    <button type="button" onClick={() => { setTopUpOpen(false); setTopUpAmount(""); }}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                      Cancel
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
