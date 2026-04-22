import type { LucideIcon } from "lucide-react";

export type GenreCard = {
  slug: string;
  title: string;
  gradient: string;
  query: string;
};

export const GENRE_CARDS: GenreCard[] = [
  { slug: "pop", title: "Pop", gradient: "from-pink-600 to-fuchsia-500", query: "pop" },
  { slug: "hip-hop", title: "Hip-Hop", gradient: "from-sky-700 to-cyan-500", query: "hip hop" },
  { slug: "country", title: "Country", gradient: "from-orange-700 to-amber-500", query: "country" },
  { slug: "r-b", title: "R&B", gradient: "from-purple-700 to-indigo-500", query: "r&b" },
  { slug: "rock", title: "Rock", gradient: "from-zinc-700 to-slate-500", query: "rock" },
  { slug: "indie", title: "Indie", gradient: "from-emerald-700 to-teal-500", query: "indie" },
  { slug: "electronic", title: "Electronic", gradient: "from-violet-700 to-purple-500", query: "electronic" },
  { slug: "latin", title: "Latin", gradient: "from-rose-700 to-red-500", query: "latin" },
  { slug: "jazz", title: "Jazz", gradient: "from-blue-800 to-indigo-600", query: "jazz" },
  { slug: "afrobeats", title: "Afrobeats", gradient: "from-lime-700 to-green-500", query: "afrobeats" },
  { slug: "k-pop", title: "K-Pop", gradient: "from-fuchsia-700 to-pink-500", query: "k-pop" },
  { slug: "new-releases", title: "New Releases", gradient: "from-orange-700 to-red-500", query: "new music friday" },
];

export function findGenreBySlug(slug: string): GenreCard | undefined {
  return GENRE_CARDS.find((g) => g.slug === slug);
}
