import { NextResponse } from "next/server";
import { getClientCredentialsToken } from "@/lib/spotify-client-credentials";

const WEEKLY_QUERIES: Array<{ title: string; q: string }> = [
  { title: "SZA - Saturn (Deluxe)", q: "Saturn SZA" },
  { title: "Billie Eilish - Neon Veins", q: "Billie Eilish" },
  { title: "Metro + Future - Night Shift", q: "Future Metro Boomin" },
  { title: "Mk.gee - Midnight Tape", q: "Mk.gee" },
  { title: "Brat - Charli XCX", q: "Brat Charli xcx" },
  { title: "SOS - SZA", q: "SOS SZA" },
  { title: "IGOR - Tyler, The Creator", q: "IGOR Tyler The Creator" },
  { title: "Blonde - Frank Ocean", q: "Blonde Frank Ocean" },
  { title: "NIGHTS LIKE THIS - The Kid LAROI", q: "NIGHTS LIKE THIS The Kid LAROI" },
  { title: "Snooze - SZA", q: "Snooze SZA" },
  { title: "Feather - Sabrina Carpenter", q: "Feather Sabrina Carpenter" },
  { title: "No Role Modelz - J. Cole", q: "No Role Modelz J. Cole" },
];

type SpotifySearchResult = {
  albums?: { items?: Array<{ images?: Array<{ url: string }> }> };
  tracks?: { items?: Array<{ album?: { images?: Array<{ url: string }> } }> };
  artists?: { items?: Array<{ images?: Array<{ url: string }> }> };
};

export async function GET() {
  try {
    const token = await getClientCredentialsToken();

    const pairs = await Promise.all(
      WEEKLY_QUERIES.map(async (entry) => {
        const response = await fetch(
          `https://api.spotify.com/v1/search?${new URLSearchParams({
            q: entry.q,
            type: "album,track,artist",
            market: "US",
            limit: "1",
          })}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          },
        );
        if (!response.ok) return [entry.title, null] as const;

        const data = (await response.json()) as SpotifySearchResult;
        const image =
          data.albums?.items?.[0]?.images?.[0]?.url ||
          data.tracks?.items?.[0]?.album?.images?.[0]?.url ||
          data.artists?.items?.[0]?.images?.[0]?.url ||
          null;

        return [entry.title, image] as const;
      }),
    );

    const images = Object.fromEntries(
      pairs.filter(([, image]) => Boolean(image)) as Array<[string, string]>,
    );

    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: {} });
  }
}
