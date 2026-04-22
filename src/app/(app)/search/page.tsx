"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { AlbumCard } from "@/types/album";
import LiveSpotifySearch from "@/components/LiveSpotifySearch";

function SearchPageInner() {
  const searchParams = useSearchParams();
  const qFromUrl = searchParams.get("q")?.trim() ?? "";

  const [albums, setAlbums] = useState<AlbumCard[]>([]);
  const [gridError, setGridError] = useState<string | null>(null);
  const [gridLoading, setGridLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setGridLoading(true);
      setGridError(null);
      try {
        const res = await fetch("/api/search/browse-albums");
        const data = (await res.json()) as { albums?: AlbumCard[]; error?: string };
        if (!res.ok) throw new Error(data.error || "Failed to load albums");
        if (!cancelled) setAlbums(data.albums ?? []);
      } catch (e) {
        if (!cancelled) {
          setGridError(e instanceof Error ? e.message : "Failed to load albums");
          setAlbums([]);
        }
      } finally {
        if (!cancelled) setGridLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-black py-6 text-white">
      <section className="th-shell">
        <div className="rounded-2xl border border-[#272f3b] bg-[#0d1117] p-4 md:p-6">
          <div className="mb-2 flex justify-center">
            <LiveSpotifySearch
              className="w-full max-w-5xl"
              variant="browse"
              placeholder="What do you want to play?"
              showRecentOnEmpty
              initialQuery={qFromUrl || undefined}
            />
          </div>

          <div className="mt-8">
            <h1 className="mb-1 text-2xl font-semibold tracking-tight text-[#e8edf5] md:text-3xl">
              New releases A–Z
            </h1>
            <p className="mb-4 text-sm text-[#8c97a8]">
              Fifty albums, sorted alphabetically.{" "}
              <Link
                href="/search/genre/pop"
                className="text-[#fb3d93] underline-offset-2 hover:underline"
              >
                Browse by genre
              </Link>
            </p>

            {gridLoading ? (
              <div
                className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5"
                aria-busy="true"
                aria-label="Loading album grid"
              >
                {Array.from({ length: 50 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square animate-pulse rounded-lg bg-white/5"
                  />
                ))}
              </div>
            ) : gridError ? (
              <p className="rounded-lg border border-dashed border-[#4a5161] p-4 text-sm text-amber-200/90">
                {gridError}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                {albums.slice(0, 50).map((album) => (
                  <Link
                    key={album.id}
                    href={`/album/${encodeURIComponent(album.id)}?source=spotify`}
                    className="group relative block aspect-square overflow-hidden rounded-lg border border-[#2a2f3a] bg-[#141820] transition hover:border-[#fb3d93]/50 hover:shadow-lg hover:shadow-[#fb3d93]/10"
                  >
                    {album.image ? (
                      <img
                        src={album.image}
                        alt=""
                        className="h-full w-full object-cover transition group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : null}
                    <span className="sr-only">
                      {album.name} by {album.artist}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function SearchPageFallback() {
  return (
    <main className="min-h-screen bg-black py-6 text-white">
      <section className="th-shell">
        <div className="rounded-2xl border border-[#272f3b] bg-[#0d1117] p-4 md:p-6">
          <div className="mb-2 flex h-14 animate-pulse justify-center rounded-full bg-white/5" />
          <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageInner />
    </Suspense>
  );
}
