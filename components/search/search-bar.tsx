"use client";

import { useTranslations } from "next-intl";
import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";

import { useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/cn";

type Suggestion = { value: string; type?: string };

const DEBOUNCE_MS = 150;
const MIN_CHARS = 2;

/**
 * Combobox-style search bar. Typing ≥2 chars kicks off a debounced fetch to
 * `/api/suggest`. In-flight requests are aborted on each keystroke so only
 * the latest query ever updates the list. Arrow keys navigate; Enter picks
 * the highlighted option or submits the raw query.
 */
export function SearchBar({
  initialQuery = "",
  variant = "hero",
  className,
}: {
  initialQuery?: string;
  variant?: "hero" | "compact";
  className?: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  const listId = useId();

  const [value, setValue] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Close on outside click.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const runFetch = useCallback(async (q: string) => {
    abortRef.current?.abort();
    if (q.length < MIN_CHARS) {
      setItems([]);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/suggest?q=${encodeURIComponent(q)}&limit=8`,
        { signal: ctrl.signal },
      );
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { items: Suggestion[] };
      setItems(Array.isArray(data.items) ? data.items : []);
      setActive(-1);
    } catch (err) {
      if ((err as { name?: string })?.name !== "AbortError") {
        setItems([]);
      }
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, []);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setValue(next);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runFetch(next.trim()), DEBOUNCE_MS);
  }

  function submit(q: string) {
    const trimmed = q.trim();
    setOpen(false);
    startTransition(() => {
      const qs = trimmed ? `?q=${encodeURIComponent(trimmed)}` : "";
      router.push(("/jobs" + qs) as "/jobs");
    });
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (active >= 0 && items[active]) {
      submit(items[active].value);
    } else {
      submit(value);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (items.length ? (i + 1) % items.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) =>
        items.length ? (i <= 0 ? items.length - 1 : i - 1) : -1,
      );
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  const showList = open && (items.length > 0 || loading) && value.trim().length >= MIN_CHARS;

  return (
    <div
      ref={rootRef}
      className={cn("relative w-full", className)}
    >
      <form
        role="search"
        onSubmit={onSubmit}
        className={cn(
          "relative flex w-full items-center gap-2 rounded-full border border-border-strong bg-surface shadow-[0_1px_0_0_rgba(0,0,0,0.04)] transition-shadow focus-within:shadow-[0_6px_24px_-12px_rgba(0,0,0,0.25)]",
          variant === "hero" ? "h-14 pl-5 pr-1.5" : "h-11 pl-4 pr-1",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "text-ink-mute",
            variant === "hero" ? "text-base" : "text-sm",
          )}
        >
          <SearchIcon />
        </span>
        <label htmlFor="q" className="sr-only">
          {t("jobs.searchLabel")}
        </label>
        <input
          ref={inputRef}
          id="q"
          name="q"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={
            active >= 0 ? `${listId}-opt-${active}` : undefined
          }
          autoComplete="off"
          value={value}
          onChange={onChange}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={t("home.searchPlaceholder")}
          className={cn(
            "flex-1 min-w-0 bg-transparent font-medium outline-none placeholder:text-ink-mute",
            variant === "hero" ? "text-[17px]" : "text-[15px]",
          )}
        />
        <button
          type="submit"
          className={cn(
            "shrink-0 rounded-full bg-accent px-5 font-medium text-accent-ink transition-opacity hover:opacity-90",
            variant === "hero" ? "h-11 text-sm" : "h-9 text-[13px] px-4",
          )}
        >
          {t("home.searchSubmit")}
        </button>
      </form>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-auto rounded-2xl border border-border bg-surface p-1.5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)]"
        >
          {loading && items.length === 0 && (
            <li className="px-3 py-3 text-sm text-ink-mute">
              {t("jobs.suggest.loading")}
            </li>
          )}
          {items.map((item, i) => {
            const isActive = i === active;
            return (
              <li
                key={`${item.value}-${i}`}
                id={`${listId}-opt-${i}`}
                role="option"
                aria-selected={isActive}
                onMouseDown={(e) => {
                  // prevent form blur before click
                  e.preventDefault();
                  submit(item.value);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm",
                  isActive
                    ? "bg-surface-muted text-ink"
                    : "text-ink-soft hover:bg-surface-muted/70",
                )}
              >
                <span className="truncate">{item.value}</span>
                {item.type && (
                  <span className="shrink-0 text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                    {item.type}
                  </span>
                )}
              </li>
            );
          })}
          {!loading && items.length === 0 && (
            <li className="px-3 py-3 text-sm text-ink-mute">
              {t("jobs.suggest.empty")}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className="size-[1.15em]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="9" r="6" />
      <path d="m17 17-3.2-3.2" />
    </svg>
  );
}
