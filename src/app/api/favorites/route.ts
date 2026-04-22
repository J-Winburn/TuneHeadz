import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminOrNull } from "@/lib/supabase-admin";
import { logActivity } from "@/lib/activity";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function unavailable() {
  return NextResponse.json({ error: "Favorites are not configured yet.", saved: [] }, { status: 503 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return unauthorized();

  const supabase = getSupabaseAdminOrNull();
  if (!supabase) return unavailable();
  const { data, error } = await supabase
    .from("saved_tracks")
    .select("id,spotify_track_id,track_name,artists,album_name,image_url,saved_at")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    saved:
      data?.map((row) => ({
        id: row.id,
        spotifyTrackId: row.spotify_track_id,
        trackName: row.track_name,
        artists: Array.isArray(row.artists) ? row.artists : [],
        albumName: row.album_name,
        imageUrl: row.image_url,
        savedAt: row.saved_at,
      })) ?? [],
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return unauthorized();

  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    name?: string;
    artists?: { name: string }[];
    album?: { name?: string; images?: { url?: string }[] };
  };

  const spotifyTrackId = (body.id ?? "").trim();
  const trackName = (body.name ?? "").trim();
  const artists = (body.artists ?? []).map((a) => a.name).filter(Boolean);
  const albumName = (body.album?.name ?? "").trim() || null;
  const imageUrl = body.album?.images?.[0]?.url ?? null;

  if (!spotifyTrackId || !trackName || artists.length === 0) {
    return NextResponse.json({ error: "Invalid track payload." }, { status: 400 });
  }

  const supabase = getSupabaseAdminOrNull();
  if (!supabase) return unavailable();
  const { error } = await supabase.from("saved_tracks").upsert(
    {
      user_id: userId,
      spotify_track_id: spotifyTrackId,
      track_name: trackName,
      artists,
      album_name: albumName,
      image_url: imageUrl,
    },
    { onConflict: "user_id,spotify_track_id" },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity({
    userId,
    type: "saved",
    title: `Saved ${trackName}`,
    subtitle: `${artists.join(", ")}${albumName ? ` • ${albumName}` : ""}`,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return unauthorized();

  const body = (await request.json().catch(() => ({}))) as { spotifyTrackId?: string };
  const spotifyTrackId = (body.spotifyTrackId ?? "").trim();
  if (!spotifyTrackId) {
    return NextResponse.json({ error: "spotifyTrackId is required." }, { status: 400 });
  }

  const supabase = getSupabaseAdminOrNull();
  if (!supabase) return unavailable();
  const { error } = await supabase
    .from("saved_tracks")
    .delete()
    .eq("user_id", userId)
    .eq("spotify_track_id", spotifyTrackId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
