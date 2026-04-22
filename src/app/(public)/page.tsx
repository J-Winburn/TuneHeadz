import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { WelcomeHomeInitialUser } from "./welcome-home-client";
import WelcomeHomeShell from "./welcome-home-shell";

export default async function HomePage() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    session = null;
  }

  const initialUser: WelcomeHomeInitialUser = session?.user
    ? {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
      }
    : null;

  return (
    <WelcomeHomeShell
      initialAuthed={!!session?.user}
      initialUser={initialUser}
    />
  );
}
