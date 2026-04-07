"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface SavedTrack {
  id: string;
  spotifyTrackId: string;
  trackName: string;
  artists: string;
  albumName: string | null;
  imageUrl: string | null;
  savedAt: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<SavedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch("/api/favorites");
        if (!response.ok) {
          throw new Error("Failed to fetch favorites");
        }
        const data = (await response.json()) as { saved: SavedTrack[] };
        setFavorites(data.saved);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemove = async (spotifyTrackId: string) => {
    try {
      const response = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotifyTrackId }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove favorite");
      }

      setFavorites((prev) =>
        prev.filter((track) => track.spotifyTrackId !== spotifyTrackId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove favorite");
    }
  };

  return (
    <main className="min-h-screen px-4 py-10 text-zinc-50">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Your Favorites</h1>
          <Link href="/" className="text-[#fb3d93] hover:text-green-200">
            ← Back to Search
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-zinc-400">Loading favorites...</p>
        ) : favorites.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8 text-center">
            <p className="text-zinc-400">No favorites yet. Search and save tracks to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((track) => {
              const artists = JSON.parse(track.artists) as string[];
              return (
                <article
                  key={track.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-4"
                >
                  <img
                    src={track.imageUrl || "https://placehold.co/80x80/18181b/f4f4f5?text=♪"}
                    alt={track.trackName}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate font-semibold">{track.trackName}</h3>
                    <p className="text-sm text-zinc-300">
                      {artists.join(", ")}
                    </p>
                    <p className="text-sm text-zinc-500">{track.albumName}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(track.spotifyTrackId)}
                    className="rounded-lg bg-red-500/20 px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-500/30 transition"
                  >
                    Remove
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
