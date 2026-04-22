"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ListMusic, Plus, Trash2 } from "lucide-react";
import {
  addItemToList,
  getList,
  removeItemFromList,
  type Listenlist,
} from "@/lib/lists";

export default function ListDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const listId = params?.id;

  const [list, setList] = useState<Listenlist | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");

  useEffect(() => {
    if (!listId) return;
    (async () => {
      try {
        setList(await getList(listId));
      } finally {
        setHydrated(true);
      }
    })();
  }, [listId]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!listId) return;
    if (!title.trim() || !artist.trim()) return;
    const created = await addItemToList(listId, {
      title: title.trim(),
      artist: artist.trim(),
    });
    if (created) {
      setList(await getList(listId));
      setTitle("");
      setArtist("");
      setShowForm(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    if (!listId) return;
    const ok = await removeItemFromList(listId, itemId);
    if (ok) setList(await getList(listId));
  };

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-black py-10 text-[#f1f5f8]">
        <section className="th-shell">
          <p className="text-sm text-[#6b7888]">Loading…</p>
        </section>
      </main>
    );
  }

  if (!list) {
    return (
      <main className="min-h-screen bg-black py-10 text-[#f1f5f8]">
        <section className="th-shell">
          <div className="mx-auto max-w-2xl rounded-2xl border border-[#2a2a34] bg-[#0f0f14] p-8 text-center">
            <h1 className="text-2xl font-semibold">List not found</h1>
            <p className="mt-2 text-sm text-[#9ab0be]">
              It may have been deleted, or it lives in another browser.
            </p>
            <button
              type="button"
              onClick={() => router.push("/lists")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-zinc-100"
            >
              <ArrowLeft size={16} /> Back to lists
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black py-10 text-[#f1f5f8]">
      <section className="th-shell">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/lists"
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#9ab0be] transition hover:text-white"
          >
            <ArrowLeft size={14} /> All lists
          </Link>

          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fb3d93]/15 text-[#fb3d93]">
              <ListMusic size={20} strokeWidth={2.2} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#fb3d93]">
                {list.items.length}{" "}
                {list.items.length === 1 ? "item" : "items"}
              </p>
              <h1 className="text-3xl font-semibold leading-tight">
                {list.title}
              </h1>
              {list.description ? (
                <p className="mt-2 text-sm text-[#9ab0be]">
                  {list.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#fb3d93] px-4 py-2 text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-md shadow-[#fb3d93]/25 transition hover:bg-[#ff5aa6]"
            >
              <Plus size={16} strokeWidth={2.4} />
              {showForm ? "Cancel" : "Add item"}
            </button>
          </div>

          {showForm ? (
            <form
              onSubmit={handleAdd}
              className="mb-6 grid gap-3 rounded-2xl border border-[#2a2a34] bg-[#0f0f14] p-5 sm:grid-cols-[1fr_1fr_auto]"
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Song or album"
                required
                className="rounded-lg border border-[#2a2a34] bg-[#15151d] px-3 py-2 text-white placeholder:text-[#5b6473] focus:border-[#fb3d93] focus:outline-none"
              />
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist"
                required
                className="rounded-lg border border-[#2a2a34] bg-[#15151d] px-3 py-2 text-white placeholder:text-[#5b6473] focus:border-[#fb3d93] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!title.trim() || !artist.trim()}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Add
              </button>
            </form>
          ) : null}

          {list.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#2a2a34] bg-[#0f0f14] px-6 py-12 text-center">
              <p className="text-sm text-[#9ab0be]">
                Nothing here yet. Add the first track to get going.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {list.items.map((item) => (
                <li
                  key={item.id}
                  className="group flex items-center justify-between rounded-xl border border-[#2a2a34] bg-[#0f0f14] px-4 py-3 transition hover:border-[#3a3a48] hover:bg-[#15151d]"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-[#9ab0be]">{item.artist}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    aria-label="Remove item"
                    className="rounded-md p-1.5 text-[#6b7888] opacity-0 transition hover:bg-[#2a2a34] hover:text-[#fb3d93] group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
