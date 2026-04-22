import type { AlbumSource } from "@/lib/albums/detail";

export type AlbumCard = {
  id: string;
  name: string;
  artist: string;
  image: string;
  source: AlbumSource;
};
