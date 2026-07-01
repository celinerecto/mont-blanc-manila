"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-brown-border">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">☕</span>
          <span className="font-playfair font-bold text-espresso text-lg leading-tight">
            Mont Blanc<br />
            <span className="text-orange text-sm font-semibold tracking-widest uppercase">Manila</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/browse" className="text-brown hover:text-orange transition-colors duration-200 font-medium text-sm">
            Browse
          </Link>
          <Link href="/leaderboard" className="text-brown hover:text-orange transition-colors duration-200 font-medium text-sm">
            Leaderboard
          </Link>
          <Link href="/submit" className="text-brown hover:text-orange transition-colors duration-200 font-medium text-sm">
            Submit a Café
          </Link>
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-pale border border-brown-border flex items-center justify-center text-xs font-semibold text-orange">
                {(user.user_metadata?.full_name ?? user.email ?? "U")[0].toUpperCase()}
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-brown-muted hover:text-brown transition-colors duration-200"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="bg-orange text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-orange-hover transition-all duration-200 hover:scale-105"
            >
              Sign in with Google
            </button>
          )}
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
        <div className="md:hidden border-t border-brown-border bg-cream-surface px-4 py-4 space-y-3">
          <Link href="/browse" className="block text-brown font-medium py-2" onClick={() => setMenuOpen(false)}>Browse</Link>
          <Link href="/leaderboard" className="block text-brown font-medium py-2" onClick={() => setMenuOpen(false)}>Leaderboard</Link>
          <Link href="/submit" className="block text-brown font-medium py-2" onClick={() => setMenuOpen(false)}>Submit a Café</Link>
          <div className="pt-2 border-t border-brown-border">
            {user ? (
              <button onClick={handleSignOut} className="text-brown-muted text-sm">Sign out</button>
            ) : (
              <button onClick={handleSignIn} className="bg-orange text-white text-sm font-semibold px-5 py-2 rounded-full w-full">
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
