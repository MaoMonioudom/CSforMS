import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// Shared "Home > Module > Page" trail. Originally Community-only (duplicated
// across SectionPage.jsx and each detail page), now the one implementation
// every module's list/detail pages use.
//
// items: [{ label, to? }]: the last item (or any item without `to`) renders
// as plain text instead of a link, since it's the current page.
// light: true for text sitting on a dark/photo background, false for
// ordinary page backgrounds.
export function Breadcrumb({ items, light = false, className = "" }) {
  if (!items || items.length === 0) return null;
  const linkColor = light ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground";
  const currentColor = light ? "text-white" : "text-foreground";
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-sm flex-wrap ${className}`}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className={`size-3.5 shrink-0 opacity-50 ${light ? "text-white" : ""}`} />}
            {isLast || !item.to ? (
              <span className={`font-medium truncate max-w-[200px] sm:max-w-sm ${currentColor}`}>{item.label}</span>
            ) : (
              <Link to={item.to} className={`transition-colors ${linkColor}`}>{item.label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
