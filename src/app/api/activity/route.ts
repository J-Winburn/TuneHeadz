import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminOrNull } from "@/lib/supabase-admin";

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", events: [] }, { status: 401 });
  }

  const supabase = getSupabaseAdminOrNull();
  if (!supabase) {
    return NextResponse.json({ events: [] });
  }
  const { data, error } = await supabase
    .from("activity_events")
    .select("id,type,title,subtitle,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    return NextResponse.json({ error: error.message, events: [] }, { status: 500 });
  }

  return NextResponse.json({
    events:
      data?.map((row) => ({
        id: row.id,
        type: row.type,
        title: row.title,
        subtitle: row.subtitle,
        timeAgo: timeAgo(row.created_at),
      })) ?? [],
  });
}
