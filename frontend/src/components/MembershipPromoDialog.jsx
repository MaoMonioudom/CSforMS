import { useNavigate } from "react-router-dom";
import { Coins, GraduationCap, Package, Armchair } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from "./community/ui/dialog";

const PERKS = [
  { icon: GraduationCap, text: "Earn credits by joining workshops and completing courses" },
  { icon: Package,       text: "Spend credits to borrow or take home Inventory items" },
  { icon: Armchair,      text: "Request a personal desk or bench at the makerspace" },
];

// Shown when a signed-in, non-member user taps the credits slot in the
// profile menu — a quick teaser before sending them to the full pitch page.
export function MembershipPromoDialog({ open, onOpenChange }) {
  const navigate = useNavigate();

  const learnMore = () => {
    onOpenChange(false);
    navigate("/membership");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-none rounded-2xl p-6 shadow-2xl" style={{ background: "#ffffff" }}>
        <DialogHeader className="items-center text-center sm:text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto"
            style={{ background: "rgba(16,185,129,0.12)" }}>
            <Coins size={20} style={{ color: "#10b981" }} />
          </div>
          <DialogTitle className="text-lg font-bold text-center" style={{ color: "#16324a" }}>
            Unlock Makerspace Membership
          </DialogTitle>
          <DialogDescription className="text-center" style={{ color: "#5b7286" }}>
            $20/year gets you a credit balance you can earn or top up, plus the ability to request a workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 my-2">
          {PERKS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "rgba(16,185,129,0.10)" }}>
                <Icon size={13} style={{ color: "#10b981" }} />
              </div>
              <p className="text-xs leading-relaxed pt-1" style={{ color: "#16324a" }}>{text}</p>
            </div>
          ))}
        </div>

        <DialogFooter className="sm:justify-center gap-2 mt-2">
          <button onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ color: "#5b7286", border: "1px solid rgba(15,50,80,0.14)", background: "white" }}>
            Maybe later
          </button>
          <button onClick={learnMore}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: "#10b981" }}>
            See Membership
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
