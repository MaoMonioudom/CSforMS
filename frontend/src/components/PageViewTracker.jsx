import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { recordPageView } from "@/lib/analytics-data";

// Fires one beacon per route change for the admin Dashboard's real visit
// chart. Admin's own usage isn't "site traffic" — a staff member clicking
// through their own dashboard would otherwise inflate the numbers they're
// looking at, so /admin/* is excluded here rather than filtered out later.
export function PageViewTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    recordPageView(pathname);
  }, [pathname]);

  return null;
}
