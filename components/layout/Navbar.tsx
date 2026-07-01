"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-brown-border">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">☕</span>
          <span className="font-playfair font-bold text-espresso text-lg leading-tight">
            Mont Blanc<br />
            <span className="text-orange text-sm font-semibold tracking-widest uppercase">Manila</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/leaderboard" className="text-brown hover:text-orange transition-colors duration-200 font-medium text-sm">
            Leaderboard
          </Link>
          <Link href="/browse" className="text-brown hover:text-orange transition-colors duration-200 font-medium text-sm">
            Browse
          </Link>
          <Link href="/submit" className="text-brown hover:text-orange transition-colors duration-200 font-medium text-sm">
            Submit a Café
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-brown"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <div className="space-y-1">
            <span className={`block w-5 h-0.5 bg-espresso transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`block w-5 h-0.5 bg-espresso transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-espresso transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-brown-border bg-white px-4 py-4 space-y-3">
          <Link href="/leaderboard" className="block text-brown font-medium py-2" onClick={() => setMenuOpen(false)}>Leaderboard</Link>
          <Link href="/browse" className="block text-brown font-medium py-2" onClick={() => setMenuOpen(false)}>Browse</Link>
          <Link href="/submit" className="block text-brown font-medium py-2" onClick={() => setMenuOpen(false)}>Submit a Café</Link>
        </div>
      )}
    </nav>
  );
}
