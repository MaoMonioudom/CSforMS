import { useState } from "react";
import { useAuth } from "../../../../hub/AuthContext";

/**
 * Spends credits (the same wallet Membership/Inventory use) to unlock a
 * course's interactive path. Requires an active membership, since credits
 * only exist on a membership row — see backend/src/shared/credits.js.
 */
export default function CheckoutModal({ course, price, onSuccess, onClose }) {
  const { user, refreshMembership } = useAuth();
  const [status, setStatus] = useState("idle"); // idle | processing | success
  const [error, setError] = useState("");

  const isMember = !!user?.isMember;
  const balance = user?.credits ?? 0;
  const canAfford = isMember && balance >= price;

  const submit = async () => {
    setError("");
    setStatus("processing");
    try {
      await onSuccess();
      await refreshMembership();
      setStatus("success");
      setTimeout(onClose, 700);
    } catch (err) {
      setError(err.message || "Couldn't unlock this path. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-deep/[0.72] p-4 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[400px] rounded-lg bg-parchment px-6 pb-6 pt-8 shadow-open"
        onClick={(e) => e.stopPropagation()}
      >
        {status === "success" ? (
          <div className="py-6 text-center">
            <div className="mb-3 text-4xl">✅</div>
            <h3 className="mb-2 text-ink">Unlocked!</h3>
            <p className="text-sm text-[#2C2C2C]/70">
              Interactive path unlocked for {course.title}.
            </p>
          </div>
        ) : (
          <>
            <button
              className="absolute right-3.5 top-3 cursor-pointer p-1 text-2xl leading-none text-black/40 hover:text-black/70"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>

            <span className="badge mb-3 bg-community-gold/[0.18] uppercase tracking-[0.08em] text-community-gold-light-foreground">
              🤖 Interactive Path
            </span>
            <h3 className="mb-1.5 text-2xl text-ink">
              Unlock {course.title}
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-[#2C2C2C]/[0.72]">
              Get an AI guide alongside every lesson to explain concepts,
              answer questions, and keep you unstuck.
            </p>
            <div className="mb-1 text-4xl font-bold text-ink">
              {price} credits
            </div>
            <p className="mb-5 text-xs text-[#2C2C2C]/60">
              {isMember
                ? `Your balance: ${balance} credits`
                : "You need an active membership to spend credits."}
            </p>

            {error && (
              <p className="mb-4 text-xs text-[#8B2020]">{error}</p>
            )}
            {isMember && !canAfford && !error && (
              <p className="mb-4 text-xs text-[#8B2020]">
                Not enough credits — top up on your Credits page first.
              </p>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={status === "processing" || !canAfford}
              className="btn-primary w-full cursor-pointer justify-center bg-navy text-community-gold hover:bg-[#253a50] disabled:cursor-default disabled:opacity-70"
            >
              {status === "processing" ? "Unlocking…" : `Spend ${price} credits`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
