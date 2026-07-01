"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "The Leaderboard", href: "#leaderboard" },
  { label: "What is a Mont Blanc?", href: "#about" },
  { label: "Find a Mont Blanc near me", href: "#browse" },
  { label: "Submit a Café", href: "/submit" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (href: string) => {
    setMenuOpen(false);
    if (href.startsWith("#")) {
      const el = document.getElementById(href.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-espresso text-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 flex-none">
          <span className="text-base">☕</span>
          <span className="font-playfair font-bold text-white text-sm tracking-tight">Mont Blancs of Manila</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) =>
            item.href.startsWith("#") ? (
              <button
                key={item.href}
                onClick={() => handleNav(item.href)}
                className="text-white/70 hover:text-white transition-colors text-xs"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/70 hover:text-white transition-colors text-xs"
              >
                {item.label}
              </Link>
            )
          )}
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
        <div className="md:hidden border-t border-white/10 bg-espresso px-4 py-4 space-y-1">
          {NAV_ITEMS.map((item) =>
            item.href.startsWith("#") ? (
              <button
                key={item.href}
                onClick={() => handleNav(item.href)}
                className="block w-full text-left text-white/80 py-2.5 text-sm border-b border-white/10 last:border-0"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="block text-white/80 py-2.5 text-sm border-b border-white/10 last:border-0"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  );
}
