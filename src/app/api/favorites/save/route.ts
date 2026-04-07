import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import type { Track } from "@/types/spotify";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = (await request.json()) as Track;

    const saved = await prisma.savedTrack.upsert({
      where: {
        userId_spotifyTrackId: {
          userId: user.id,
          spotifyTrackId: body.id,
        },
      },
      create: {
        userId: user.id,
        spotifyTrackId: body.id,
        trackName: body.name,
        artists: JSON.stringify(body.artists.map((a) => a.name)),
        albumName: body.album?.name || null,
        imageUrl: body.album?.images?.[0]?.url || null,
      },
      update: {
        trackName: body.name,
        artists: JSON.stringify(body.artists.map((a) => a.name)),
        albumName: body.album?.name || null,
        imageUrl: body.album?.images?.[0]?.url || null,
      },
    });

    return NextResponse.json({
      success: true,
      saved,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save track" },
      { status: 500 }
    );
  }
}
