import Link from "next/link";

const links = [
  "About",
  "Pro",
  "News",
  "Apps",
  "Year in Review",
  "Video Store",
  "Gifts",
  "Help",
  "Terms",
  "API",
  "Contact",
];

export default function SiteFooter() {
  return (
    <footer className="th-site-footer mt-10 border-t border-[#2a2f3a] bg-[#2b3341] motion-safe:transition-[background,border-color] motion-safe:duration-500 motion-safe:ease-out motion-reduce:transition-none">
      <div className="th-shell py-7 text-[#a8b1bf]">
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold">
          {links.map((label) => (
            <Link
              key={label}
              href="#"
              className="transition hover:text-[#fb3d93]"
            >
              {label}
            </Link>
          ))}
        </nav>
        <p className="mt-3 text-xs text-[#8f99ab]">
          Copyright {new Date().getFullYear()} TuneHeadz. Built for social music discovery.
        </p>
      </div>
    </footer>
  );
}
