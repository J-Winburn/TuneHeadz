import Link from "next/link";

/** Default: Tune Headz embed (override with NEXT_PUBLIC_FIGMA_EMBED_URL in .env.local). */
const DEFAULT_FIGMA_EMBED =
  "https://embed.figma.com/design/7SYur77AEdCZCqoi42basB/Tune-Headz?node-id=0-1&embed-host=share";

export default function DesignPage() {
  const embedUrl =
    process.env.NEXT_PUBLIC_FIGMA_EMBED_URL?.trim() || DEFAULT_FIGMA_EMBED;

  return (
    <main className="min-h-screen bg-[#000000] px-4 py-8 text-[#f1f5f8]">
      <div className="th-shell flex max-w-6xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl tracking-tight md:text-4xl">Design (Figma)</h1>
          <Link
            href="/"
            className="text-sm uppercase tracking-[0.1em] text-[#fb3d93] hover:text-[#ffc4e0]"
          >
            ← Back home
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#2a2a34] bg-[#0f0f14] shadow-2xl">
          <iframe
            title="Tune Headz — Figma"
            src={embedUrl}
            className="aspect-[800/450] min-h-[450px] w-full border border-black/10 md:min-h-[600px]"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    </main>
  );
}
