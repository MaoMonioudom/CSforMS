/**
 * Shared Tailwind class strings for the BookReader suite.
 * Kept as full static literals so Tailwind's scanner generates every utility —
 * including the ones applied to imperatively-created flip elements.
 */

// Ruled-paper line texture (light + darker variant for the flip back face)
export const LINES =
  "bg-[repeating-linear-gradient(180deg,transparent,transparent_27px,rgba(0,0,0,0.042)_27px,rgba(0,0,0,0.042)_28px)]";
const LINES_DARK =
  "bg-[repeating-linear-gradient(180deg,transparent,transparent_27px,rgba(0,0,0,0.07)_27px,rgba(0,0,0,0.07)_28px)]";

/* ── Scene / book shell ── */
export const SCENE =
  "mx-auto w-full max-w-[1000px] font-body [perspective:2200px] max-[699px]:[perspective:none]";

export const BOOK =
  "relative flex h-[560px] rounded-[5px] shadow-[0_28px_90px_rgba(0,0,0,0.7),0_0_0_1px_rgba(201,168,76,0.12)]";

// Single-page (mobile / lesson view) shell; left gold spine strip via ::before
export const BOOK_SINGLE =
  "relative flex h-auto min-h-[520px] rounded-[3px_8px_8px_3px] shadow-[0_28px_90px_rgba(0,0,0,0.7),0_0_0_1px_rgba(201,168,76,0.12)] before:absolute before:inset-y-0 before:left-0 before:z-[5] before:w-2 before:rounded-l-[3px] before:bg-[linear-gradient(180deg,#4A2E08_0%,#C9A84C_25%,#E8C96A_50%,#C9A84C_75%,#4A2E08_100%)] before:shadow-[2px_0_6px_rgba(0,0,0,0.3)] before:content-['']";

/* ── Static background pages ── */
const BG_BASE = `flex flex-col overflow-hidden bg-parchment px-7 pb-[26px] pt-8 max-[700px]:px-4 max-[700px]:pb-[18px] max-[700px]:pt-5 ${LINES}`;

export const BG_LEFT = `${BG_BASE} absolute inset-y-0 left-0 w-1/2 rounded-l-[5px] shadow-[inset_-5px_0_12px_rgba(0,0,0,0.09)]`;
export const BG_RIGHT = `${BG_BASE} absolute inset-y-0 right-0 w-1/2 rounded-r-[5px] bg-parchment-alt shadow-[inset_5px_0_12px_rgba(0,0,0,0.09)]`;
export const BG_SINGLE = `${BG_BASE} relative min-h-[520px] w-full rounded-[3px_8px_8px_3px] px-6 pb-8 pt-7 shadow-[inset_-3px_0_8px_rgba(0,0,0,0.07)] max-[380px]:px-[18px] max-[380px]:pb-[26px] max-[380px]:pt-[22px]`;

/* ── Gilt page-edge stacks ── */
export const EDGES_RIGHT =
  "pointer-events-none absolute -right-1 bottom-2 top-2 w-1.5 rounded-r-sm bg-[repeating-linear-gradient(180deg,#e8d9b0,#e8d9b0_1px,#d2c088_1px,#d2c088_2px)]";
export const EDGES_LEFT =
  "pointer-events-none absolute -left-1 bottom-2 top-2 w-1.5 rounded-l-sm bg-[repeating-linear-gradient(180deg,#cfc090,#cfc090_1px,#baa870_1px,#baa870_2px)]";
export const PAGES_STACK =
  "absolute -right-[5px] bottom-1.5 top-1.5 z-[5] w-2 rounded-r-[3px] bg-[repeating-linear-gradient(180deg,#e8d9b0,#e8d9b0_1px,#d2c088_1px,#d2c088_2px)] shadow-[2px_0_5px_rgba(0,0,0,0.18)]";

/* ── Spine ── */
export const SPINE =
  "absolute inset-y-0 left-1/2 z-50 w-1 -translate-x-1/2 bg-[linear-gradient(180deg,#4A2E08_0%,#C9A84C_25%,#E8C96A_50%,#C9A84C_75%,#4A2E08_100%)] shadow-[0_0_10px_rgba(0,0,0,0.45)]";
export const SPINE_SHADOW =
  "pointer-events-none absolute inset-y-0 left-[calc(50%-22px)] z-[49] w-11 bg-[linear-gradient(90deg,rgba(0,0,0,0.14)_0%,rgba(0,0,0,0.02)_42%,rgba(0,0,0,0.02)_58%,rgba(0,0,0,0.14)_100%)]";

/* ── Curl shadows (opacity driven by JS during flips) ── */
export const CURL_LEFT =
  "pointer-events-none absolute inset-y-0 left-0 z-30 w-1/2 rounded-l-[5px] bg-[linear-gradient(270deg,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0)_65%)] opacity-0";
export const CURL_RIGHT =
  "pointer-events-none absolute inset-y-0 left-1/2 z-30 w-1/2 rounded-r-[5px] bg-[linear-gradient(90deg,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0)_65%)] opacity-0";
export const CURL_LEFT_SINGLE =
  "pointer-events-none absolute inset-y-0 left-0 z-30 w-full rounded-[3px_8px_8px_3px] bg-[linear-gradient(270deg,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0)_65%)] opacity-0";
export const CURL_RIGHT_SINGLE =
  "pointer-events-none absolute inset-y-0 left-0 z-30 w-full rounded-[3px_8px_8px_3px] bg-[linear-gradient(90deg,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0)_65%)] opacity-0";

/* ── Page number ── */
export const PG_NUM =
  "pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-[11px] tracking-[0.06em] text-black/[0.27]";

/* ── Imperative flip elements (BookReader.jsx builds these in JS) ── */
export function flipContainerClass(forward, mobile) {
  const base =
    "pointer-events-none absolute inset-y-0 z-20 will-change-transform [transform-style:preserve-3d]";
  if (mobile) {
    return `${base} left-0 w-full ${forward ? "origin-left" : "origin-right"}`;
  }
  return `${base} w-1/2 ${forward ? "left-1/2 origin-left" : "left-0 origin-right"}`;
}

const FACE_BASE =
  "absolute inset-0 flex flex-col overflow-hidden px-7 pb-[26px] pt-8 [backface-visibility:hidden] max-[700px]:px-4 max-[700px]:pb-[18px] max-[700px]:pt-5";

export function flipFrontClass(forward, mobile) {
  if (mobile) {
    return `${FACE_BASE} px-6 pb-8 pt-7 rounded-[3px_8px_8px_3px] bg-parchment ${LINES}`;
  }
  return forward
    ? `${FACE_BASE} rounded-r-[5px] bg-parchment-alt shadow-[inset_5px_0_12px_rgba(0,0,0,0.09)] ${LINES}`
    : `${FACE_BASE} rounded-l-[5px] bg-parchment shadow-[inset_-5px_0_12px_rgba(0,0,0,0.09)] ${LINES}`;
}

export const FLIP_BACK = `${FACE_BASE} bg-[#C8BC96] [transform:rotateY(180deg)] ${LINES_DARK}`;

/* ── Navigation bar ── */
export const NAV = "mt-[18px] flex items-center justify-between gap-2.5";
export const NAV_ARROW =
  "flex h-[42px] w-[42px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-gold/30 bg-navy/55 text-lg text-gold transition-all duration-200 hover:border-gold hover:bg-gold/20 disabled:cursor-default disabled:opacity-20 disabled:hover:border-gold/30 disabled:hover:bg-navy/55 max-[699px]:h-[46px] max-[699px]:w-[46px] max-[699px]:text-xl";
export const NAV_DOTS =
  "flex max-w-[calc(100%-120px)] flex-1 items-center justify-center gap-1.5 overflow-x-auto px-0.5 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
export const NAV_DOT =
  "h-[7px] w-[7px] shrink-0 cursor-pointer rounded-full border-none bg-gold/[0.22] transition-all duration-200 hover:bg-gold/50 max-[699px]:h-2 max-[699px]:w-2";
export const NAV_DOT_ACTIVE =
  "h-[7px] w-[7px] shrink-0 cursor-pointer scale-[1.4] rounded-full border-none bg-gold transition-all duration-200 max-[699px]:h-2 max-[699px]:w-2";
export const NAV_LABEL =
  "mt-2 text-center font-display text-[11px] tracking-[0.05em] text-parchment/[0.38]";
export const NAV_HINT = "mt-[5px] text-center text-[10.5px] text-parchment/20";

/* ── Lesson-type badges ── */
const TYPE_BADGE =
  "inline-flex w-fit items-center rounded-sm px-[7px] py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.09em]";
export const TYPE_BADGE_CLASS = {
  video:   `${TYPE_BADGE} bg-[#1B2A3B]/[0.12] text-[#1B2A3B]`,
  reading: `${TYPE_BADGE} bg-[#286432]/[0.12] text-[#2D6A30]`,
  lab:     `${TYPE_BADGE} bg-[#8C640A]/[0.12] text-[#7A5A08]`,
  project: `${TYPE_BADGE} bg-[#8C2828]/[0.12] text-[#7A2020]`,
};
export const typeBadgeClass = (type) => TYPE_BADGE_CLASS[type] ?? TYPE_BADGE;

/* ── Lesson page content ── */
export const LESSON_NUM =
  "mb-[3px] mt-[7px] font-display text-[10px] text-black/[0.28]";
export const LESSON_TITLE =
  "mb-2 font-display text-[clamp(16px,2.6vw,22px)] font-bold leading-[1.25] text-ink max-[699px]:text-lg";
export const LESSON_DUR =
  "mb-3.5 flex items-center gap-1 text-[10.5px] text-black/[0.42]";
export const LESSON_BODY =
  "flex-1 overflow-hidden text-xs leading-[1.9] text-[#2C2C2C]/80 max-[699px]:text-[13px] [&_p]:mb-[9px] [&_ul]:mb-[9px] [&_ul]:pl-[15px] [&_li]:mb-1 [&_li]:list-disc [&_code]:rounded-sm [&_code]:bg-black/[0.09] [&_code]:px-1 [&_code]:py-px [&_code]:font-mono [&_code]:text-[11px]";
export const LESSON_POINTS =
  "mt-3 rounded-r-[3px] border-l-2 border-gold bg-gold/10 px-3 py-[9px]";
export const LESSON_POINTS_TITLE =
  "mb-[5px] text-[9.5px] font-semibold uppercase tracking-[0.1em] text-gold-dark";
export const LESSON_POINTS_LIST =
  "pl-3.5 [&>li]:mb-[3px] [&>li]:list-disc [&>li]:text-[11.5px] [&>li]:text-[#2C2C2C]/[0.72]";
