import { createContext, useContext, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cadt_hub_user") || "null"); }
    catch { return null; }
  });

  const login  = (u) => { const data = { ...u, avatar: u.avatar ?? null }; setUser(data); localStorage.setItem("cadt_hub_user", JSON.stringify(data)); };
  const logout = ()  => { setUser(null); localStorage.removeItem("cadt_hub_user"); };

  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
