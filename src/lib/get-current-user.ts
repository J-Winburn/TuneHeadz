import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  // Primary auth path: TuneHeadz session via NextAuth.
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      // Credentials users: session.user.id is the database UUID.
      const userById = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      if (userById) return userById;

      // Legacy NextAuth Spotify users: session.user.id may be Spotify ID.
      const userBySpotifyId = await prisma.user.findUnique({
        where: { spotifyId: session.user.id },
      });
      if (userBySpotifyId) return userBySpotifyId;
    }
  } catch {
    // Continue to fallback lookup.
  }

  // Legacy fallback: custom Spotify cookie flow if there is no valid app session.
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_access_token")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const spotifyUser = (await response.json()) as { id: string };
    const user = await prisma.user.findUnique({
      where: { spotifyId: spotifyUser.id },
    });
    return user;
  } catch {
    return null;
  }
}
