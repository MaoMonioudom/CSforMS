import { PATH_TYPES, PATH_ORDER } from "../../../data/paths";

/**
 * Lets a learner pick which path to follow through a course.
 * Only shows the paths that course actually offers (course.paths).
 * The Interactive pill shows its price unless already unlocked.
 */
export default function PathSelector({ course, activePath, unlocked, onSelect }) {
  const available = PATH_ORDER.filter((id) => course.paths?.includes(id));
  if (available.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 pb-2 pt-5 max-[560px]:flex-col">
      {available.map((id) => {
        const path = PATH_TYPES[id];
        const isInteractive = id === "interactive";
        const isActive = activePath === id;
        const isPaid = isInteractive && !path.free;
        const showPrice = isPaid && !unlocked;

        return (
          <button
            key={id}
            type="button"
            className={`flex cursor-pointer items-center gap-2.5 rounded-[10px] border px-4 py-3 text-left font-body transition-[border-color,transform,background] duration-150 hover:-translate-y-px max-[560px]:w-full ${
              isActive
                ? "border-[#E8A33D] bg-[#E8A33D]/[0.08]"
                : "border-[#F7F5F0]/[0.12] bg-[#1B2430] hover:border-[#E8A33D]/50"
            }`}
            onClick={() => onSelect(id)}
          >
            <span className="shrink-0 text-xl" aria-hidden="true">{path.icon}</span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-semibold text-[#F7F5F0]">{path.label}</span>
              <span className="whitespace-nowrap text-xs text-[#B9C2CE]">{path.tagline}</span>
            </span>
            {showPrice && (
              <span className="ml-1 shrink-0 text-[13px] font-bold text-[#E8A33D]">
                ${course.interactivePrice.toFixed(2)}
              </span>
            )}
            {isPaid && unlocked && (
              <span className="ml-1 shrink-0 whitespace-nowrap text-[11px] font-semibold text-[#4A9E5C]">
                ✓ Unlocked
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
