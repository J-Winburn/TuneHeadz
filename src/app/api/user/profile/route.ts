import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-current-user";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      spotifyId: user.spotifyId,
      displayName: user.displayName,
      email: user.email,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
