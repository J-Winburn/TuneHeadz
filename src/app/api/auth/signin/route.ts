import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const COOKIE_SESSION_TOKEN = "th_session";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email: string;
      password: string;
    };

    // Validation
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check password
    if (!user.password) {
      return NextResponse.json(
        { error: "Please sign in with your Spotify account" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(body.password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session token (simplified - in production use JWT)
    const sessionToken = `${user.id}-${Date.now()}`;

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_SESSION_TOKEN, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Signed in successfully",
    });
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { error: "Failed to sign in" },
      { status: 500 }
    );
  }
}
