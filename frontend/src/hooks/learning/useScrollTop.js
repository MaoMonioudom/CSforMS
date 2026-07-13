import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scroll to the top of the page on every route change.
 * Drop <ScrollToTop /> anywhere inside <Router>.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
