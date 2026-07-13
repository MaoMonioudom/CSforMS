import { getInitials } from "../../utils/format";

/**
 * Instructor block used inside the open-book detail page.
 */
export default function InstructorCard({ name }) {
  return (
    <div className="mt-6 flex items-center gap-3 rounded border-l-[3px] border-gold bg-black/[0.04] p-4 font-body">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy font-display text-base font-bold text-gold"
        aria-hidden="true"
      >
        {getInitials(name)}
      </div>
      <div>
        <p className="mb-0.5 text-[0.68rem] uppercase tracking-[0.1em] text-black/40">Instructor</p>
        <p className="text-[0.9rem] font-semibold text-ink">{name}</p>
      </div>
    </div>
  );
}
