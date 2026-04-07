"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import type { Track, Artist, SearchResponse } from "@/types/spotify";

type SearchScope = "all" | "track" | "artist";

const scopes: { value: SearchScope; label: string }[] = [
  { value: "all", label: "All" },
  { value: "track", label: "Songs" },
  { value: "artist", label: "Artists" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("all");
  const [results, setResults] = useState<SearchResponse>({ tracks: [], artists: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [savedTrackIds, setSavedTrackIds] = useState<Set<string>>(new Set());

  // Load saved tracks on mount
  const loadSavedTracks = async () => {
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const data = (await response.json()) as {
          saved: Array<{ spotifyTrackId: string }>;
        };
        setSavedTrackIds(
          new Set(data.saved.map((track) => track.spotifyTrackId))
        );
      }
    } catch {
      // Silently fail
    }
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!query.trim()) {
      setError("Please enter a song or artist name.");
      setResults({ tracks: [], artists: [] });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ q: query.trim(), type: scope });
      const response = await fetch(`/api/search?${params.toString()}`);
      const data = (await response.json()) as SearchResponse;

      if (!response.ok) {
        throw new Error(data.error || "Unable to search Spotify right now.");
      }

      setResults(data);
      await loadSavedTracks();
    } catch (err) {
      setResults({ tracks: [], artists: [] });
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrack = async (track: Track) => {
    try {
      const response = await fetch("/api/favorites/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(track),
      });

      if (response.ok) {
        setSavedTrackIds((prev) => new Set([...prev, track.id]));
      } else {
        setError("Failed to save track");
      }
    } catch {
      setError("Failed to save track");
    }
  };

  return (
    <main className="min-h-screen px-4 py-10 text-zinc-50">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur md:p-8">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-[#fb3d93]/15 px-3 py-1 text-sm font-medium text-[#fb3d93]">
              Spotify API Demo
            </span>
            <Link
              href="/landing"
              className="rounded-full bg-purple-500/15 px-3 py-1 text-sm font-medium text-purple-300 hover:bg-purple-500/25 transition"
            >
              Try Landing Page →
            </Link>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Search for a song or artist
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-300 md:text-base">
            Type a name, choose what you want to search, and fetch matching Spotify
            results instantly.
          </p>

          <form onSubmit={handleSearch} className="mt-6 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try: SZA, Drake, or Blinding Lights"
                className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-base outline-none transition focus:border-green-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-[#fb3d93] px-5 py-3 font-semibold text-black transition hover:bg-[#e63a85] disabled:cursor-not-allowed disabled:bg-green-300"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {scopes.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setScope(item.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    scope === item.value
                      ? "bg-[#fb3d93] text-black"
                      : "bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </form>

          {error ? (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-zinc-950/70 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Songs</h2>
              <span className="text-sm text-zinc-400">{results.tracks.length} found</span>
            </div>

            <div className="space-y-3">
              {results.tracks.length === 0 ? (
                <p className="text-sm text-zinc-400">Search to see matching songs here.</p>
              ) : (
                results.tracks.map((track) => (
                  <article
                    key={track.id}
                    className="flex gap-3 rounded-2xl border border-white/10 bg-zinc-900/80 p-3"
                  >
                    <img
                      src={track.album?.images?.[0]?.url || "https://placehold.co/80x80/18181b/f4f4f5?text=♪"}
                      alt={track.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{track.name}</h3>
                      <p className="text-sm text-zinc-300">
                        {track.artists.map((artist) => artist.name).join(", ")}
                      </p>
                      <p className="text-sm text-zinc-500">{track.album?.name}</p>
                      <div className="mt-1 flex gap-2">
                        {track.external_urls?.spotify ? (
                          <a
                            href={track.external_urls.spotify}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-[#fb3d93] hover:text-green-200"
                          >
                            Open in Spotify
                          </a>
                        ) : null}
                        <button
                          onClick={() => handleSaveTrack(track)}
                          className={`text-sm font-medium ${
                            savedTrackIds.has(track.id)
                              ? "text-yellow-300 hover:text-yellow-200"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {savedTrackIds.has(track.id) ? "★ Saved" : "☆ Save"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-zinc-950/70 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Artists</h2>
              <span className="text-sm text-zinc-400">{results.artists.length} found</span>
            </div>

            <div className="space-y-3">
              {results.artists.length === 0 ? (
                <p className="text-sm text-zinc-400">Search to see matching artists here.</p>
              ) : (
                results.artists.map((artist) => (
                  <article
                    key={artist.id}
                    className="flex gap-3 rounded-2xl border border-white/10 bg-zinc-900/80 p-3"
                  >
                    <img
                      src={artist.images?.[0]?.url || "https://placehold.co/80x80/18181b/f4f4f5?text=♫"}
                      alt={artist.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{artist.name}</h3>
                      <p className="text-sm text-zinc-300">
                        {artist.followers?.total
                          ? `${artist.followers.total.toLocaleString()} followers`
                          : "Spotify artist"}
                      </p>
                      <p className="truncate text-sm text-zinc-500">
                        {artist.genres?.slice(0, 2).join(", ") || "Genre info unavailable"}
                      </p>
                      {artist.external_urls?.spotify ? (
                        <a
                          href={artist.external_urls.spotify}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-block text-sm text-[#fb3d93] hover:text-green-200"
                        >
                          View profile
                        </a>
                      ) : null}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
