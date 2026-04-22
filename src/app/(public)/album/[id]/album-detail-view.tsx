"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { PublicAlbumDetail } from "@/lib/albums/detail";
import { useAlbumAmbient } from "@/components/AlbumAmbientProvider";

function formatMs(ms?: number) {
  if (ms === undefined) return "—";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function formatSec(sec?: number) {
  if (sec === undefined) return "—";
  const m = Math.floor(sec / 60);
  const r = sec % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function AlbumDetailView({ album }: { album: PublicAlbumDetail }) {
  const ambient = useAlbumAmbient();
  const clearRef = useRef(ambient?.clearAlbumAmbient);

  clearRef.current = ambient?.clearAlbumAmbient;

  useEffect(() => {
    if (!ambient) return;
    void ambient.registerAlbumAmbient(album.id, album.source, album.image);
  }, [ambient, album.id, album.source, album.image]);

  useEffect(() => {
    return () => {
      clearRef.current?.();
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-transparent py-8 text-[#f1f5f8] md:py-12">
      <div className="th-shell max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-block text-xs uppercase tracking-[0.14em] text-[#8ea5b4] transition hover:text-[#fb3d93]"
        >
          ← Home
        </Link>

        <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-10">
          <div className="mx-auto w-full max-w-[280px] shrink-0 md:mx-0">
            <div className="overflow-hidden rounded-2xl border border-[#2f2f3a]/80 bg-[#14141c]/40 shadow-2xl shadow-black/40 backdrop-blur-[2px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={album.image || "/assets/logo.png"}
                alt=""
                width={560}
                height={560}
                crossOrigin={album.source === "spotify" ? "anonymous" : undefined}
                className="aspect-square w-full object-cover"
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8ea5b4]">
              {album.source === "spotify" ? "Album" : "Release"}
            </p>
            <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              {album.name}
            </h1>
            <p className="mt-2 text-xl text-[#c8d4e0]">{album.artists}</p>

            <dl className="mt-6 grid gap-3 text-sm text-[#9ab0be] sm:grid-cols-2">
              {album.releaseDate ? (
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-[#6b7c8a]">Released</dt>
                  <dd className="text-[#e2eaf2]">{album.releaseDate}</dd>
                </div>
              ) : null}
              {album.totalTracks !== undefined ? (
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-[#6b7c8a]">Tracks</dt>
                  <dd className="text-[#e2eaf2]">{album.totalTracks}</dd>
                </div>
              ) : null}
              {album.label ? (
                <div className="sm:col-span-2">
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-[#6b7c8a]">Label</dt>
                  <dd className="text-[#e2eaf2]">{album.label}</dd>
                </div>
              ) : null}
            </dl>

            {album.spotifyUrl ? (
              <a
                href={album.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#2a2a34] bg-[#14141c] px-4 py-3 text-sm font-semibold text-white transition hover:border-[#fb3d93]/60 hover:text-[#fb3d93]"
              >
                Open in Spotify
                <span aria-hidden>↗</span>
              </a>
            ) : null}
          </div>
        </div>

        {album.tracks.length > 0 ? (
          <section className="mt-12">
            <ol className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-white/[0.035] backdrop-blur-sm">
              {album.tracks.map((t, idx) => (
                <li
                  key={`${t.position}-${t.title}-${idx}`}
                  className="flex items-baseline justify-between gap-4 px-4 py-3 text-sm md:px-5"
                >
                  <span className="flex min-w-0 items-baseline gap-3">
                    <span className="w-6 shrink-0 text-right text-xs text-[#6b7c8a] tabular-nums">
                      {t.position}
                    </span>
                    <span className="truncate text-[#e8eef4]">{t.title}</span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-[#6b7c8a]">
                    {album.source === "spotify"
                      ? formatMs(t.durationMs)
                      : formatSec(t.lengthSec)}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {album.moreByArtist && album.moreByArtist.length > 0 ? (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-4xl font-semibold leading-none">
                More by {album.artists.split(",")[0]}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {album.moreByArtist.map((more) => (
                <Link key={more.id} href={`/album/${encodeURIComponent(more.id)}?source=spotify`}>
                  <article className="group rounded-xl border border-white/[0.08] bg-white/[0.04] p-2 backdrop-blur-sm transition hover:border-[#fb3d93]/60 hover:bg-white/[0.06]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={more.image || "/assets/logo.png"}
                      alt={more.name}
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                    <p className="mt-2 line-clamp-1 text-lg font-medium text-white">{more.name}</p>
                    <p className="text-sm text-[#9ab0be]">{more.releaseDate || ""}</p>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
