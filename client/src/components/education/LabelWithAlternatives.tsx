import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const HOVER_MS = 200;

export function LabelWithAlternatives({
  label,
  sublabel,
  alternatives,
  className,
  labelTextClassName,
}: {
  label: ReactNode;
  sublabel: ReactNode;
  alternatives: string[];
  className?: string;
  /** Override default slate-900 label color (e.g. gap state). */
  labelTextClassName?: string;
}) {
  const items = alternatives.filter(Boolean).slice(0, 3);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current != null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const onEnter = useCallback(() => {
    if (!items.length) return;
    clearTimer();
    timer.current = setTimeout(() => setOpen(true), HOVER_MS);
  }, [items.length, clearTimer]);

  const onLeave = useCallback(() => {
    clearTimer();
    setOpen(false);
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return (
    <div
      className={cn("relative max-w-[210px] text-center", items.length > 0 && "pointer-events-auto", className)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      <div className={cn("text-xs font-semibold leading-tight", labelTextClassName ?? "text-slate-900")}>
        {label}
      </div>
      <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{sublabel}</div>
      {open && items.length > 0 ? (
        <div
          className="absolute left-1/2 top-full z-50 mt-1 w-[220px] -translate-x-1/2 rounded-md border border-slate-200 bg-white px-3 py-2 text-left shadow-lg"
          role="tooltip"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">Other approaches</p>
          <ul className="text-xs text-slate-700 space-y-1">
            {items.map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
