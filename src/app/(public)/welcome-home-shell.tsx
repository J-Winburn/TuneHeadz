"use client";

import dynamic from "next/dynamic";
import type { WelcomeHomeInitialUser } from "./welcome-home-client";

const WelcomeHomeClient = dynamic(
  () => import("./welcome-home-client").then((mod) => mod.WelcomeHomeClient),
  {
    ssr: false,
    loading: () => (
      <main className="min-h-screen bg-[#000000] py-4 text-[#f1f5f8] md:py-5" />
    ),
  },
);

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
