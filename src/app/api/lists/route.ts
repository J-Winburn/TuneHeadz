import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminOrNull } from "@/lib/supabase-admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function unavailable() {
  return NextResponse.json({ error: "Lists are not configured yet.", lists: [] }, { status: 503 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return unauthorized();

  const supabase = getSupabaseAdminOrNull();
  if (!supabase) return unavailable();
  const { data, error } = await supabase
    .from("lists")
    .select("id,title,description,created_at,updated_at,list_items(id)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const lists =
    data?.map((list) => ({
      id: list.id,
      title: list.title,
      description: list.description ?? "",
      createdAt: list.created_at,
      updatedAt: list.updated_at,
      itemCount: list.list_items?.length ?? 0,
    })) ?? [];

  return NextResponse.json({ lists });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return unauthorized();

  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    description?: string;
  };
  const title = (body.title ?? "").trim();
  const description = (body.description ?? "").trim();

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const supabase = getSupabaseAdminOrNull();
  if (!supabase) return unavailable();
  const { data, error } = await supabase
    .from("lists")
    .insert({ user_id: userId, title, description })
    .select("id,title,description,created_at,updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    list: {
      id: data.id,
      title: data.title,
      description: data.description ?? "",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      itemCount: 0,
    },
  });
}
