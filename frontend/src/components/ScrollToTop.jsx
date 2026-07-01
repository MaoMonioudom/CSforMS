import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP") return; // back/forward: let the browser restore scroll position
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, navigationType]);

  return null;
}
