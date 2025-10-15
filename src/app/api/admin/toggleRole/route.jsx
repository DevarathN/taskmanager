import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("users").select("*");
  if (error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  return new Response(JSON.stringify(data));
}

export async function POST(req) {
  const { userId, newRole } = await req.json();
  const { error } = await supabaseAdmin
    .from("users")
    .update({ role: newRole })
    .eq("id", userId);
  if (error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  return new Response(JSON.stringify({ success: true }));
}
