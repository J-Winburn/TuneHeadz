import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getClientCredentialsToken } from "@/lib/spotify-client-credentials";
import type { AlbumCard } from "@/types/album";

type SpotifyAlbum = {
  id: string;
  name: string;
  artists: { name: string }[];
  images: { url: string }[];
};

async function fetchNewReleasesSorted(token: string): Promise<AlbumCard[]> {
  const response = await fetch(
    "https://api.spotify.com/v1/browse/new-releases?limit=50",
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (!response.ok) throw new Error("Spotify request failed");

  const data = (await response.json()) as {
    albums?: { items: SpotifyAlbum[] };
  };
  const albums = data.albums?.items ?? [];

  const cards: AlbumCard[] = albums
    .filter((album) => album.images.length > 0)
    .map((album) => ({
      id: album.id,
      name: album.name,
      artist: album.artists[0]?.name || "Unknown",
      image: album.images[0]?.url || "",
      source: "spotify" as const,
    }));

  return cards.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const sessionToken = (session as { accessToken?: string } | null)?.accessToken;

    let albums: AlbumCard[] = [];

    try {
      const token = await getClientCredentialsToken();
      albums = await fetchNewReleasesSorted(token);
    } catch {
      // try user session token
    }

    if (albums.length === 0 && sessionToken) {
      try {
        albums = await fetchNewReleasesSorted(sessionToken);
      } catch {
        albums = [];
      }
    }

    if (albums.length === 0) {
      return NextResponse.json(
        { error: "Failed to fetch albums" },
        { status: 500 },
      );
    }

    return NextResponse.json({ albums });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
