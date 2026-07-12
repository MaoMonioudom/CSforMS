import { createContext, useContext, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cadt_hub_user") || "null"); }
    catch { return null; }
  });

  const login  = (u) => {
    const data = { avatar: null, isMember: false, credits: 0, ...u };
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
