import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP") return; // back/forward: let the browser restore scroll position

    if (hash) {
      // By the time this effect runs, React has already committed the new
      // page's DOM, so the target section is already there — no need to
      // wait a frame (rAF can be throttled/suspended in background tabs).
      const el = document.getElementById(hash.slice(1));
      el?.scrollIntoView({ behavior: "instant", block: "start" });
      return;
    }

    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash, navigationType]);

  return null;
}
