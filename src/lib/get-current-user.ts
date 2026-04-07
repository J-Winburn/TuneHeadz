import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_access_token")?.value;

  if (!accessToken) {
    return null;
  }

  // Fetch user profile from Spotify to get ID
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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { spotifyId: spotifyUser.id },
    });

    return user;
  } catch {
    return null;
  }
}
