"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Flame, Music4, Newspaper, Sparkles, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type RecItem = {
  title: string;
  meta: string;
  tag?: string;
  image?: string;
  avatar?: string;
  spotifyQuery?: string;
};

type RecSection = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: RecItem[];
};

const sections: RecSection[] = [
  {
    id: "drops",
    label: "New Music Drops",
    icon: Sparkles,
    items: [
      {
        title: "SZA - Saturn (Deluxe)",
        meta: "R&B - 12 tracks",
        tag: "new",
        image:
          "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80",
        spotifyQuery: "Saturn SZA",
      },
      {
        title: "Billie Eilish - Neon Veins",
        meta: "Alt Pop - Album",
        image:
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=300&q=80",
        spotifyQuery: "Billie Eilish",
      },
      {
        title: "Metro + Future - Night Shift",
        meta: "Hip-Hop - Collab",
        image:
          "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=300&q=80",
        spotifyQuery: "Future Metro Boomin",
      },
      {
        title: "Mk.gee - Midnight Tape",
        meta: "Indie - EP",
        image:
          "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=80",
        spotifyQuery: "Mk.gee",
      },
    ],
  },
  {
    id: "reviews",
    label: "Popular Reviews This Week",
    icon: Flame,
    items: [
      {
        title: "Brat - Charli XCX",
        meta: "2.3k likes - avg 4.3",
        image:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=80",
        spotifyQuery: "Brat Charli xcx",
      },
      {
        title: "SOS - SZA",
        meta: "1.8k likes - avg 4.6",
        image:
          "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=300&q=80",
        spotifyQuery: "SOS SZA",
      },
      {
        title: "IGOR - Tyler, The Creator",
        meta: "1.5k likes - avg 4.7",
        image:
          "https://images.unsplash.com/photo-1513829596324-4bb2800c5efb?auto=format&fit=crop&w=300&q=80",
        spotifyQuery: "IGOR Tyler The Creator",
      },
      {
        title: "Blonde - Frank Ocean",
        meta: "1.2k likes - avg 4.8",
        image:
          "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=300&q=80",
        spotifyQuery: "Blonde Frank Ocean",
      },
    ],
  },
  {
    id: "news",
    label: "Latest Music News",
    icon: Newspaper,
    items: [
      {
        title: "Rolling Loud lineup officially announced",
        meta: "Updated 3h ago",
        image:
          "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=300&q=80",
      },
      {
        title: "Spotify rolls out collaborative queue upgrades",
        meta: "Updated today",
        image:
          "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=300&q=80",
      },
      {
        title: "Top 50 breakout artists this month",
        meta: "Editorial",
        image:
          "https://images.unsplash.com/photo-1461783436728-0a9217714694?auto=format&fit=crop&w=300&q=80",
      },
      {
        title: "Major label release calendar for Friday",
        meta: "Industry",
        image:
          "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=300&q=80",
      },
    ],
  },
  {
    id: "friends-new",
    label: "New From Friends",
    icon: Users,
    items: [
      {
        title: "@kevon made a list: Gym Rotation 2026",
        meta: "9 tracks added",
        image:
          "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=300&q=80",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      {
        title: "@jaz reviewed Cowboy Carter",
        meta: '"This one grew on me"',
        image:
          "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=300&q=80",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      },
      {
        title: "@maria saved 4 albums",
        meta: "indie / dream pop",
        image:
          "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=300&q=80",
        avatar: "https://randomuser.me/api/portraits/women/63.jpg",
      },
      {
        title: '@dom updated "Late Night Drives"',
        meta: "2 new tracks",
        image:
          "https://images.unsplash.com/photo-1461783436728-0a9217714694?auto=format&fit=crop&w=300&q=80",
        avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      },
    ],
  },
  {
    id: "friends-listening",
    label: "What My Friends Have Been Listening To",
    icon: Music4,
    items: [
      {
        title: "NIGHTS LIKE THIS - The Kid LAROI",
        meta: "4 friends listening",
        image:
          "https://images.unsplash.com/photo-1507878866276-a947ef722fee?auto=format&fit=crop&w=300&q=80",
        avatar: "https://randomuser.me/api/portraits/men/75.jpg",
        spotifyQuery: "NIGHTS LIKE THIS The Kid LAROI",
      },
      {
        title: "Snooze - SZA",
        meta: "3 friends listening",
        image:
          "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=80",
        avatar: "https://randomuser.me/api/portraits/women/28.jpg",
        spotifyQuery: "Snooze SZA",
      },
      {
        title: "Feather - Sabrina Carpenter",
        meta: "3 friends listening",
        image:
          "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=300&q=80",
        avatar: "https://randomuser.me/api/portraits/women/51.jpg",
        spotifyQuery: "Feather Sabrina Carpenter",
      },
      {
        title: "No Role Modelz - J. Cole",
        meta: "2 friends listening",
        image:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=80",
        avatar: "https://randomuser.me/api/portraits/men/19.jpg",
        spotifyQuery: "No Role Modelz J. Cole",
      },
    ],
  },
];

function HorizontalRail({
  items,
  imageOverrides,
  squareCovers,
}: {
  items: RecItem[];
  imageOverrides: Record<string, string>;
  squareCovers: boolean;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const startScrollLeft = useRef(0);
  const [dragging, setDragging] = useState(false);

  const railItems = items.length < 6 ? [...items, ...items] : items;

  const scrollByAmount = (amount: number) => {
    railRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollByAmount(-320)}
        aria-label="Scroll left"
        className="absolute left-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#2b3040] bg-[#0f1420]/90 text-[#c4cfdd] transition hover:border-[#fb3d93]/60 hover:text-white md:flex"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        onClick={() => scrollByAmount(320)}
        aria-label="Scroll right"
        className="absolute right-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#2b3040] bg-[#0f1420]/90 text-[#c4cfdd] transition hover:border-[#fb3d93]/60 hover:text-white md:flex"
      >
        <ChevronRight size={16} />
      </button>

      <div
        ref={railRef}
        className={`th-subtle-scroll overflow-x-auto pb-2 [touch-action:pan-x] ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        onWheel={(event) => {
          if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            event.currentTarget.scrollLeft += event.deltaY;
          }
        }}
        onMouseDown={(event) => {
          setDragging(true);
          dragStartX.current = event.clientX;
          startScrollLeft.current = event.currentTarget.scrollLeft;
        }}
        onMouseMove={(event) => {
          if (!dragging) return;
          const delta = event.clientX - dragStartX.current;
          event.currentTarget.scrollLeft = startScrollLeft.current - delta;
        }}
        onMouseLeave={() => setDragging(false)}
        onMouseUp={() => setDragging(false)}
      >
        <ul className="flex min-w-max gap-0 pr-6">
          {railItems.map((item, index) => (
            <li
              key={`${item.title}-${index}`}
              className="w-[260px] shrink-0 border-l border-[#2b3040] px-4 py-2 first:border-l-0"
            >
              <div className="mb-2 overflow-hidden rounded-md border border-[#2b3040] bg-[#161b28]">
                <img
                  src={
                    imageOverrides[item.title] ||
                    item.image ||
                    "https://placehold.co/300x180/141827/f1f5f8?text=TuneHeadz"
                  }
                  alt={item.title}
                  className={squareCovers ? "aspect-square w-full object-cover" : "h-24 w-full object-cover"}
                />
              </div>
              <p className="line-clamp-2 text-sm font-medium text-white transition hover:text-[#ffd5e8]">
                {item.title}
              </p>
              <div className="mt-1 flex items-center gap-2">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt="Friend profile"
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : null}
                <p className="text-xs text-[#9ab0be]">{item.meta}</p>
              </div>
              {item.tag ? (
                <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#fb3d93]">
                  {item.tag}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function WeeklyRecommendations() {
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/weekly-spotify-images", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { images?: Record<string, string> };
        if (!cancelled && data.images) {
          setImageOverrides(data.images);
        }
      } catch {
        // keep static fallback images if Spotify fetch fails
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="pb-2 md:pb-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8ea5b4]">
            This Week
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-white md:text-3xl">
            Weekly Recommendations
          </h2>
        </div>
      </div>

      <div className="space-y-5 md:space-y-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <article key={section.id} className="border-t border-[#2b3040] pt-3 md:pt-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-[#fb3d93]" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#d8e0e8] md:text-base">
                    {section.label}
                  </h3>
                </div>
                <button className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8ea5b4] transition hover:text-[#fb3d93]">
                  More
                </button>
              </div>

              <HorizontalRail
                items={section.items}
                imageOverrides={imageOverrides}
                squareCovers={section.id === "drops" || section.id === "reviews"}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
