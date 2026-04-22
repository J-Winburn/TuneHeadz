"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Pencil } from "lucide-react";

type ProfileUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  username?: string;
  displayName?: string;
  profileImage?: string;
  bannerImage?: string;
};

type ActivityEvent = {
  id: string;
  type: "saved" | "listed" | "rated";
  title: string;
  subtitle: string;
  timeAgo: string;
};

type FavoriteItem = {
  id: string;
  trackName: string;
  artists: string[];
  albumName?: string;
  imageUrl?: string;
};

type ListItem = {
  id: string;
  title: string;
  itemCount: number;
};

const LOCAL_PROFILE_KEY = "tuneheadz.localProfileDraft";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [activeTab, setActiveTab] = useState("Profile");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [lists, setLists] = useState<ListItem[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    const fetchProfile = async () => {
      const fallbackFromSession: ProfileUser = {
        firstName: session?.user?.name?.split(" ")[0] || "",
        lastName: session?.user?.name?.split(" ").slice(1).join(" ") || "",
        email: session?.user?.email || "",
        phone: "",
        bio: "",
        username: session?.user?.email?.split("@")[0] || "",
        displayName: session?.user?.name || session?.user?.email?.split("@")[0] || "User",
        profileImage: session?.user?.image || "",
        bannerImage: "",
      };

      setUser(fallbackFromSession);
      try {
        const raw = window.localStorage.getItem(LOCAL_PROFILE_KEY);
        if (raw) {
          const localProfile = JSON.parse(raw) as Partial<ProfileUser>;
          setUser((prev) => ({ ...(prev || {}), ...localProfile }));
        }
      } catch {
        // ignore bad local profile cache
      }

      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          let localProfile: Partial<ProfileUser> = {};
          try {
            const raw = window.localStorage.getItem(LOCAL_PROFILE_KEY);
            if (raw) localProfile = JSON.parse(raw) as Partial<ProfileUser>;
          } catch {
            // ignore bad local profile cache
          }
          setUser({ ...data, ...localProfile });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    (async () => {
      try {
        const [activityRes, favoritesRes, listsRes] = await Promise.all([
          fetch("/api/activity"),
          fetch("/api/favorites"),
          fetch("/api/lists"),
        ]);

        if (activityRes.ok) {
          const data = (await activityRes.json()) as { events?: ActivityEvent[] };
          setActivityEvents(data.events ?? []);
        }

        if (favoritesRes.ok) {
          const data = (await favoritesRes.json()) as { saved?: FavoriteItem[] };
          setFavorites(data.saved ?? []);
        }

        if (listsRes.ok) {
          const data = (await listsRes.json()) as { lists?: ListItem[] };
          setLists(data.lists ?? []);
        }
      } catch {
        // Keep empty states if fetch fails.
      }
    })();
  }, [status]);

  const tabs = ["Profile", "Activity", "Albums", "Journal", "Reviews", "Playlists", "Lists"];
  const covers = favorites.map((f) => f.imageUrl).filter(Boolean).slice(0, 4) as string[];
  const ratedEvents = activityEvents.filter((event) => event.type === "rated");
  const thisYearCount = activityEvents.length;

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.readAsDataURL(file);
    });

  const saveProfileImageChange = async (field: "profileImage" | "bannerImage", value: string) => {
    if (!user) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      const payload = {
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        displayName: user.displayName || "",
        profileImage: field === "profileImage" ? value : (user.profileImage || ""),
        bannerImage: field === "bannerImage" ? value : (user.bannerImage || ""),
      };
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Failed to save image.");
      }
      const updated = (await response.json()) as ProfileUser;
      const merged = { ...(user || {}), ...updated } as ProfileUser;
      setUser(merged);
      try {
        window.localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(merged));
      } catch {
        // ignore storage failures
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Failed to save image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload =
    (field: "profileImage" | "bannerImage") =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setUploadError("Please choose a valid image file.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("Image is too large. Please upload an image under 10MB.");
        return;
      }
      try {
        const dataUrl = await fileToDataUrl(file);
        await saveProfileImageChange(field, dataUrl);
      } catch {
        setUploadError("Could not process image.");
      } finally {
        input.value = "";
      }
    };

  if (!user) {
    return <main className="min-h-screen bg-[#0b1018]" />;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(251,61,147,0.14),transparent_32%),#07090f] pb-14 pt-10 text-[#dfe7f2]">
      <section className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="flex flex-col gap-8">
          <header className="group relative overflow-hidden rounded-xl border border-[#3a1f31] bg-[#0b0b10]">
            <div className="relative h-64 bg-[#120f17] md:h-72">
              <img
                src={user.bannerImage || "https://placehold.co/1400x320/17111f/f4d9e7?text=Profile+Banner"}
                alt="Profile banner"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-[#0b0b10]/95" />

              <label className="absolute right-3 top-3 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-black/50 text-white opacity-0 transition hover:border-[#fb3d93]/70 hover:text-[#ffd4e9] group-hover:opacity-100">
                <Pencil size={15} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload("bannerImage")}
                />
              </label>

              <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-5 md:px-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="flex items-end gap-4">
                    <div className="group relative">
                  <img
                    src={user.profileImage || "https://placehold.co/120x120/1f2a3a/dfe7f2?text=U"}
                    alt={user.displayName || "Profile image"}
                    className="h-28 w-28 rounded-full border-4 border-[#0b0b10] object-cover shadow-[0_0_0_2px_#4a2440]"
                  />
                  <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition hover:text-[#ffd4e9] group-hover:opacity-100">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#fb3d93]/60 bg-black/60">
                      <Pencil size={15} />
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload("profileImage")}
                    />
                  </label>
                    </div>
                    <div className="pb-2">
                      <p className="text-3xl font-semibold text-white">{user.displayName || "User"}</p>
                      <p className="mt-1 text-sm text-[#d2a3bb]">@{user.username || "username"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href="/profile/edit"
                      className="rounded-md border border-[#5d2b45] bg-[#291527]/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#f3d8e6] transition hover:border-[#fb3d93]/80 hover:text-white"
                    >
                      Edit Profile
                    </Link>
                    <Link
                      href="/"
                      className="rounded-md border border-[#4b3041] bg-[#140f16]/70 px-3 py-1 text-xs uppercase tracking-[0.12em] text-[#d2a3bb] hover:text-white"
                    >
                      Home
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {uploadError ? (
              <div className="mx-4 mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200 md:mx-6">
                {uploadError}
              </div>
            ) : null}
            {isUploading ? (
              <div className="mx-4 mb-4 text-xs text-[#9fb0c7] md:mx-6">Uploading image...</div>
            ) : null}
          </header>

          <div className="mx-auto grid w-full max-w-4xl grid-cols-3 gap-x-8 gap-y-2 border-b border-[#2a3344] pb-6 text-center md:grid-cols-5">
            <Stat label="ALBUMS" value={String(favorites.length)} />
            <Stat label="THIS YEAR" value={String(thisYearCount)} />
            <Stat label="LISTS" value={String(lists.length)} />
            <Stat label="FOLLOWING" value="0" />
            <Stat label="FOLLOWERS" value="0" />
          </div>

          <nav className="flex flex-wrap gap-x-5 gap-y-3 border-b border-[#2a3344] pb-3 text-sm text-[#9fb0c7]">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`transition hover:text-white ${tab === activeTab ? "border-b-2 border-[#fb3d93] pb-1 text-white" : ""}`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
            <section className="space-y-8">
              {activeTab === "Profile" ? (
                <>
                  <div>
                <h3 className="border-b border-[#2a3344] pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8ea1bb]">
                  Favorite Albums
                </h3>
                {favorites.length === 0 ? (
                  <p className="pt-3 text-sm text-[#9fb0c7]">
                    No favorites yet. Save albums/tracks and they will appear here.
                  </p>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {favorites.slice(0, 4).map((item) => (
                      <div key={item.id}>
                        <img
                          src={item.imageUrl || "https://placehold.co/240x240/101827/3a4a64?text=Album"}
                          alt={item.trackName}
                          className="aspect-square w-full rounded-md border border-[#2a3344] object-cover"
                        />
                        <p className="mt-1 truncate text-xs text-[#c3d1e3]">{item.trackName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="flex items-center justify-between border-b border-[#2a3344] pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8ea1bb]">
                  Recent Activity
                  <span className="text-[10px] tracking-[0.12em] text-[#7e94b2]">ALL</span>
                </h3>
                {covers.length === 0 ? (
                  <p className="pt-3 text-sm text-[#9fb0c7]">
                    No activity logged yet. Start saving or rating albums to build your feed.
                  </p>
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {covers.map((cover, idx) => (
                      <img
                        key={`${cover}-${idx}`}
                        src={cover}
                        alt={`Album cover ${idx + 1}`}
                        className="aspect-square w-full rounded-md border border-[#2a3344] object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
                </>
              ) : null}

              {activeTab === "Activity" ? (
                <div>
                  <h3 className="border-b border-[#2a3344] pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8ea1bb]">
                    Full Activity
                  </h3>
                  {activityEvents.length === 0 ? (
                    <p className="pt-3 text-sm text-[#9fb0c7]">No activity logged yet.</p>
                  ) : (
                    <ul className="space-y-3 pt-4 text-sm text-[#9fb0c7]">
                      {activityEvents.map((event) => (
                        <li key={event.id} className="rounded-md border border-[#253246] p-3">
                          <p className="font-medium text-[#dce6f5]">{event.title}</p>
                          <p className="text-xs">{event.subtitle}</p>
                          <p className="mt-1 text-[11px] text-[#7e94b2]">{event.timeAgo}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}

              {activeTab !== "Profile" && activeTab !== "Activity" ? (
                <div className="rounded-md border border-dashed border-[#2a3344] p-4 text-sm text-[#9fb0c7]">
                  {activeTab} content will populate as users log more music.
                </div>
              ) : null}

              {activeTab === "Profile" ? (
              <div>
                <h3 className="flex items-center justify-between border-b border-[#2a3344] pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8ea1bb]">
                  Popular Reviews
                  <span className="text-[10px] tracking-[0.12em] text-[#7e94b2]">MORE</span>
                </h3>
                {ratedEvents.length === 0 ? (
                  <p className="pt-3 text-sm text-[#9fb0c7]">
                    No reviews yet. Rated albums will appear here.
                  </p>
                ) : (
                  <div className="space-y-4 pt-4">
                    {ratedEvents.slice(0, 3).map((event) => (
                      <ReviewCard
                        key={event.id}
                        poster={favorites[0]?.imageUrl || "https://placehold.co/100x100/101827/3a4a64?text=%E2%99%AB"}
                        title={event.title}
                        year=""
                        rating="★★★★★"
                        watchedAt={event.timeAgo}
                        body={event.subtitle}
                        likes="1 like"
                      />
                    ))}
                  </div>
                )}
              </div>
              ) : null}

              {activeTab === "Profile" ? (
              <div>
                <h3 className="flex items-center justify-between border-b border-[#2a3344] pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8ea1bb]">
                  Following
                  <span className="text-[10px] tracking-[0.12em] text-[#7e94b2]">0</span>
                </h3>
                <p className="pt-3 text-sm text-[#9fb0c7]">
                  You are not following anyone yet.
                </p>
              </div>
              ) : null}
            </section>

            <aside className="space-y-6">
              <div>
                <h4 className="flex items-center justify-between border-b border-[#2a3344] pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#fb3d93]">
                  Ratings
                  <span className="text-[10px] tracking-[0.12em] text-[#7e94b2]">{ratedEvents.length}</span>
                </h4>
                {ratedEvents.length === 0 ? (
                  <p className="pt-3 text-xs text-[#9fb0c7]">No ratings logged yet.</p>
                ) : (
                  <div className="mt-3 flex items-end gap-1">
                    {[1, 2, 3, 4, 5].map((h, idx) => (
                      <div key={idx} className="w-4 rounded-sm bg-[#2f415f]" style={{ height: `${h * 6}px` }} />
                    ))}
                  </div>
                )}
              </div>
              <PosterStrip
                title="Recent Lists"
                subtitle={String(lists.length)}
                covers={[]}
              />
              <PosterStrip
                title="Favorites"
                subtitle={`${favorites.length} tracks`}
                covers={favorites.map((item) => item.imageUrl).filter(Boolean) as string[]}
              />
              <PosterStrip
                title="Top R&B Picks"
                subtitle="0 albums"
                covers={[]}
              />
              <div>
                <h4 className="border-b border-[#2a3344] pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#fb3d93]">
                  Activity
                </h4>
                {activityEvents.length === 0 ? (
                  <p className="pt-3 text-xs text-[#9fb0c7]">No activity yet.</p>
                ) : (
                  <ul className="mt-3 space-y-3 text-xs text-[#9fb0c7]">
                    {activityEvents.slice(0, 4).map((event) => (
                      <li key={event.id} className="border-l border-[#35507b] pl-3">
                        <span className="font-semibold text-[#dce6f5]">{event.title}</span> {event.timeAgo}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="text-[10px] font-semibold tracking-[0.14em] text-[#d2a3bb]">{label}</p>
    </div>
  );
}

function ReviewCard({
  poster,
  title,
  year,
  rating,
  watchedAt,
  body,
  likes,
}: {
  poster: string;
  title: string;
  year: string;
  rating: string;
  watchedAt: string;
  body: string;
  likes: string;
}) {
  return (
    <article className="border-b border-[#253246] pb-4">
      <div className="flex gap-3">
        <img src={poster} alt={title} className="h-24 w-16 rounded border border-[#2f3b50] object-cover" />
        <div className="min-w-0">
          <h4 className="text-2xl font-semibold leading-none text-white">
            {title} <span className="text-xl font-normal text-[#92a5bf]">{year}</span>
          </h4>
          <p className="mt-1 text-xs text-[#31d471]">
            {rating} <span className="ml-2 text-[#95a5ba]">{watchedAt}</span>
          </p>
          <p className="mt-2 text-sm text-[#d3deed]">{body}</p>
          <p className="mt-2 text-xs text-[#91a3bb]">{likes}</p>
        </div>
      </div>
    </article>
  );
}

function PosterStrip({
  title,
  subtitle,
  covers,
}: {
  title: string;
  subtitle: string;
  covers: string[];
}) {
  return (
    <div>
      <h4 className="flex items-center justify-between border-b border-[#2a3344] pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#fb3d93]">
        {title}
        <span className="text-[10px] tracking-[0.12em] text-[#7e94b2]">{subtitle}</span>
      </h4>
      <div className="mt-3 grid grid-cols-5 gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <img
            key={i}
            src={covers[i] || "https://placehold.co/90x90/101827/3a4a64?text=%20"}
            alt={`${title} cover ${i + 1}`}
            className="aspect-square w-full rounded-sm border border-[#2f3b50] object-cover"
          />
        ))}
      </div>
    </div>
  );
}
