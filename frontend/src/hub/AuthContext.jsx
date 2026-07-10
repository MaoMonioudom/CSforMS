import { createContext, useContext, useState } from "react";

const AuthCtx = createContext(null);

// Mock-only role convention until real Supabase auth/profiles exist: an
// email containing "admin" or "staff" logs in as that role, so the admin
// guard and permissions can be tested without a real backend. Exported so
// AuthPage can decide where to redirect right after login, without
// duplicating this rule.
export function inferRole(email = "") {
  if (/admin/i.test(email)) return "Admin";
  if (/staff/i.test(email)) return "Staff";
  return "User";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cadt_hub_user") || "null"); }
    catch { return null; }
  });

  const login  = (u) => {
    const data = { avatar: null, isMember: false, credits: 0, role: inferRole(u.email), ...u };
    setUser(data);
    localStorage.setItem("cadt_hub_user", JSON.stringify(data));
  };
  const logout = ()  => { setUser(null); localStorage.removeItem("cadt_hub_user"); };

  // Patches fields on the current user (e.g. joining membership, spending
  // credits) and keeps localStorage in sync — mock persistence until this
  // is backed by real Supabase profile/credits data.
  const updateUser = (patch) => {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem("cadt_hub_user", JSON.stringify(next));
      return next;
    });
  };

  return <AuthCtx.Provider value={{ user, login, logout, updateUser }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
