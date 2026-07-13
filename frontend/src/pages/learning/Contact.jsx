import { useState } from "react";

const TOPICS = [
  "Course question",
  "Technical issue",
  "Course suggestion",
  "Partnership",
  "Other",
];

const INITIAL_FORM = { name: "", email: "", topic: "", message: "" };

const WRAPPER = "min-h-[80vh] bg-navy-deep py-20 font-body max-sm:py-12";
const INNER = "mx-auto w-full max-w-[600px] px-8 max-sm:px-4";
const LABEL = "text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-navy-muted";
const INPUT =
  "w-full rounded border border-gold/20 bg-navy px-3.5 py-3 text-[0.9rem] text-parchment outline-none transition-colors duration-300 focus:border-gold";

export default function Contact() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim())    errs.name    = "Name is required.";
    if (!form.email.trim())   errs.email   = "Email is required.";
    if (!form.message.trim()) errs.message = "Message is required.";
    return errs;
  };

  const submit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSent(true);
  };

  if (sent) {
    return (
      <div className={WRAPPER}>
        <div className={INNER}>
          <div className="rounded border border-sage/35 bg-navy p-8 text-center">
            <div className="mb-3 text-[2.5rem]">📬</div>
            <h3 className="mb-2 font-display text-parchment">Message Received</h3>
            <p className="text-[0.9rem] text-navy-muted">
              Thank you, {form.name}. We'll get back to you within 2 business days.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={WRAPPER}>
      <div className={INNER}>
        <span className="mb-3 block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-gold">
          Reach Out
        </span>
        <h1 className="mb-3 mt-2 font-display text-[clamp(2rem,4vw,2.8rem)] leading-tight text-parchment">
          Get in Touch
        </h1>
        <p className="mb-10 text-[0.9rem] leading-[1.75] text-navy-muted">
          Have a question about a course, want to suggest a topic, or just say
          hello? We read every message.
        </p>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className={LABEL} htmlFor="name">Name</label>
            <input
              id="name" name="name"
              className={INPUT}
              value={form.name}
              onChange={update}
              placeholder="Your name"
            />
            {errors.name && <span className="mt-[3px] text-[0.65rem] text-[#e06060]">{errors.name}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={LABEL} htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email"
              className={INPUT}
              value={form.email}
              onChange={update}
              placeholder="your@email.com"
            />
            {errors.email && <span className="mt-[3px] text-[0.65rem] text-[#e06060]">{errors.email}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={LABEL} htmlFor="topic">Topic</label>
            <select
              id="topic" name="topic"
              className={`${INPUT} [&>option]:bg-navy [&>option]:text-parchment`}
              value={form.topic}
              onChange={update}
            >
              <option value="">Select a topic…</option>
              {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={LABEL} htmlFor="message">Message</label>
            <textarea
              id="message" name="message"
              className={`${INPUT} min-h-[120px] resize-y`}
              value={form.message}
              onChange={update}
              placeholder="What's on your mind?"
            />
            {errors.message && <span className="mt-[3px] text-[0.65rem] text-[#e06060]">{errors.message}</span>}
          </div>

          <button
            className="mt-2 w-full cursor-pointer rounded bg-gold p-3.5 text-base font-semibold text-navy transition-colors duration-300 hover:bg-gold-light"
            onClick={submit}
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}
