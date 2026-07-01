"use client";

import Link from "next/link";

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function Footer() {
  return (
    <footer className="border-t border-brown-border bg-espresso text-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="font-playfair font-semibold text-white text-sm">Mont Blancs of Manila</p>
          <p className="text-white/40 text-xs mt-0.5">Manila · {new Date().getFullYear()}</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/60">
          <button onClick={() => scrollTo("leaderboard")} className="hover:text-white transition-colors text-left">The Leaderboard</button>
          <button onClick={() => scrollTo("about")} className="hover:text-white transition-colors text-left">What is a Mont Blanc?</button>
          <button onClick={() => scrollTo("browse")} className="hover:text-white transition-colors text-left">Find near me</button>
          <Link href="/submit" className="hover:text-white transition-colors">Submit a Café</Link>
        </nav>
      </div>
    </footer>
  );
}
