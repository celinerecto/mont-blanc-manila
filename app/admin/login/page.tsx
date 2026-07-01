"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Wrong password.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="font-playfair text-2xl text-espresso mb-1">Admin</p>
        <p className="text-brown-muted text-sm mb-8">Mont Blancs of Manila</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoFocus
            className="w-full border border-brown-border rounded-xl px-4 py-3 text-sm text-espresso placeholder-brown-muted focus:outline-none focus:border-espresso transition-colors"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-espresso text-white py-3 rounded-xl text-sm font-semibold hover:bg-brown transition-colors disabled:opacity-60"
          >
            {loading ? "Checking..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
