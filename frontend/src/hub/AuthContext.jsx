import { createContext, useContext, useState, useEffect } from "react";
import { api, setToken, getToken } from "../lib/api/client";

const AuthCtx = createContext(null);

// Backend roles are lowercase ('admin'/'staff'/'user'); the rest of the
// frontend (AdminGuard, AdminSidebar's role badge, etc.) was built around
// capitalized roles ('Admin'/'Staff'/'User') — map at the boundary so
// nothing downstream has to care which convention the API uses.
const ROLE_MAP = { admin: "Admin", staff: "Staff", user: "User" };

// isMember/credits aren't backed by a real membership/credits table yet —
// keep them as client-only fields until that exists, same as before.
function toFrontendUser(row) {
  return {
    id: row.user_id,
    name: row.full_name,
    email: row.email,
    role: ROLE_MAP[row.role] || "User",
    avatar: row.profile_img_url || null,
    isMember: false,
    credits: 0,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, if a token is already stored (from a previous visit), confirm
  // it's still valid and restore the session — otherwise every page refresh
  // would silently sign the user out.
  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api.get("/api/auth/session")
      .then(({ user: row }) => setUser(toFrontendUser(row)))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { token, user: row } = await api.post("/api/auth/login", { email, password });
    setToken(token);
    const mapped = toFrontendUser(row);
    setUser(mapped);
    return mapped;
  };

  const signup = async ({ name, email, password }) => {
    const { token, user: row } = await api.post("/api/auth/signup", { full_name: name, email, password });
    setToken(token);
    const mapped = toFrontendUser(row);
    setUser(mapped);
    return mapped;
  };

  const logout = () => { setUser(null); setToken(null); };

  // Patches fields on the current user (e.g. joining membership, spending
  // credits) — client-only until membership/credits have a real endpoint.
  const updateUser = (patch) => {
    setUser(prev => (prev ? { ...prev, ...patch } : prev));
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
