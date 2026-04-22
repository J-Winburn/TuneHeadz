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

async function getSpotifyNewReleasesWithToken(accessToken: string): Promise<AlbumCard[]> {
  const response = await fetch(
    `https://api.spotify.com/v1/browse/new-releases?limit=20`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    },
  );

  if (!response.ok) throw new Error("Spotify request failed");

  const data = (await response.json()) as {
    albums?: { items: SpotifyAlbum[] };
  };
  const albums = data.albums?.items ?? [];

  return albums
    .filter((album) => album.images.length > 0)
    .map((album) => ({
      id: album.id,
      name: album.name,
      artist: album.artists[0]?.name || "Unknown",
      image: album.images[0]?.url || "",
      source: "spotify" as const,
    }));
}

async function getSpotifyViaClientCredentials(): Promise<AlbumCard[]> {
  try {
    const token = await getClientCredentialsToken();
    return getSpotifyNewReleasesWithToken(token);
  } catch {
    return [];
  }
}

async function getSpotifyViaSession(accessToken: string): Promise<AlbumCard[]> {
  try {
    return await getSpotifyNewReleasesWithToken(accessToken);
  } catch (error) {
    console.error("Spotify session fetch failed:", error);
    return [];
  }
}

async function getRandomMusicBrainzAlbums(): Promise<AlbumCard[]> {
  try {
    const releases: AlbumCard[] = [];
    const artists = [
      "Kendrick Lamar",
      "Drake",
      "The Weeknd",
      "Bad Bunny",
      "Taylor Swift",
      "Ariana Grande",
      "Post Malone",
      "Billie Eilish",
      "Harry Styles",
      "Dua Lipa",
    ];

    for (const artist of artists.slice(0, 3)) {
      try {
        const response = await fetch(
          `https://musicbrainz.org/ws/2/release?query=artist:"${artist}"&limit=5&fmt=json`,
          {
            headers: { "User-Agent": "TuneHeadz/1.0" },
            cache: "no-store",
          },
        );

        if (!response.ok) continue;

        const data = (await response.json()) as {
          releases?: Array<{
            id: string;
            title: string;
            "artist-credit": Array<{ name: string }>;
          }>;
        };

        const items = data.releases?.slice(0, 5) ?? [];

        for (const release of items) {
          const coverResponse = await fetch(
            `https://coverartarchive.org/release/${release.id}/front-500.jpg`,
            { cache: "no-store" },
          ).catch(() => null);

          const image =
            coverResponse && coverResponse.ok
              ? `https://coverartarchive.org/release/${release.id}/front-500.jpg`
              : "";

          if (image) {
            releases.push({
              id: release.id,
              name: release.title,
              artist: release["artist-credit"]?.[0]?.name || "Unknown",
              image,
              source: "musicbrainz",
            });
          }
        }
      } catch {
        continue;
      }
    }

    return releases.slice(0, 20);
  } catch (error) {
    console.error("MusicBrainz fetch failed:", error);
    return [];
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const sessionToken = (session as { accessToken?: string } | null)?.accessToken;

    let albums: AlbumCard[] = [];

    albums = await getSpotifyViaClientCredentials();
    if (albums.length === 0 && sessionToken) {
      albums = await getSpotifyViaSession(sessionToken);
    }
    if (albums.length === 0) {
      albums = await getRandomMusicBrainzAlbums();
    }

    if (albums.length === 0) {
      return NextResponse.json(
        { error: "Failed to fetch albums" },
        { status: 500 },
      );
    }

    albums = [...albums].sort(() => Math.random() - 0.5);

    return NextResponse.json({ albums });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
