"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import LogoutModal from "./LogoutModal";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch {
        // Not logged in
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="transition hover:opacity-80">
            <img src="/assets/logo.png" alt="TuneHeadz" className="h-12 w-auto" />
          </Link>

          <nav className="flex items-center gap-6">
            {user && (
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
              </>
            )}

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-zinc-300">{user.displayName || user.spotifyId}</span>
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
                  <a
                    href="/api/auth/login"
                    className="rounded-full px-4 py-2 text-sm font-medium text-black transition"
                    style={{ backgroundColor: "#fb3d93" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e63a85")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fb3d93")}
                  >
                    Link to Spotify
                  </a>
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
