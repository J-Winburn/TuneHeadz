import { NextRequest, NextResponse } from "next/server";
import { getClientCredentialsToken } from "@/lib/spotify-client-credentials";
import { findGenreBySlug } from "@/lib/genres";

type GenreAlbum = {
  id: string;
  name: string;
  artist: string;
  image: string;
  releaseDate: string;
  spotifyUrl?: string;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const genre = findGenreBySlug(slug);
  if (!genre) {
    return NextResponse.json({ error: "Unknown genre", albums: [] }, { status: 404 });
  }

  try {
    const token = await getClientCredentialsToken();
    const q = encodeURIComponent(genre.query);
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${q}&type=album&limit=24`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Spotify genre search failed");
    }

    const data = (await response.json()) as {
      albums?: {
        items: Array<{
          id: string;
          name: string;
          artists: { name: string }[];
          images: { url: string }[];
          release_date?: string;
          external_urls?: { spotify?: string };
        }>;
      };
    };

    const albums: GenreAlbum[] = (data.albums?.items ?? []).map((album) => ({
      id: album.id,
      name: album.name,
      artist: album.artists?.[0]?.name ?? "Unknown",
      image: album.images?.[0]?.url ?? "",
      releaseDate: album.release_date ?? "",
      spotifyUrl: album.external_urls?.spotify,
    }));

    return NextResponse.json({ genre: genre.title, albums });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load genre albums";
    return NextResponse.json({ error: message, albums: [] }, { status: 500 });
  }
}
