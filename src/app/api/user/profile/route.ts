import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";

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
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      bio: user.bio,
      timezone: user.timezone,
      theme: user.theme,
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

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: body.firstName || user.firstName,
        lastName: body.lastName || user.lastName,
        email: body.email || user.email,
        phone: body.phone || user.phone,
        bio: body.bio || user.bio,
        timezone: body.timezone || user.timezone,
        displayName: body.displayName || user.displayName,
      },
    });

    return NextResponse.json({
      id: updatedUser.id,
      spotifyId: updatedUser.spotifyId,
      displayName: updatedUser.displayName,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      profileImage: updatedUser.profileImage,
      bio: updatedUser.bio,
      timezone: updatedUser.timezone,
      theme: updatedUser.theme,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
