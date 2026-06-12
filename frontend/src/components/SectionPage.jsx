import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const toneMap = {
  events: "bg-events text-events-foreground",
  collaboration: "bg-collaboration text-collaboration-foreground",
  technical: "bg-technical text-technical-foreground",
  social: "bg-social text-social-foreground",
  community: "bg-community text-community-foreground"
};
export function SectionPage({
  eyebrow,
  title,
  description,
  tone = "events",
  children
}) {
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx("section", {
      className: `${toneMap[tone]} ${children ? "" : "min-h-[calc(100vh-4rem)]"}`,
      children: /*#__PURE__*/_jsxs("div", {
        className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32",
        children: [/*#__PURE__*/_jsx("p", {
          className: "text-xs uppercase tracking-[0.2em] opacity-70 mb-6",
          children: eyebrow
        }), /*#__PURE__*/_jsx("h1", {
          className: "text-5xl sm:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.02]",
          children: title
        }), /*#__PURE__*/_jsx("p", {
          className: "mt-8 max-w-2xl text-lg sm:text-xl opacity-90",
          children: description
        })]
      })
    }), children ? /*#__PURE__*/_jsx("section", {
      className: "bg-background",
      children: /*#__PURE__*/_jsx("div", {
        className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20",
        children: children
      })
    }) : null]
  });
}
