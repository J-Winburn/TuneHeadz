"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LibraryBig, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Album, Artist, SearchResponse, Track } from "@/types/spotify";

const RECENT_KEY = "tuneheadz.search.recent";

type HeroInlineSearchProps = {
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
};

type UnifiedRow =
  | { kind: "artist"; item: Artist }
  | { kind: "album"; item: Album }
  | { kind: "track"; item: Track };

function placeholderImg(label: string) {
  return `https://placehold.co/44x44/1a1d24/9aa5b8?text=${encodeURIComponent(label.slice(0, 2).toUpperCase())}`;
}

export default function HeroInlineSearch({
  onExpandedChange,
  className = "",
}: HeroInlineSearchProps) {
  const router = useRouter();
  const [expanded, setExpandedState] = useState(false);
  const [query, setQuery] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResponse>({
    tracks: [],
    artists: [],
    albums: [],
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const setExpanded = useCallback(
    (next: boolean) => {
      setExpandedState(next);
      onExpandedChange?.(next);
      if (!next) {
        setPanelOpen(false);
        setQuery("");
      }
    },
    [onExpandedChange],
  );

  const pushRecent = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((x) => x.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!expanded) return;
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) setRecentSearches(parsed.slice(0, 8));
    } catch {
      /* ignore */
    }
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus();
      setPanelOpen(true);
    });
    return () => cancelAnimationFrame(id);
  }, [expanded]);

  useEffect(() => {
    if (!expanded || !panelOpen) return;
    const q = query.trim();
    if (!q) {
      setResults({ tracks: [], artists: [], albums: [] });
      setError(null);
      setLoading(false);
      return;
    }
    const t = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ q, type: "all", limit: "10" });
        const res = await fetch(`/api/search?${params}`);
        const data = (await res.json()) as SearchResponse;
        if (!res.ok) throw new Error(data.error || "Search failed");
        setResults(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Search failed");
        setResults({ tracks: [], artists: [], albums: [] });
      } finally {
        setLoading(false);
      }
    }, 260);
    return () => window.clearTimeout(t);
  }, [query, expanded, panelOpen]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded, setExpanded]);

  useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      const q = query.trim();
      if (!q) setExpanded(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [expanded, query, setExpanded]);

  const unifiedRows = useMemo((): UnifiedRow[] => {
    const q = query.trim();
    if (!q) return [];
    const rows: UnifiedRow[] = [];
    for (const a of results.artists.slice(0, 4)) rows.push({ kind: "artist", item: a });
    for (const al of results.albums.slice(0, 4)) rows.push({ kind: "album", item: al });
    for (const t of results.tracks.slice(0, 6)) rows.push({ kind: "track", item: t });
    return rows;
  }, [query, results]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    pushRecent(q);
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setExpanded(false);
  };

  const navigateResult = (path: string, saveQuery?: string) => {
    if (saveQuery) pushRecent(saveQuery);
    router.push(path);
    setExpanded(false);
  };

  const showRecentPanel = expanded && panelOpen && !query.trim() && recentSearches.length > 0;
  const showResultsPanel = expanded && panelOpen && query.trim().length > 0;
  const showEmptyHint =
    expanded && panelOpen && !query.trim() && recentSearches.length === 0;

  const shellMotion =
    "transition-[max-width,border-color,background-color,box-shadow] duration-[280ms] ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none";

  return (
    <div
      ref={containerRef}
      data-hero-inline-search
      className={`relative inline-flex shrink-0 items-start gap-2 ${className}`}
    >
      <div
        className={`relative inline-flex shrink-0 overflow-hidden rounded-full ${shellMotion} ${
          expanded
            ? "max-w-[min(26rem,calc(100vw-6rem))] border border-[#fb3d93] bg-[#242424] shadow-[0_4px_28px_rgba(251,61,147,0.12),0_8px_32px_rgba(0,0,0,0.45)]"
            : "h-9 max-w-9 border border-transparent bg-transparent shadow-none sm:h-10 sm:max-w-10"
        }`}
      >
        {!expanded ? (
          <button
            type="button"
            aria-expanded={false}
            onClick={() => setExpanded(true)}
            className="group inline-flex h-9 w-9 shrink-0 items-center justify-center text-white transition-colors duration-200 hover:text-[#fb3d93] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb3d93]/45 motion-safe:active:scale-95 sm:h-10 sm:w-10"
          >
            <Search
              className="h-[1.125rem] w-[1.125rem] text-inherit transition-colors group-hover:text-[#fb3d93] sm:h-5 sm:w-5"
              strokeWidth={2.2}
              aria-hidden
            />
            <span className="sr-only">Open search</span>
          </button>
        ) : (
          <div className="relative min-h-0 min-w-[12rem] w-[min(26rem,calc(100vw-6rem))] max-w-full">
          <form
            action="/search"
            method="get"
            onSubmit={onSubmit}
            className="flex min-w-0 flex-col gap-0"
          >
            <div className="flex w-full min-w-0 items-center gap-2 px-3 py-[0.425rem] text-[#b3b3b3] sm:gap-2.5 sm:px-4 sm:py-[0.53125rem]">
              <Search className="h-[15px] w-[15px] shrink-0 text-white/90" strokeWidth={2.2} aria-hidden />
              <span className="select-none text-lg leading-none text-white/35" aria-hidden>
                |
              </span>
              <label htmlFor="hero-inline-search-field" className="sr-only">
                Search music
              </label>
              <input
                id="hero-inline-search-field"
                name="q"
                ref={inputRef}
                type="search"
                value={query}
                autoComplete="off"
                placeholder="What do you want to play?"
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPanelOpen(true);
                }}
                onFocus={() => setPanelOpen(true)}
                onBlur={(e) => {
                  window.requestAnimationFrame(() => {
                    const next = e.relatedTarget as Node | null;
                    if (panelRef.current?.contains(next)) return;
                    if (containerRef.current?.contains(document.activeElement)) return;
                    if (!query.trim()) setExpanded(false);
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setExpanded(false);
                  }
                }}
                className="min-w-0 flex-1 bg-transparent text-[0.8rem] leading-tight text-white placeholder:text-[#8c8c8c] focus:outline-none sm:text-[0.85rem]"
              />
              <span className="h-5 w-px shrink-0 bg-[#4a4a4a]" aria-hidden />
              <Link
                href="/search"
                className="flex shrink-0 items-center justify-center rounded-md p-px text-[#b3b3b3] transition hover:text-white motion-safe:active:scale-95"
                aria-label="Browse music and genres"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setExpanded(false)}
              >
                <LibraryBig className="h-[17px] w-[17px]" strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </form>

          {(showRecentPanel || showResultsPanel || showEmptyHint) && (
            <div
              ref={panelRef}
              id="hero-inline-search-panel"
              role="listbox"
              aria-label="Search suggestions"
              className="th-hero-inline-search-panel absolute left-0 right-0 top-[calc(100%+0.375rem)] z-[100] box-border w-full min-w-0 overflow-hidden rounded-2xl border border-[#3d424d] bg-[#121212] shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
            >
              <div className="th-subtle-scroll max-h-[min(65vh,420px)] overflow-y-auto py-2">
                {showRecentPanel ? (
                  <>
                    <div className="flex items-center justify-between px-3 pb-1 pt-0.5">
                      <p className="text-[0.8125rem] font-semibold tracking-tight text-white">
                        Recent searches
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setRecentSearches([]);
                          try {
                            window.localStorage.removeItem(RECENT_KEY);
                          } catch {
                            /* ignore */
                          }
                        }}
                        className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[#8c97a8] transition hover:text-white"
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((item) => (
                      <button
                        key={item}
                        type="button"
                        role="option"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setQuery(item);
                          pushRecent(item);
                          router.push(`/search?q=${encodeURIComponent(item)}`);
                          setExpanded(false);
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-white/[0.06] active:bg-white/[0.08]"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#23262c] text-[#cdd4de]">
                          <Search className="h-5 w-5" strokeWidth={2} aria-hidden />
                        </span>
                        <span className="min-w-0 truncate text-[0.9375rem] font-medium text-[#e8edf5]">
                          {item}
                        </span>
                      </button>
                    ))}
                  </>
                ) : null}

                {showEmptyHint ? (
                  <p className="px-4 py-6 text-center text-[0.8125rem] text-[#8c97a8]">
                    Start typing to search artists, songs, and albums.
                  </p>
                ) : null}

                {showResultsPanel ? (
                  <>
                    {loading ? (
                      <div className="space-y-2 px-3 py-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-14 animate-pulse rounded-lg bg-white/[0.06]" />
                        ))}
                      </div>
                    ) : error ? (
                      <p className="px-4 py-3 text-sm text-red-300/90">{error}</p>
                    ) : unifiedRows.length === 0 ? (
                      <p className="px-4 py-6 text-center text-[0.8125rem] text-[#8c97a8]">
                        No results for &ldquo;{query.trim()}&rdquo;
                      </p>
                    ) : (
                      unifiedRows.map((row) => {
                        if (row.kind === "artist") {
                          const a = row.item;
                          const img = a.images?.[0]?.url ?? placeholderImg(a.name);
                          return (
                            <Link
                              key={`a-${a.id}`}
                              href={`/artist/${encodeURIComponent(a.id)}`}
                              role="option"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => navigateResult(`/artist/${encodeURIComponent(a.id)}`, query)}
                              className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-white/[0.06]"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img}
                                alt=""
                                className="h-11 w-11 shrink-0 rounded-full object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[0.9375rem] font-medium text-[#f4f7fb]">
                                  {a.name}
                                </p>
                                <p className="truncate text-[0.75rem] text-[#aeb8c8]">Artist</p>
                              </div>
                            </Link>
                          );
                        }
                        if (row.kind === "album") {
                          const al = row.item;
                          const img = al.images?.[0]?.url ?? placeholderImg(al.name);
                          const artistNames = al.artists.map((x) => x.name).join(", ");
                          return (
                            <Link
                              key={`al-${al.id}`}
                              href={`/album/${encodeURIComponent(al.id)}?source=spotify`}
                              role="option"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() =>
                                navigateResult(
                                  `/album/${encodeURIComponent(al.id)}?source=spotify`,
                                  query,
                                )
                              }
                              className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-white/[0.06]"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img}
                                alt=""
                                className="h-11 w-11 shrink-0 rounded-md object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[0.9375rem] font-medium text-[#f4f7fb]">
                                  {al.name}
                                </p>
                                <p className="truncate text-[0.75rem] text-[#aeb8c8]">
                                  Album • {artistNames}
                                </p>
                              </div>
                            </Link>
                          );
                        }
                        const t = row.item;
                        const img = t.album?.images?.[0]?.url ?? placeholderImg(t.name);
                        const artists = t.artists.map((x) => x.name).join(", ");
                        return (
                          <Link
                            key={`t-${t.id}`}
                            href={`/track/${encodeURIComponent(t.id)}`}
                            role="option"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => navigateResult(`/track/${encodeURIComponent(t.id)}`, query)}
                            className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-white/[0.06]"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img}
                              alt=""
                              className="h-11 w-11 shrink-0 rounded-md object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 items-center gap-1.5">
                                {t.explicit ? (
                                  <span
                                    className="inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded border border-[#5c5c5c] px-1 text-[10px] font-bold leading-none text-[#d0d0d0]"
                                    title="Explicit"
                                  >
                                    E
                                  </span>
                                ) : null}
                                <p className="truncate text-[0.9375rem] font-medium text-[#f4f7fb]">
                                  {t.name}
                                </p>
                              </div>
                              <p className="truncate text-[0.75rem] text-[#aeb8c8]">
                                Song • {artists}
                              </p>
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </>
                ) : null}
              </div>
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
}
