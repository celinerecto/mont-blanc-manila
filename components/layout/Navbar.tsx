"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-espresso text-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg">☕</span>
          <span className="font-playfair font-bold text-white text-base tracking-tight">Mont Blanc Manila</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/leaderboard" className="text-white/70 hover:text-white transition-colors text-sm">
            Leaderboard
          </Link>
          <Link href="/browse" className="text-white/70 hover:text-white transition-colors text-sm">
            Browse
          </Link>
          <Link href="/submit" className="text-white/70 hover:text-white transition-colors text-sm">
            Submit a Café
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <div className="space-y-1">
            <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-espresso px-4 py-4 space-y-3">
          <Link href="/leaderboard" className="block text-white/80 py-2 text-sm" onClick={() => setMenuOpen(false)}>Leaderboard</Link>
          <Link href="/browse" className="block text-white/80 py-2 text-sm" onClick={() => setMenuOpen(false)}>Browse</Link>
          <Link href="/submit" className="block text-white/80 py-2 text-sm" onClick={() => setMenuOpen(false)}>Submit a Café</Link>
        </div>
      )}
    </nav>
  );
}
