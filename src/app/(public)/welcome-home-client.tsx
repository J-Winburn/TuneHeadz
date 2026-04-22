"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { AlbumHeroCarousel } from "@/components/AlbumHeroCarousel";
import { Button } from "@/components/ui/button";
import WeeklyRecommendations from "@/components/WeeklyRecommendations";
import LiveSpotifySearch from "@/components/LiveSpotifySearch";

export type WelcomeHomeInitialUser = {
  name: string | null;
  email: string | null;
} | null;

export function WelcomeHomeClient({
  initialAuthed,
  initialUser,
}: {
  initialAuthed: boolean;
  initialUser: WelcomeHomeInitialUser;
}) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthed = mounted ? !!session?.user : false;

  const user = mounted ? session?.user : undefined;
  const firstName =
    user?.name?.trim().split(/\s+/)[0] ||
    user?.email?.split("@")[0] ||
    "there";

  const [timeGreeting, setTimeGreeting] = useState<string | null>(null);
  useEffect(() => {
    const h = new Date().getHours();
    setTimeGreeting(
      h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening",
    );
  }, []);

  return (
    <main
      suppressHydrationWarning
      className="min-h-screen bg-[#000000] py-4 text-[#f1f5f8] md:py-5"
    >
      <section className="w-full">
        <div className="bg-[#0f0f14] p-0">
          <div className="relative overflow-hidden bg-gradient-to-b from-[#151524] via-[#10101a] to-[#0b0b11]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(251,61,147,0.22),transparent_40%),radial-gradient(circle_at_78%_15%,rgba(251,61,147,0.17),transparent_35%)]" />

            <div className="pt-2 md:pt-3">
              <AlbumHeroCarousel />
            </div>

            <div className="relative px-6 pb-10 pt-4 text-center md:px-10 md:pt-6">
              {isAuthed ? (
                <>
                  <h1 className="mx-auto max-w-4xl">
                    <span className="block text-[1.9rem] font-semibold leading-tight tracking-tight text-white md:text-[3.2rem]">
                      {`${timeGreeting ?? "Welcome back"}, ${firstName}`}
                    </span>
                  </h1>

                  <div className="mx-auto mt-8 w-full max-w-2xl text-left">
                    <LiveSpotifySearch
                      placeholder="What will you listen to today?"
                      variant="hero"
                    />
                  </div>

                  <div className="mt-7 flex justify-center">
                    <Button
                      asChild
                      size="lg"
                      className="group min-w-[240px] rounded-xl border-0 bg-white text-sm font-semibold uppercase tracking-[0.09em] !text-neutral-950 shadow-lg shadow-black/20 hover:bg-zinc-100 hover:!text-neutral-950"
                    >
                      <Link href="/search">
                        Explore Music
                        <ArrowRight
                          className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5"
                          size={16}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="mx-auto max-w-4xl">
                    <span className="block text-2xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
                      Rate albums and songs you actually care about.
                    </span>
                    <span className="mt-6 block text-5xl leading-[0.95] md:text-7xl">
                      Track songs you love.
                      <br />
                      Save what you want to hear.
                      <br />
                      Share what&apos;s actually good.
                    </span>
                  </h1>
                  <p className="mx-auto mt-4 max-w-xl text-sm text-[#a8b6c7] md:text-base">
                    Keep the social music experience you already have, but in a
                    more cinematic layout.
                  </p>
                  <div className="mt-7 flex justify-center">
                    <Button
                      asChild
                      size="lg"
                      className="group min-w-[240px] rounded-xl border-0 bg-white text-sm font-semibold uppercase tracking-[0.09em] !text-neutral-950 shadow-lg shadow-black/20 hover:bg-zinc-100 hover:!text-neutral-950"
                    >
                      <Link href="/search">
                        Get Started — It&apos;s Free
                        <ArrowRight
                          className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5"
                          size={16}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
            {isAuthed ? (
              <div className="px-4 pb-5 md:px-6 md:pb-6">
                <WeeklyRecommendations />
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
