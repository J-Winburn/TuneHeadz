import { NextRequest, NextResponse } from "next/server";
import type { AlbumSource } from "@/lib/albums/detail";
import { getAlbumDetail } from "@/lib/albums/detail";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const source = request.nextUrl.searchParams.get("source") as AlbumSource | null;

  if (!id || (source !== "spotify" && source !== "musicbrainz")) {
    return NextResponse.json(
      { error: "Missing or invalid id/source. Use ?source=spotify or ?source=musicbrainz" },
      { status: 400 },
    );
  }

  try {
    const album = await getAlbumDetail(id, source);
    return NextResponse.json(album);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load album";
    const status = message.includes("not found") || message.includes("Not found") ? 404 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
