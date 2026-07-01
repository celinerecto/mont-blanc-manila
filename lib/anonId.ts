"use client";

// Generates a persistent anonymous ID stored in localStorage.
// Used as user_id for votes/reviews when not signed in.
export function getAnonId(): string {
  if (typeof window === "undefined") return "";
  const key = "mbm_anon_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}
