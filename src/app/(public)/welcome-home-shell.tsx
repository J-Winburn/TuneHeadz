"use client";

import type { WelcomeHomeInitialUser } from "./welcome-home-client";
import { WelcomeHomeClient } from "./welcome-home-client";

export default function WelcomeHomeShell({
  initialAuthed,
  initialUser,
}: {
  initialAuthed: boolean;
  initialUser: WelcomeHomeInitialUser;
}) {
  return (
    <WelcomeHomeClient
      initialAuthed={initialAuthed}
      initialUser={initialUser}
    />
  );
}
