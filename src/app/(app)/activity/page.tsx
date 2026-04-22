"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Music2, Heart, Star, ListMusic } from "lucide-react";
import { useSession } from "next-auth/react";

type ActivityItem = {
  id: string;
  type: "rated" | "saved" | "listed";
  title: string;
  subtitle: string;
  timeAgo: string;
};

function ActivityIcon({ type }: { type: ActivityItem["type"] }) {
  if (type === "rated") return <Star size={16} className="text-yellow-400" />;
  if (type === "saved") return <Heart size={16} className="text-[#fb3d93]" />;
  return <ListMusic size={16} className="text-[#7ed4fb]" />;
}

export default function ActivityPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const firstName =
    session?.user?.name?.trim().split(/\s+/)[0] ||
    session?.user?.email?.split("@")[0] ||
    "you";

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/activity");
        const data = (await res.json()) as { events?: ActivityItem[] };
        if (res.ok) setEvents(data.events ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-black py-10 text-[#f1f5f8]">
      <section className="th-shell">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fb3d93]/15 text-[#fb3d93]">
              <Music2 size={20} strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8ea5b4]">
                Activity
              </p>
              <h1 className="text-3xl font-semibold leading-tight">
                What {firstName} has been up to
              </h1>
            </div>
          </div>

          <ul className="space-y-3">
            {loading ? (
              <li className="rounded-2xl border border-[#2a2a34] bg-[#0f0f14] px-5 py-8 text-center text-sm text-[#9ab0be]">
                Loading activity…
              </li>
            ) : events.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-[#2a2a34] bg-[#0f0f14] px-5 py-8 text-center text-sm text-[#9ab0be]">
                No activity yet. Save tracks or update lists to populate this feed.
              </li>
            ) : (
              events.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-[#2a2a34] bg-[#0f0f14] px-5 py-4 transition hover:border-[#3a3a48] hover:bg-[#15151d]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2a2a34] bg-[#15151d]">
                    <ActivityIcon type={item.type} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-[#9ab0be]">{item.subtitle}</p>
                  </div>
                </div>
                <span className="text-xs uppercase tracking-[0.16em] text-[#6b7888]">
                  {item.timeAgo}
                </span>
              </li>
              ))
            )}
          </ul>

          <p className="mt-6 text-xs text-[#6b7888]">
            Showing recent activity — connect more services on{" "}
            <Link href="/profile" className="text-[#fb3d93] hover:underline">
              your profile
            </Link>{" "}
            to see more.
          </p>
        </div>
      </section>
    </main>
  );
}
