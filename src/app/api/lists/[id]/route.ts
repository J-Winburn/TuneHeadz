import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminOrNull } from "@/lib/supabase-admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function unavailable() {
  return NextResponse.json({ error: "Lists are not configured yet." }, { status: 503 });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return unauthorized();
  const { id } = await params;

  const supabase = getSupabaseAdminOrNull();
  if (!supabase) return unavailable();
  const { data, error } = await supabase
    .from("lists")
    .select(
      "id,title,description,created_at,updated_at,list_items(id,title,artist,image,added_at)",
    )
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "List not found." }, { status: 404 });
  }

  const items = (data.list_items ?? [])
    .slice()
    .sort((a, b) => (a.added_at < b.added_at ? 1 : -1))
    .map((item) => ({
      id: item.id,
      title: item.title,
      artist: item.artist,
      image: item.image ?? undefined,
      addedAt: item.added_at,
    }));

  return NextResponse.json({
    list: {
      id: data.id,
      title: data.title,
      description: data.description ?? "",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      items,
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return unauthorized();
  const { id } = await params;

  const supabase = getSupabaseAdminOrNull();
  if (!supabase) return unavailable();
  const { error } = await supabase.from("lists").delete().eq("id", id).eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
