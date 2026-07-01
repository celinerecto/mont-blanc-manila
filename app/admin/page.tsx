import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminDashboard from "./AdminDashboard";

async function getPending() {
  const supabase = await createClient();

  const { data: cafes } = await supabase
    .from("cafes")
    .select("*, items(id, name, variant, price, description, photos(storage_url))")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, item:items(name, cafe:cafes(name, neighborhood))")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return { cafes: cafes ?? [], reviews: reviews ?? [] };
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (session !== process.env.ADMIN_PASSWORD) redirect("/admin/login");

  const { cafes, reviews } = await getPending();
  return <AdminDashboard pendingCafes={cafes} pendingReviews={reviews} />;
}
