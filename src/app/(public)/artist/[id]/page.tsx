import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientCredentialsToken } from "@/lib/spotify-client-credentials";

type ArtistDetails = {
  id: string;
  name: string;
  genres?: string[];
  followers?: { total?: number };
  images?: { url: string }[];
  external_urls?: { spotify?: string };
};

type Track = {
  id: string;
  name: string;
  album?: { id?: string; name: string; images?: { url: string }[] };
  external_urls?: { spotify?: string };
};

type Album = {
  id: string;
  name: string;
  release_date?: string;
  images?: { url: string }[];
};

async function fetchArtistBundle(id: string) {
  const token = await getClientCredentialsToken();

  const [artistRes, topTracksRes, albumsRes] = await Promise.all([
    fetch(`https://api.spotify.com/v1/artists/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
    fetch(`https://api.spotify.com/v1/artists/${encodeURIComponent(id)}/top-tracks?market=US`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
    fetch(
      `https://api.spotify.com/v1/artists/${encodeURIComponent(id)}/albums?include_groups=album,single&market=US&limit=12`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    ),
  ]);

  if (!artistRes.ok) return null;

  const artist = (await artistRes.json()) as ArtistDetails;
  const topTracksData = topTracksRes.ok ? ((await topTracksRes.json()) as { tracks?: Track[] }) : { tracks: [] };
  const albumsData = albumsRes.ok ? ((await albumsRes.json()) as { items?: Album[] }) : { items: [] };

  return {
    artist,
    topTracks: topTracksData.tracks ?? [],
    albums: albumsData.items ?? [],
  };
}

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await fetchArtistBundle(id);
  if (!data) notFound();

  const { artist, topTracks, albums } = data;
  const hero = artist.images?.[0]?.url;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <img
            src={hero || "https://placehold.co/300x300/1e2128/f2f4f8?text=Artist"}
            alt={artist.name}
            className="h-56 w-56 rounded-full object-cover shadow-2xl"
          />
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-[#9aa5b5]">Artist</p>
            <h1 className="mt-1 text-4xl font-semibold text-white md:text-5xl">{artist.name}</h1>
            <p className="mt-3 text-sm text-[#b8c2d0]">
              {artist.followers?.total ? `${artist.followers.total.toLocaleString()} followers` : "Spotify artist"}
            </p>
            {artist.genres?.length ? (
              <p className="mt-2 text-sm text-[#a8b2c0]">{artist.genres.slice(0, 4).join(" · ")}</p>
            ) : null}
            {artist.external_urls?.spotify ? (
              <a
                href={artist.external_urls.spotify}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex rounded-full border border-[#fb3d93]/40 px-4 py-2 text-sm font-medium text-[#ffd0e8] transition hover:border-[#fb3d93] hover:text-white"
              >
                Open on Spotify
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-white">Top songs</h2>
        <div className="mt-3 space-y-2">
          {topTracks.slice(0, 8).map((track) => (
            <Link
              key={track.id}
              href={`/track/${encodeURIComponent(track.id)}`}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 transition hover:border-[#fb3d93]/50"
            >
              <img
                src={track.album?.images?.[0]?.url || "https://placehold.co/64x64/1e2128/f2f4f8?text=%E2%99%AA"}
                alt={track.name}
                className="h-14 w-14 rounded object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-base font-medium text-white">{track.name}</p>
                <p className="truncate text-sm text-[#a9b3c2]">{track.album?.name || "Track"}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-white">Recent releases</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {albums.slice(0, 8).map((album) => (
            <Link
              key={album.id}
              href={`/album/${encodeURIComponent(album.id)}?source=spotify`}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 transition hover:border-[#fb3d93]/50"
            >
              <img
                src={album.images?.[0]?.url || "https://placehold.co/300x300/1e2128/f2f4f8?text=Album"}
                alt={album.name}
                className="h-auto w-full rounded-lg object-cover"
              />
              <p className="mt-3 line-clamp-1 text-sm font-medium text-white">{album.name}</p>
              <p className="mt-1 text-xs text-[#9aa5b5]">{album.release_date || "Release date unavailable"}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
