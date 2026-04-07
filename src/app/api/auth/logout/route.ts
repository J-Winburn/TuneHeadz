import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_TOKEN_EXPIRY,
} from "@/lib/spotify-auth";

export async function GET() {
  const response = NextResponse.redirect(new URL("/landing", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_ACCESS_TOKEN);
  cookieStore.delete(COOKIE_REFRESH_TOKEN);
  cookieStore.delete(COOKIE_TOKEN_EXPIRY);

  return response;
}

export async function POST() {
  const response = NextResponse.json({ success: true });
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_ACCESS_TOKEN);
  cookieStore.delete(COOKIE_REFRESH_TOKEN);
  cookieStore.delete(COOKIE_TOKEN_EXPIRY);

  return response;
}
