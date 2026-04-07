import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const history = await prisma.generatedTrack.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to 50 most recent
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
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

    const { id } = (await request.json()) as { id: string };

    await prisma.generatedTrack.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete track" },
      { status: 500 }
    );
  }
}
