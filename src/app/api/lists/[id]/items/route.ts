import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminOrNull } from "@/lib/supabase-admin";
import { logActivity } from "@/lib/activity";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function unavailable() {
  return NextResponse.json({ error: "Lists are not configured yet." }, { status: 503 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return unauthorized();
  const { id } = await params;

  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    artist?: string;
    image?: string;
  };
  const title = (body.title ?? "").trim();
  const artist = (body.artist ?? "").trim();
  const image = (body.image ?? "").trim() || null;

  if (!title || !artist) {
    return NextResponse.json({ error: "Title and artist are required." }, { status: 400 });
  }

  const supabase = getSupabaseAdminOrNull();
  if (!supabase) return unavailable();
  const { data: owner } = await supabase
    .from("lists")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!owner) {
    return NextResponse.json({ error: "List not found." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("list_items")
    .insert({ list_id: id, title, artist, image })
    .select("id,title,artist,image,added_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logActivity({
    userId,
    type: "listed",
    title: `Added ${title}`,
    subtitle: `${artist}`,
  });

  await supabase.from("lists").update({ updated_at: new Date().toISOString() }).eq("id", id);

  return NextResponse.json({
    item: {
      id: data.id,
      title: data.title,
      artist: data.artist,
      image: data.image ?? undefined,
      addedAt: data.added_at,
    },
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return unauthorized();
  const { id } = await params;
  const itemId = request.nextUrl.searchParams.get("itemId");

  if (!itemId) {
    return NextResponse.json({ error: "Missing itemId." }, { status: 400 });
  }

  const supabase = getSupabaseAdminOrNull();
  if (!supabase) return unavailable();
  const { data: owner } = await supabase
    .from("lists")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!owner) {
    return NextResponse.json({ error: "List not found." }, { status: 404 });
  }

  const { error } = await supabase.from("list_items").delete().eq("id", itemId).eq("list_id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("lists").update({ updated_at: new Date().toISOString() }).eq("id", id);

  return NextResponse.json({ success: true });
}
