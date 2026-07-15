import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { destinationFor } from "./authNav";
import { D } from "./authUi";

// Landing spot for the Microsoft "Continue with Microsoft" redirect
// (intent=login) — the backend already issued a session token, this page
// just has to pick it up and finish signing the user in.
export default function MicrosoftCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (!token) {
      navigate(`/login${error ? `?error=${error}` : ""}`, { replace: true });
      return;
    }

    loginWithToken(token)
      .then((user) => navigate(destinationFor(user.role), { replace: true }))
      .catch(() => navigate("/login?error=invalid_state", { replace: true }));
  }, [location.search, loginWithToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: `linear-gradient(160deg, ${D.bg} 0%, ${D.bg2} 100%)` }}>
      <div className="flex flex-col items-center gap-3">
        <span className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "rgba(15,50,80,0.15)", borderTopColor: "#6366f1" }} />
        <p className="text-sm font-medium" style={{ color: D.muted }}>Signing you in…</p>
      </div>
    </div>
  );
}
