import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hub/AuthContext";

const ALLOWED_ROLES = ["Admin", "Staff"];

// Gates the entire /admin route tree. AdminLayout itself has no auth
// awareness — it renders the sidebar/shell unconditionally for whoever
// reaches it — so this has to sit above it in the route tree, not inside it.
export default function AdminGuard() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!ALLOWED_ROLES.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
