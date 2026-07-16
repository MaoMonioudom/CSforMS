import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/community/ui/popover";
import { Input } from "@/components/community/ui/input";
import { searchTags } from "@/lib/tags-data";

// Chip input backed by the shared tag dictionary — typing shows matching
// existing tags (via /tags search) so people pick "React" instead of typing
// "react.js" as an unintentional near-duplicate. Enter/comma still adds
// whatever's typed as a brand-new value if nothing matches.
//
// Used for both Find Team's "skills" field and Connect's "tags" field —
// same underlying `tags` dictionary either way (collaboration_skills and
// post_tags are both junction tables into it). `noun` only customizes the
// hint copy ("skill" vs "tag").
//
// z-[110] on the popover: it needs to render above a parent Dialog
// (z-[100] — see dialog.jsx), since Radix portals it to document.body,
// escaping the dialog's own stacking context. Any future usage inside a
// dialog needs this same override, or the suggestions render invisibly
// behind the dialog's backdrop (bit us once already — see CollaborationPage
// history).
export function TagsInput({ value, onChange, noun = "tag", placeholder }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const blurTimer = useRef(null);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setSuggestions([]); return; }
    let cancelled = false;
    const t = setTimeout(() => {
      searchTags(q).then(tags => { if (!cancelled) setSuggestions(tags); }).catch(() => {});
    }, 200);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query]);

  const addValue = (name) => {
    const clean = name.trim();
    if (clean && !value.some(v => v.toLowerCase() === clean.toLowerCase())) {
      onChange([...value, clean]);
    }
    setQuery("");
  };

  const removeValue = (name) => onChange(value.filter(v => v !== name));

  const visibleSuggestions = suggestions.filter(
    t => !value.some(v => v.toLowerCase() === t.tag_name.toLowerCase())
  );

  return (
    <div>
      {value.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {value.map(v => (
            <span key={v} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
              {v}
              <button type="button" onClick={() => removeValue(v)} className="text-muted-foreground hover:text-foreground">
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <Popover open={open && query.trim().length > 0}>
        <PopoverAnchor asChild>
          <Input
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addValue(query); }
              else if (e.key === "Backspace" && !query && value.length) removeValue(value[value.length - 1]);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 150); }}
            placeholder={placeholder ?? `Type a ${noun} and press Enter…`}
          />
        </PopoverAnchor>
        <PopoverContent
          align="start"
          className="z-[110] w-(--radix-popover-trigger-width) p-1"
          onOpenAutoFocus={e => e.preventDefault()}
        >
          {visibleSuggestions.length > 0 ? (
            <div className="flex flex-col">
              {visibleSuggestions.map(tag => (
                <button
                  key={tag.tag_id}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); clearTimeout(blurTimer.current); }}
                  onClick={() => addValue(tag.tag_name)}
                  className="rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                >
                  {tag.tag_name}
                </button>
              ))}
            </div>
          ) : (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">Press Enter to add "{query}" as a new {noun}.</p>
          )}
        </PopoverContent>
      </Popover>
      <p className="mt-1 text-xs text-muted-foreground">Press Enter to add. Existing {noun}s are suggested as you type.</p>
    </div>
  );
}
