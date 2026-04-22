import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminOrNull } from "@/lib/supabase-admin";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

type ProfilePayload = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  displayName: string;
  profileImage: string;
  bannerImage: string;
};

function buildFallbackProfile(sessionUser: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}): ProfilePayload {
  const fullName = sessionUser.name?.trim() || "";
  const parts = fullName.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ");

  return {
    username: sessionUser.email?.split("@")[0]?.toLowerCase() || "",
    firstName,
    lastName,
    email: sessionUser.email || "",
    phone: "",
    bio: "",
    displayName: fullName || sessionUser.email?.split("@")[0] || "User",
    profileImage: sessionUser.image || "",
    bannerImage: "",
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId || !session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fallback = buildFallbackProfile(session.user);
  const supabase = getSupabaseAdminOrNull() ?? (isSupabaseConfigured() ? getSupabase() : null);
  if (!supabase) {
    return NextResponse.json(fallback);
  }

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("username,first_name,last_name,email,phone,bio,display_name,profile_image,banner_image")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return NextResponse.json(fallback);
    }

    return NextResponse.json({
      username: data.username ?? fallback.username,
      firstName: data.first_name ?? fallback.firstName,
      lastName: data.last_name ?? fallback.lastName,
      email: data.email ?? fallback.email,
      phone: data.phone ?? fallback.phone,
      bio: data.bio ?? fallback.bio,
      displayName: data.display_name ?? fallback.displayName,
      profileImage: data.profile_image ?? fallback.profileImage,
      bannerImage: data.banner_image ?? fallback.bannerImage,
    });
  } catch {
    return NextResponse.json(fallback);
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId || !session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Partial<ProfilePayload>;
  const fallback = buildFallbackProfile(session.user);
  const payload: ProfilePayload = {
    username: (body.username ?? fallback.username).trim().toLowerCase(),
    firstName: (body.firstName ?? fallback.firstName).trim(),
    lastName: (body.lastName ?? fallback.lastName).trim(),
    email: (body.email ?? fallback.email).trim(),
    phone: (body.phone ?? "").trim(),
    bio: (body.bio ?? "").trim(),
    displayName: (body.displayName ?? body.firstName ?? fallback.displayName).trim(),
    profileImage: (body.profileImage ?? fallback.profileImage).trim(),
    bannerImage: (body.bannerImage ?? fallback.bannerImage).trim(),
  };

  const admin = getSupabaseAdminOrNull();
  const supabase = admin ?? (isSupabaseConfigured() ? getSupabase() : null);
  if (!supabase) {
    return NextResponse.json(payload);
  }

  try {
    if (payload.username && payload.username !== fallback.username) {
      const { data: existing } = await supabase
        .from("user_profiles")
        .select("user_id")
        .eq("username", payload.username)
        .neq("user_id", userId)
        .maybeSingle();
      if (existing?.user_id) {
        return NextResponse.json({ error: "Username is already taken." }, { status: 409 });
      }
    }

    const { error } = await supabase.from("user_profiles").upsert(
      {
        user_id: userId,
        username: payload.username || null,
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        phone: payload.phone || null,
        bio: payload.bio || null,
        display_name: payload.displayName,
        profile_image: payload.profileImage || null,
        banner_image: payload.bannerImage || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to persist profile changes." },
        { status: 500 },
      );
    }

    if (admin) {
      const { error: authUpdateError } = await admin.auth.admin.updateUserById(
        userId,
        {
          email: payload.email || undefined,
          user_metadata: {
            firstName: payload.firstName,
            lastName: payload.lastName,
            full_name: payload.displayName,
            username: payload.username,
            phone: payload.phone || null,
            profileImage: payload.profileImage || null,
            bannerImage: payload.bannerImage || null,
          },
        },
      );
      if (authUpdateError) {
        return NextResponse.json({ ...payload, warning: "Saved profile, but auth metadata sync failed." });
      }
    }

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(payload);
  }
}
