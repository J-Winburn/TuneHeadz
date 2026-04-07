import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const saved = await prisma.savedTrack.findMany({
      where: { userId: user.id },
      orderBy: { savedAt: "desc" },
    });

    return NextResponse.json({ saved });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch saved tracks" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { spotifyTrackId } = (await request.json()) as {
      spotifyTrackId: string;
    };

    await prisma.savedTrack.delete({
      where: {
        userId_spotifyTrackId: {
          userId: user.id,
          spotifyTrackId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete saved track" },
      { status: 500 }
    );
  }
}
