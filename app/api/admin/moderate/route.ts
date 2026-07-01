import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isAuthed(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { table, id, action } = await req.json();
  if (!["cafes", "reviews"].includes(table)) return NextResponse.json({ error: "Bad table" }, { status: 400 });
  if (!["approved", "rejected"].includes(action)) return NextResponse.json({ error: "Bad action" }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase.from(table).update({ status: action }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
