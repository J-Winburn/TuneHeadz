import { getClientCredentialsToken } from "@/lib/spotify-client-credentials";

export type AlbumSource = "spotify" | "musicbrainz";

export type PublicAlbumDetail = {
  source: AlbumSource;
  id: string;
  name: string;
  artists: string;
  artistId?: string;
  image: string | null;
  releaseDate?: string;
  totalTracks?: number;
  label?: string;
  tracks: { position: number; title: string; durationMs?: number; lengthSec?: number }[];
  spotifyUrl?: string;
  moreByArtist?: {
    id: string;
    name: string;
    image: string | null;
    releaseDate?: string;
  }[];
};

async function fetchSpotifyAlbum(id: string): Promise<PublicAlbumDetail> {
  const token = await getClientCredentialsToken();
  const res = await fetch(`https://api.spotify.com/v1/albums/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Album not found");
  }
  const data = (await res.json()) as {
    id: string;
    name: string;
    artists: { id: string; name: string }[];
    images: { url: string }[];
    release_date: string;
    total_tracks: number;
    label?: string;
    copyrights?: { text: string }[];
    external_urls?: { spotify?: string };
    tracks?: {
      items: Array<{
        id: string;
        name: string;
        track_number: number;
        duration_ms: number;
      }>;
    };
  };

  const tracks = (data.tracks?.items ?? []).map((t) => ({
    position: t.track_number,
    title: t.name,
    durationMs: t.duration_ms,
  }));

  const primaryArtist = data.artists?.[0];
  let moreByArtist: PublicAlbumDetail["moreByArtist"] = [];
  if (primaryArtist?.id) {
    const moreRes = await fetch(
      `https://api.spotify.com/v1/artists/${encodeURIComponent(primaryArtist.id)}/albums?include_groups=album,single&market=US&limit=12`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    if (moreRes.ok) {
      const moreData = (await moreRes.json()) as {
        items?: Array<{
          id: string;
          name: string;
          images?: { url: string }[];
          release_date?: string;
        }>;
      };
      moreByArtist = (moreData.items ?? [])
        .filter((album) => album.id !== data.id)
        .map((album) => ({
          id: album.id,
          name: album.name,
          image: album.images?.[0]?.url ?? null,
          releaseDate: album.release_date,
        }))
        .slice(0, 8);
    }
  }

  return {
    source: "spotify",
    id: data.id,
    name: data.name,
    artists: data.artists?.map((a) => a.name).join(", ") || "Unknown",
    artistId: primaryArtist?.id,
    image: data.images?.[0]?.url ?? null,
    releaseDate: data.release_date,
    totalTracks: data.total_tracks,
    label: data.label || data.copyrights?.[0]?.text,
    tracks,
    spotifyUrl: data.external_urls?.spotify,
    moreByArtist,
  };
}

async function fetchMusicBrainzRelease(id: string): Promise<PublicAlbumDetail> {
  const res = await fetch(
    `https://musicbrainz.org/ws/2/release/${encodeURIComponent(id)}?inc=artist-credits+labels+recordings+media&fmt=json`,
    {
      headers: { "User-Agent": "TuneHeadz/1.0 (https://github.com)" },
      cache: "no-store",
    },
  );
  if (!res.ok) {
    throw new Error("Release not found");
  }
  const data = (await res.json()) as {
    id: string;
    title: string;
    date?: string;
    "artist-credit"?: Array<{ name: string }>;
    "label-info"?: Array<{ label?: { name?: string } }>;
    media?: Array<{
      tracks?: Array<{
        position: number;
        title?: string;
        length?: number;
        recording?: { title?: string };
      }>;
    }>;
  };

  const tracks: PublicAlbumDetail["tracks"] = [];
  let fallbackPos = 0;
  for (const m of data.media ?? []) {
    for (const tr of m.tracks ?? []) {
      fallbackPos += 1;
      const title =
        tr.title || tr.recording?.title || "Track";
      const lengthMs = tr.length ?? undefined;
      tracks.push({
        position: tr.position ?? fallbackPos,
        title,
        lengthSec: lengthMs !== undefined ? Math.round(lengthMs / 1000) : undefined,
      });
    }
  }

  const artist =
    data["artist-credit"]?.map((a) => a.name).join(", ") || "Unknown";

  return {
    source: "musicbrainz",
    id: data.id,
    name: data.title,
    artists: artist,
    image: `https://coverartarchive.org/release/${data.id}/front-500.jpg`,
    releaseDate: data.date,
    totalTracks: tracks.length || undefined,
    label: data["label-info"]?.[0]?.label?.name,
    tracks,
  };
}

export async function getAlbumDetail(
  id: string,
  source: AlbumSource,
): Promise<PublicAlbumDetail> {
  if (source === "spotify") {
    return fetchSpotifyAlbum(id);
  }
  return fetchMusicBrainzRelease(id);
}
