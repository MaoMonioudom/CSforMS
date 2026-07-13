import { useState } from "react";

const INITIAL_FORM = { name: "", cardNumber: "", expiry: "", cvc: "" };

const FIELD = "flex min-w-0 flex-col gap-1.5";
const FIELD_LABEL =
  "text-[0.65rem] font-semibold uppercase tracking-[0.04em] text-[#2C2C2C]/60";
const FIELD_INPUT =
  "w-full rounded border border-black/15 bg-white px-3 py-2.5 font-body text-[0.9rem] text-ink focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,168,76,0.2)] focus:outline-none disabled:opacity-60";
const FIELD_ERROR = "text-[0.65rem] text-[#8B2020]";

function formatCardNumber(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

/**
 * Simulated checkout — no real payment gateway is wired up (this app has
 * no backend yet). Validates basic card-shaped input, fakes a short
 * "processing" delay, then reports success. Swap the fake delay in
 * `submit()` for a real gateway call when a backend exists.
 */
export default function CheckoutModal({ course, price, onSuccess, onClose }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | processing | success

  const update = (field) => (e) => {
    let value = e.target.value;
    if (field === "cardNumber") value = formatCardNumber(value);
    if (field === "expiry") value = formatExpiry(value);
    if (field === "cvc") value = value.replace(/\D/g, "").slice(0, 3);
    setForm((f) => ({ ...f, [field]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name on card is required.";
    if (form.cardNumber.replace(/\s/g, "").length !== 16)
      errs.cardNumber = "Enter a 16-digit card number.";
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) errs.expiry = "Use MM/YY.";
    if (form.cvc.length !== 3) errs.cvc = "3 digits.";
    return errs;
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("processing");
    // Simulated payment — no real gateway/backend exists yet.
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => onSuccess(), 700);
    }, 1100);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-deep/[0.72] p-4 font-body backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[400px] rounded-lg bg-parchment px-6 pb-6 pt-8 shadow-open"
        onClick={(e) => e.stopPropagation()}
      >
        {status === "success" ? (
          <div className="py-6 text-center">
            <div className="mb-3 text-[40px]">✅</div>
            <h3 className="mb-2 font-display text-ink">Payment Successful</h3>
            <p className="text-sm text-[#2C2C2C]/70">
              Interactive path unlocked for {course.title}.
            </p>
          </div>
        ) : (
          <>
            <button
              className="absolute right-3.5 top-3 cursor-pointer p-1 text-[22px] leading-none text-black/40 hover:text-black/70"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>

            <span className="mb-3 inline-block rounded-full bg-gold/[0.18] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-gold-dark">
              🤖 Interactive Path
            </span>
            <h3 className="mb-1.5 font-display text-[1.35rem] text-ink">
              Unlock {course.title}
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-[#2C2C2C]/[0.72]">
              Get an AI guide alongside every lesson to explain concepts,
              answer questions, and keep you unstuck.
            </p>
            <div className="mb-5 font-display text-[2.2rem] font-bold text-ink">
              ${price.toFixed(2)}
            </div>

            <form className="flex flex-col gap-4" onSubmit={submit}>
              <div className={FIELD}>
                <label className={FIELD_LABEL} htmlFor="cc-name">Name on card</label>
                <input
                  id="cc-name"
                  className={FIELD_INPUT}
                  value={form.name}
                  onChange={update("name")}
                  placeholder="Jane Doe"
                  disabled={status === "processing"}
                />
                {errors.name && <span className={FIELD_ERROR}>{errors.name}</span>}
              </div>

              <div className={FIELD}>
                <label className={FIELD_LABEL} htmlFor="cc-number">Card number</label>
                <input
                  id="cc-number"
                  className={FIELD_INPUT}
                  value={form.cardNumber}
                  onChange={update("cardNumber")}
                  placeholder="4242 4242 4242 4242"
                  inputMode="numeric"
                  disabled={status === "processing"}
                />
                {errors.cardNumber && (
                  <span className={FIELD_ERROR}>{errors.cardNumber}</span>
                )}
              </div>

              <div className="flex gap-4">
                <div className={`${FIELD} flex-1`}>
                  <label className={FIELD_LABEL} htmlFor="cc-expiry">Expiry</label>
                  <input
                    id="cc-expiry"
                    className={FIELD_INPUT}
                    value={form.expiry}
                    onChange={update("expiry")}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    disabled={status === "processing"}
                  />
                  {errors.expiry && <span className={FIELD_ERROR}>{errors.expiry}</span>}
                </div>
                <div className={`${FIELD} w-[100px] shrink-0`}>
                  <label className={FIELD_LABEL} htmlFor="cc-cvc">CVC</label>
                  <input
                    id="cc-cvc"
                    className={FIELD_INPUT}
                    value={form.cvc}
                    onChange={update("cvc")}
                    placeholder="123"
                    inputMode="numeric"
                    disabled={status === "processing"}
                  />
                  {errors.cvc && <span className={FIELD_ERROR}>{errors.cvc}</span>}
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 cursor-pointer rounded bg-navy px-5 py-[13px] text-[0.9rem] font-semibold text-gold transition-colors duration-300 hover:bg-[#253a50] disabled:cursor-default disabled:opacity-70"
                disabled={status === "processing"}
              >
                {status === "processing" ? "Processing…" : `Pay $${price.toFixed(2)}`}
              </button>
              <p className="text-center text-[0.65rem] text-[#2C2C2C]/45">
                Simulated checkout — no real payment is processed.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
