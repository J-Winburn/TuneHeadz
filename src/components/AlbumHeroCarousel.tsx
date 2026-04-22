"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AlbumCard } from "@/types/album";

function fisherYatesShuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function MarqueeRow({
  albums,
  direction,
  durationSec,
  onCycleComplete,
}: {
  albums: AlbumCard[];
  direction: "left" | "right";
  durationSec: number;
  onCycleComplete: () => void;
}) {
  const loop = useMemo(() => [...albums, ...albums], [albums]);

  if (albums.length === 0) return null;

  const handleIteration = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (!e.animationName.startsWith("th-marquee")) return;
    onCycleComplete();
  };

  return (
    <div className="th-marquee__viewport w-full overflow-hidden">
      <div
        className={
          direction === "left"
            ? "th-marquee__track th-marquee__track--left"
            : "th-marquee__track th-marquee__track--right"
        }
        style={{ animationDuration: `${durationSec}s` }}
        onAnimationIteration={handleIteration}
      >
        {loop.map((album, i) => (
          <Link
            key={`${album.id}-${album.source}-${i}`}
            href={`/album/${encodeURIComponent(album.id)}?source=${album.source}`}
            draggable={false}
            className="group relative flex-shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fb3d93] motion-safe:transition motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none"
          >
            <div className="th-marquee__tile overflow-hidden rounded-xl border border-white/10 bg-[#14141c] shadow-lg shadow-black/40 motion-safe:transition motion-safe:duration-300 motion-safe:ease-out group-hover:border-[#fb3d93]/50 group-hover:shadow-[#fb3d93]/10 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:scale-[1.03] motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:scale-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={album.image}
                alt=""
                width={154}
                height={154}
                className="aspect-square h-[6.55rem] w-[6.55rem] object-cover sm:h-[8.75rem] sm:w-[8.75rem] md:h-[175px] md:w-[175px]"
                loading={i < 8 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
            <span className="sr-only">
              {album.name} — {album.artist}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function AlbumHeroCarousel() {
  const [topRow, setTopRow] = useState<AlbumCard[]>([]);
  const [bottomRow, setBottomRow] = useState<AlbumCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/albums/carousel");
        const data = (await res.json()) as { albums?: AlbumCard[]; error?: string };
        if (!res.ok) {
          throw new Error(data.error || "Could not load albums");
        }
        const list = data.albums ?? [];
        if (list.length < 20) {
          throw new Error(data.error || "Not enough albums for carousel");
        }
        if (!cancelled) {
          setTopRow(list.slice(0, 10));
          setBottomRow(list.slice(10, 20));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load albums");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const shuffleTop = useCallback(() => {
    setTopRow((prev) => (prev.length ? fisherYatesShuffle(prev) : prev));
  }, []);

  const shuffleBottom = useCallback(() => {
    setBottomRow((prev) => (prev.length ? fisherYatesShuffle(prev) : prev));
  }, []);

  if (error) {
    return (
      <div className="bg-transparent px-4 py-6 text-center text-sm text-red-300/90">
        {error}
      </div>
    );
  }

  if (topRow.length === 0 || bottomRow.length === 0) {
    return (
      <div className="bg-transparent px-4 py-10">
        <div className="mx-auto flex max-w-4xl flex-col gap-3">
          <div className="h-[8.75rem] animate-pulse rounded-xl bg-white/5" />
          <div className="h-[8.75rem] animate-pulse rounded-xl bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent py-4 md:py-5">
      <div className="flex flex-col gap-3 md:gap-4">
        <MarqueeRow
          albums={topRow}
          direction="left"
          durationSec={52}
          onCycleComplete={shuffleTop}
        />
        <MarqueeRow
          albums={bottomRow}
          direction="right"
          durationSec={58}
          onCycleComplete={shuffleBottom}
        />
      </div>
    </div>
  );
}
