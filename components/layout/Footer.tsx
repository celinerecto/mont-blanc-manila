import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-brown-border bg-cream-surface mt-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">☕</span>
          <span className="font-playfair font-semibold text-espresso">Mont Blanc Manila</span>
        </div>
        <nav className="flex gap-6 text-sm text-brown-muted">
          <Link href="/browse" className="hover:text-orange transition-colors">Browse</Link>
          <Link href="/leaderboard" className="hover:text-orange transition-colors">Leaderboard</Link>
          <Link href="/submit" className="hover:text-orange transition-colors">Submit a Café</Link>
        </nav>
        <p className="text-xs text-brown-muted">
          Made with ☕ in Manila · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
