import Link from "next/link";
import { notFound } from "next/navigation";
import type { AlbumSource } from "@/lib/albums/detail";
import { getAlbumDetail } from "@/lib/albums/detail";
import { AlbumDetailView } from "./album-detail-view";

export default async function AlbumPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ source?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const raw = sp.source;
  const source: AlbumSource | null =
    raw === "musicbrainz" ? "musicbrainz" : raw === "spotify" ? "spotify" : null;

  if (!source) {
    notFound();
  }

  let err: string | null = null;
  let album: Awaited<ReturnType<typeof getAlbumDetail>> | undefined;
  try {
    album = await getAlbumDetail(id, source);
  } catch (e) {
    err = e instanceof Error ? e.message : "Could not load this album.";
  }

  if (err || !album) {
    return (
      <main className="min-h-screen bg-[#000000] px-4 py-12 text-[#f1f5f8]">
        <div className="th-shell max-w-xl text-center">
          <p className="text-lg text-red-300/90">{err ?? "Could not load this album."}</p>
          <p className="mt-4 text-sm text-[#9ab0be]">
            For Spotify albums, ensure <code className="text-[#fb3d93]">SPOTIFY_CLIENT_ID</code> and{" "}
            <code className="text-[#fb3d93]">SPOTIFY_CLIENT_SECRET</code> are set on the server.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block text-sm uppercase tracking-[0.14em] text-[#fb3d93] hover:underline"
          >
            ← Back home
          </Link>
        </div>
      </main>
    );
  }

  return <AlbumDetailView album={album} />;
}
