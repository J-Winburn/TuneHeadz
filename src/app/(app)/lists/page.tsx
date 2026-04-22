"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ListMusic, Plus, Trash2 } from "lucide-react";
import {
  createList,
  deleteList,
  loadLists,
  type Listenlist,
} from "@/lib/lists";

export default function ListsPage() {
  const [lists, setLists] = useState<Listenlist[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLists(await loadLists());
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    await createList({ title: trimmed, description });
    setLists(await loadLists());
    setTitle("");
    setDescription("");
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this list? This cannot be undone.")) return;
    await deleteList(id);
    setLists(await loadLists());
  };

  return (
    <main className="min-h-screen bg-black py-10 text-[#f1f5f8]">
      <section className="th-shell">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fb3d93]/15 text-[#fb3d93]">
                <ListMusic size={20} strokeWidth={2.2} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8ea5b4]">
                  Listenlists
                </p>
                <h1 className="text-3xl font-semibold leading-tight">
                  Your lists
                </h1>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#fb3d93] px-4 py-2 text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-md shadow-[#fb3d93]/25 transition hover:bg-[#ff5aa6]"
            >
              <Plus size={16} strokeWidth={2.4} />
              {showForm ? "Cancel" : "New list"}
            </button>
          </div>

          {showForm ? (
            <form
              onSubmit={handleCreate}
              className="mb-8 rounded-2xl border border-[#2a2a34] bg-[#0f0f14] p-5"
            >
              <label className="mb-3 block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#8ea5b4]">
                  Title
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={80}
                  placeholder="e.g. Late-night drives"
                  className="w-full rounded-lg border border-[#2a2a34] bg-[#15151d] px-3 py-2 text-white placeholder:text-[#5b6473] focus:border-[#fb3d93] focus:outline-none"
                />
              </label>
              <label className="mb-4 block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#8ea5b4]">
                  Description (optional)
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={240}
                  placeholder="What's this list about?"
                  className="w-full resize-none rounded-lg border border-[#2a2a34] bg-[#15151d] px-3 py-2 text-white placeholder:text-[#5b6473] focus:border-[#fb3d93] focus:outline-none"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-[#2a2a34] px-4 py-2 text-sm text-[#9ab0be] transition hover:border-[#3a3a48] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Create list
                </button>
              </div>
            </form>
          ) : null}

          {!hydrated ? (
            <p className="text-sm text-[#6b7888]">Loading…</p>
          ) : lists.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#2a2a34] bg-[#0f0f14] px-6 py-12 text-center">
              <p className="text-base text-[#9ab0be]">
                No lists yet. Make one to start building your listenlist.
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#fb3d93] px-4 py-2 text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-md shadow-[#fb3d93]/25 transition hover:bg-[#ff5aa6]"
              >
                <Plus size={16} strokeWidth={2.4} />
                Create your first list
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lists.map((list) => (
                <li
                  key={list.id}
                  className="group relative rounded-2xl border border-[#2a2a34] bg-[#0f0f14] p-5 transition hover:border-[#3a3a48] hover:bg-[#15151d]"
                >
                  <Link href={`/lists/${list.id}`} className="block">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#fb3d93]">
                      {(list.itemCount ?? list.items.length)}{" "}
                      {(list.itemCount ?? list.items.length) === 1 ? "item" : "items"}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-white">
                      {list.title}
                    </h2>
                    {list.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-[#9ab0be]">
                        {list.description}
                      </p>
                    ) : null}
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(list.id)}
                    aria-label="Delete list"
                    className="absolute right-3 top-3 rounded-md p-1.5 text-[#6b7888] opacity-0 transition hover:bg-[#2a2a34] hover:text-[#fb3d93] group-hover:opacity-100"
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
