import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForTokens,
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_TOKEN_EXPIRY,
  COOKIE_STATE,
} from "@/lib/spotify-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing code or state parameter" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(COOKIE_STATE);

  if (!stateCookie || stateCookie.value !== state) {
    return NextResponse.json(
      { error: "State mismatch - possible CSRF attack" },
      { status: 400 }
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    // Fetch user profile from Spotify
    const userResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user profile from Spotify");
    }

    const spotifyUser = (await userResponse.json()) as {
      id: string;
      display_name?: string;
      email?: string;
      images?: Array<{ url: string }>;
    };

    const expiryTime = new Date(Date.now() + tokens.expires_in * 1000);

    // Create or update user in database
    await prisma.user.upsert({
      where: { spotifyId: spotifyUser.id },
      create: {
        spotifyId: spotifyUser.id,
        displayName: spotifyUser.display_name || null,
        email: spotifyUser.email || null,
        profileImage: spotifyUser.images?.[0]?.url || null,
        spotifyAccessToken: tokens.access_token,
        spotifyRefreshToken: tokens.refresh_token,
        spotifyTokenExpiresAt: expiryTime,
      },
      update: {
        displayName: spotifyUser.display_name || null,
        email: spotifyUser.email || null,
        profileImage: spotifyUser.images?.[0]?.url || null,
        spotifyAccessToken: tokens.access_token,
        spotifyRefreshToken: tokens.refresh_token,
        spotifyTokenExpiresAt: expiryTime,
      },
    });

    const response = NextResponse.redirect(new URL("/", request.url));

    cookieStore.set(COOKIE_ACCESS_TOKEN, tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expires_in,
    });

    cookieStore.set(COOKIE_REFRESH_TOKEN, tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    cookieStore.set(COOKIE_TOKEN_EXPIRY, expiryTime.getTime().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expires_in,
    });

    // Clear the state cookie
    cookieStore.delete(COOKIE_STATE);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Authentication failed: ${message}` },
      { status: 500 }
    );
  }
}
