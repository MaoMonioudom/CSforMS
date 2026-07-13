import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hub/AuthContext";

const ALLOWED_ROLES = ["Admin", "Staff", "Lecturer"];

// Gates the entire /admin route tree. AdminLayout itself has no auth
// awareness — it renders the sidebar/shell unconditionally for whoever
// reaches it — so this has to sit above it in the route tree, not inside it.
export default function AdminGuard() {
  const { user, loading } = useAuth();

  // Still checking a stored token against the backend — render nothing
  // rather than bounce to /login before we actually know.
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!ALLOWED_ROLES.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
