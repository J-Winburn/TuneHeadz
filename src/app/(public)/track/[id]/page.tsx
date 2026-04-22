import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientCredentialsToken } from "@/lib/spotify-client-credentials";

type TrackDetails = {
  id: string;
  name: string;
  duration_ms?: number;
  explicit?: boolean;
  external_urls?: { spotify?: string };
  artists: { id?: string; name: string }[];
  album?: {
    id?: string;
    name: string;
    release_date?: string;
    images?: { url: string }[];
  };
};

function formatMs(durationMs?: number) {
  if (!durationMs) return "--:--";
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

async function fetchTrack(id: string) {
  const token = await getClientCredentialsToken();
  const response = await fetch(`https://api.spotify.com/v1/tracks/${encodeURIComponent(id)}?market=US`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return (await response.json()) as TrackDetails;
}

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const track = await fetchTrack(id);
  if (!track) notFound();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <img
            src={track.album?.images?.[0]?.url || "https://placehold.co/320x320/1e2128/f2f4f8?text=Track"}
            alt={track.name}
            className="h-64 w-64 rounded-2xl object-cover shadow-2xl"
          />
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-[#9aa5b5]">Song</p>
            <h1 className="mt-1 text-4xl font-semibold text-white md:text-5xl">{track.name}</h1>
            <p className="mt-3 text-sm text-[#b8c2d0]">
              {track.artists.map((artist, index) => (
                <span key={`${artist.name}-${index}`}>
                  {artist.id ? (
                    <Link href={`/artist/${encodeURIComponent(artist.id)}`} className="hover:text-white">
                      {artist.name}
                    </Link>
                  ) : (
                    artist.name
                  )}
                  {index < track.artists.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
            <p className="mt-2 text-sm text-[#9aa5b5]">
              {formatMs(track.duration_ms)} · {track.explicit ? "Explicit" : "Clean"}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {track.album?.id ? (
                <Link
                  href={`/album/${encodeURIComponent(track.album.id)}?source=spotify`}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-[#dbe3ee] transition hover:border-[#fb3d93]/60 hover:text-white"
                >
                  View album
                </Link>
              ) : null}
              {track.external_urls?.spotify ? (
                <a
                  href={track.external_urls.spotify}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-[#fb3d93]/40 px-4 py-2 text-sm text-[#ffd0e8] transition hover:border-[#fb3d93] hover:text-white"
                >
                  Open on Spotify
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
