"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import LogoutModal from "./LogoutModal";

export default function Header() {
  const { data: session, status } = useSession();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const loading = status === "loading";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="transition hover:opacity-80">
            <img src="/assets/logo.png" alt="TuneHeadz" className="h-12 w-auto" />
          </Link>

          <nav className="flex items-center gap-6">
            {session?.user && (
              <>
                <Link
                  href="/favorites"
                  className="text-sm text-zinc-400 hover:text-zinc-200 transition"
                >
                  Favorites
                </Link>
                <Link
                  href="/history"
                  className="text-sm text-zinc-400 hover:text-zinc-200 transition"
                >
                  History
                </Link>
                <Link
                  href="/generate"
                  className="text-sm text-zinc-400 hover:text-zinc-200 transition"
                >
                  Generate
                </Link>
                <Link
                  href="/profile"
                  className="text-sm text-zinc-400 hover:text-zinc-200 transition"
                >
                  Profile
                </Link>
              </>
            )}

            {!loading && (
              <>
                {session?.user ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-zinc-300">{session.user.name || session.user.email}</span>
                    <button
                      onClick={() => setLogoutModalOpen(true)}
                      className="rounded-full px-4 py-2 text-sm font-medium text-black transition"
                      style={{ backgroundColor: "#fb3d93" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e63a85")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fb3d93")}
                    >
                      Log out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/signin"
                    className="rounded-full px-4 py-2 text-sm font-medium text-black transition"
                    style={{ backgroundColor: "#fb3d93" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e63a85")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fb3d93")}
                  >
                    Link to Spotify
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      <LogoutModal isOpen={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} />
    </>
  );
}
