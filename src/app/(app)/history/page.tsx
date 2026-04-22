"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface GeneratedTrack {
  id: string;
  prompt: string;
  duration: number;
  audioUrl: string;
  status: string;
  error: string | null;
  createdAt: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<GeneratedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/history");
        if (!response.ok) {
          throw new Error("Failed to fetch history");
        }
        const data = (await response.json()) as { history: GeneratedTrack[] };
        setHistory(data.history);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch("/api/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete track");
      }

      setHistory((prev) => prev.filter((track) => track.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete track");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="min-h-screen py-8">
      <div className="th-shell max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-5xl leading-none">Generation History</h1>
          <Link href="/generate" className="text-sm uppercase tracking-[0.1em] text-[#fb3d93] hover:text-[#ffc4e0]">
            ← Back to Generate
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-[#9ab0be]">Loading history...</p>
        ) : history.length === 0 ? (
          <div className="th-card p-8 text-center">
            <p className="text-[#9ab0be]">No generated tracks yet. Start creating!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((track) => (
              <div
                key={track.id}
                className="rounded-2xl border border-[#2c3440] bg-[#1c2128] p-5"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.09em] text-[#8ea5b4]">{formatDate(track.createdAt)}</p>
                    <p className="mt-1 text-lg">{track.prompt}</p>
                    <p className="mt-1 text-sm text-[#9ab0be]">Duration: {track.duration}s</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      track.status === "succeeded"
                        ? "bg-[#3a1327] text-[#ffd0e7]"
                        : track.status === "failed"
                          ? "bg-red-500/20 text-red-200"
                          : "bg-[#2c3440] text-[#d3dce3]"
                    }`}
                  >
                    {track.status}
                  </span>
                </div>

                {track.status === "succeeded" && track.audioUrl && (
                  <div className="mb-3 flex items-center gap-3">
                    <audio
                      controls
                      src={`/api/audio?url=${encodeURIComponent(track.audioUrl)}`}
                      className="flex-1"
                    />
                    <a
                      href={`/api/audio?url=${encodeURIComponent(track.audioUrl)}`}
                      download="generated-music.wav"
                      className="th-btn-secondary rounded-lg px-3 py-2 text-sm font-medium"
                    >
                      Download
                    </a>
                  </div>
                )}

                {track.error && (
                  <p className="mb-3 text-sm text-red-300">{track.error}</p>
                )}

                <button
                  onClick={() => handleDelete(track.id)}
                  className="rounded-lg border border-red-400/40 bg-red-500/15 px-3 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/25"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
