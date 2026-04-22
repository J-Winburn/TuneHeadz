import { getSupabaseAdmin } from "@/lib/supabase-admin";

type ActivityType = "saved" | "listed" | "rated";

export async function logActivity(input: {
  userId: string;
  type: ActivityType;
  title: string;
  subtitle: string;
}): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("activity_events").insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      subtitle: input.subtitle,
    });
  } catch {
    // Non-blocking best-effort logging
  }
}
