import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, setToken, getToken } from "../lib/api/client";

const AuthCtx = createContext(null);

// Backend roles are lowercase ('admin'/'staff'/'user'); the rest of the
// frontend (AdminGuard, AdminSidebar's role badge, etc.) was built around
// capitalized roles ('Admin'/'Staff'/'User') — map at the boundary so
// nothing downstream has to care which convention the API uses.
const ROLE_MAP = { admin: "Admin", staff: "Staff", user: "User" };

function toFrontendUser(row) {
  return {
    id: row.user_id,
    name: row.full_name,
    email: row.email,
    role: ROLE_MAP[row.role] || "User",
    avatar: row.profile_img_url || null,
    // Filled in separately by loadMembership() — membership/credits live in
    // their own table, fetched after identity so a slow membership lookup
    // never blocks login.
    isMember: false,
    credits: 0,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Single source of truth for isMember/credits — every module reads this
  // instead of keeping its own local copy. Safe to call any time (e.g.
  // after an admin activates membership or adds credits) to pull fresh
  // numbers without a full session reload.
  const refreshMembership = useCallback(async () => {
    try {
      const { data } = await api.get("/api/membership/me");
      setUser(prev => (prev ? { ...prev, isMember: data.isMember, credits: data.credits } : prev));
    } catch {
      // Not fatal — the user just keeps seeing the last-known balance.
    }
  }, []);

  // On mount, if a token is already stored (from a previous visit), confirm
  // it's still valid and restore the session — otherwise every page refresh
  // would silently sign the user out.
  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api.get("/api/auth/session")
      .then(({ user: row }) => {
        setUser(toFrontendUser(row));
        refreshMembership();
      })
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, [refreshMembership]);

  const login = async (email, password) => {
    const { token, user: row } = await api.post("/api/auth/login", { email, password });
    setToken(token);
    const mapped = toFrontendUser(row);
    setUser(mapped);
    refreshMembership();
    return mapped;
  };

  const signup = async ({ name, email, password }) => {
    const { token, user: row } = await api.post("/api/auth/signup", { full_name: name, email, password });
    setToken(token);
    const mapped = toFrontendUser(row);
    setUser(mapped);
    refreshMembership();
    return mapped;
  };

  // Establishes a session from a token issued outside the normal login/signup
  // calls — the Microsoft OAuth callback and the reset-password flow both
  // hand back a ready-made session token instead of credentials.
  const loginWithToken = async (token) => {
    setToken(token);
    const { user: row } = await api.get("/api/auth/session");
    const mapped = toFrontendUser(row);
    setUser(mapped);
    refreshMembership();
    return mapped;
  };

  const logout = () => { setUser(null); setToken(null); };

  // Patches fields on the current user client-side only — for things that
  // don't need a round trip. Membership/credits go through
  // refreshMembership() instead, since the server owns those now.
  const updateUser = (patch) => {
    setUser(prev => (prev ? { ...prev, ...patch } : prev));
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, signup, loginWithToken, logout, updateUser, refreshMembership }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
