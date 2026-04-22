"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { findGenreBySlug } from "@/lib/genres";

type GenreAlbum = {
  id: string;
  name: string;
  artist: string;
  image: string;
  releaseDate: string;
  spotifyUrl?: string;
};

export default function GenrePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const genre = findGenreBySlug(slug);

  const [albums, setAlbums] = useState<GenreAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/genres/${slug}`);
        const data = (await res.json()) as { albums?: GenreAlbum[]; error?: string };
        if (!res.ok) throw new Error(data.error || "Failed to load");
        if (!cancelled) setAlbums(data.albums ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <main className="min-h-screen bg-black py-8 text-white">
      <section className="th-shell">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#9ab0be] transition hover:text-[#fb3d93]"
        >
          <ArrowLeft size={14} />
          Back to search
        </Link>

        <h1 className="mt-4 text-4xl font-semibold md:text-5xl">
          {genre?.title ?? "Genre"} Albums
        </h1>
        <p className="mt-2 text-sm text-[#9ab0be]">
          Fresh picks from Spotify tailored to this style.
        </p>

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : error ? (
          <p className="mt-6 rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-red-200">
            {error}
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {albums.map((album) => (
              <article
                key={album.id}
                className="group overflow-hidden rounded-2xl border border-[#2a2a34] bg-[#10131a] transition hover:-translate-y-1 hover:border-[#fb3d93]/60"
              >
                <img src={album.image} alt={album.name} className="h-44 w-full object-cover" />
                <div className="p-3">
                  <h2 className="line-clamp-1 font-medium">{album.name}</h2>
                  <p className="line-clamp-1 text-sm text-[#9ab0be]">{album.artist}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-[#6f7e93]">{album.releaseDate || "Spotify"}</span>
                    <Link
                      href={`/album/${encodeURIComponent(album.id)}?source=spotify`}
                      className="inline-flex items-center gap-1 text-xs text-[#fb3d93] hover:text-[#ff78b8]"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
