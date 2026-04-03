import { NextRequest, NextResponse } from "next/server";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search";

const searchTypeMap = {
  all: "track,artist",
  track: "track",
  artist: "artist",
} as const;

async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify credentials");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to authenticate with Spotify.");
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const type = (request.nextUrl.searchParams.get("type") || "all") as keyof typeof searchTypeMap;

  if (!query) {
    return NextResponse.json(
      { error: "Please provide a song or artist to search for.", tracks: [], artists: [] },
      { status: 400 },
    );
  }

  try {
    const accessToken = await getSpotifyAccessToken();
    const searchParams = new URLSearchParams({
      q: query,
      type: searchTypeMap[type] ?? searchTypeMap.all,
      limit: "8",
    });

    const response = await fetch(`${SPOTIFY_SEARCH_URL}?${searchParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Spotify search request failed.");
    }

    const data = (await response.json()) as {
      tracks?: { items: unknown[] };
      artists?: { items: unknown[] };
    };

    return NextResponse.json({
      tracks: data.tracks?.items ?? [],
      artists: data.artists?.items ?? [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json(
      { error: message, tracks: [], artists: [] },
      { status: 500 },
    );
  }
}
