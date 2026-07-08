import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../hub/AuthContext";
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from "./community/ui/dialog";

// Shared confirm-before-sign-out modal. Used from the module TopNav (desktop
// and mobile quick menus) and from ProfilePage — keeps the confirmation UX
// and copy consistent everywhere sign-out can be triggered.
export function SignOutConfirmDialog({ open, onOpenChange, redirectTo = "/", onSignedOut }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const confirmSignOut = () => {
    logout();
    onOpenChange(false);
    onSignedOut?.();
    navigate(redirectTo);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-none rounded-2xl p-6 shadow-2xl" style={{ background: "#ffffff" }}>
        <DialogHeader className="items-center text-center sm:text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto"
            style={{ background: "rgba(239,68,68,0.12)" }}>
            <LogOut size={20} style={{ color: "#dc2626" }} />
          </div>
          <DialogTitle className="text-lg font-bold text-center" style={{ color: "#16324a" }}>
            Sign out of CADT Hub?
          </DialogTitle>
          <DialogDescription className="text-center" style={{ color: "#5b7286" }}>
            You'll need to sign in again to access your profile, badges, and saved progress.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2 mt-2">
          <button onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ color: "#5b7286", border: "1px solid rgba(15,50,80,0.14)", background: "white" }}>
            Cancel
          </button>
          <button onClick={confirmSignOut}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: "#dc2626" }}>
            <LogOut size={14} className="inline -mt-0.5 mr-1.5" /> Sign Out
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
