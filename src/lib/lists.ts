export type ListItem = {
  id: string;
  title: string;
  artist: string;
  image?: string;
  addedAt: string;
};

export type Listenlist = {
  id: string;
  title: string;
  description: string;
  items: ListItem[];
  createdAt: string;
  updatedAt: string;
  itemCount?: number;
};

async function parseJson<T>(res: Response): Promise<T> {
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error((body as { error?: string }).error || "Request failed.");
  }
  return body;
}

export async function loadLists(): Promise<Listenlist[]> {
  const res = await fetch("/api/lists", { cache: "no-store" });
  const body = await parseJson<{ lists: Listenlist[] }>(res);
  return body.lists ?? [];
}

export async function createList(input: {
  title: string;
  description?: string;
}): Promise<Listenlist> {
  const res = await fetch("/api/lists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ list: Listenlist }>(res);
  return body.list;
}

export async function deleteList(id: string): Promise<void> {
  const res = await fetch(`/api/lists/${encodeURIComponent(id)}`, { method: "DELETE" });
  await parseJson<{ success: boolean }>(res);
}

export async function getList(id: string): Promise<Listenlist | null> {
  const res = await fetch(`/api/lists/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (res.status === 404) return null;
  const body = await parseJson<{ list: Listenlist }>(res);
  return body.list ?? null;
}

export async function addItemToList(
  listId: string,
  item: Omit<ListItem, "id" | "addedAt">,
): Promise<ListItem | null> {
  const res = await fetch(`/api/lists/${encodeURIComponent(listId)}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (res.status === 404) return null;
  const body = await parseJson<{ item: ListItem }>(res);
  return body.item ?? null;
}

export async function removeItemFromList(
  listId: string,
  itemId: string,
): Promise<boolean> {
  const res = await fetch(
    `/api/lists/${encodeURIComponent(listId)}/items?itemId=${encodeURIComponent(itemId)}`,
    { method: "DELETE" },
  );
  if (res.status === 404) return false;
  await parseJson<{ success: boolean }>(res);
  return true;
}
