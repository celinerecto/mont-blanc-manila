import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-brown-border bg-espresso text-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">☕</span>
          <span className="font-playfair font-semibold text-white">Mont Blanc Manila</span>
        </div>
        <nav className="flex gap-6 text-sm text-white/60">
          <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
          <Link href="/browse" className="hover:text-white transition-colors">Browse</Link>
          <Link href="/submit" className="hover:text-white transition-colors">Submit a Café</Link>
        </nav>
        <p className="text-xs text-white/40">Manila · {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
