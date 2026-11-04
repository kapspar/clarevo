import { createClient } from "npm:@supabase/supabase-js@2";
const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Content-Type": "application/json" };
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });
Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return json(405, { error: "Method not allowed" });
  const match = /^Bearer (.+)$/i.exec(request.headers.get("Authorization") || "");
  if (!match) return json(401, { error: "Sign in to delete your account." });
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return json(503, { error: "Account deletion is unavailable. Contact hello@clarevo.ca." });
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  // Verify the caller against Supabase Auth; never trust a user ID provided by the browser.
  const { data: { user }, error: userError } = await admin.auth.getUser(match[1]);
  if (userError || !user) return json(401, { error: "Your session has expired. Sign in again." });
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return json(400, { error: "Invalid request." }); }
  if (input.confirm !== "DELETE") return json(400, { error: "Type DELETE to confirm." });
  // Uploaded files are stored under the authenticated owner's UUID directory.
  // Enumerate every nested folder; do not use a client-supplied path or user ID.
  async function collect(prefix: string, depth = 0): Promise<string[]> {
    if (depth > 12) throw Error("Too many nested folders.");
    const files: string[] = [];
    let offset = 0;
    while (true) {
      const { data, error } = await admin.storage.from("documents").list(prefix, { limit: 100, offset, sortBy: { column: "name", order: "asc" } });
      if (error) throw error;
      const batch = data || [];
      for (const item of batch) {
        const full = prefix + "/" + item.name;
        if (item.id) files.push(full);
        else files.push(...await collect(full, depth + 1));
      }
      if (batch.length < 100) break;
      offset += 100;
    }
    return files;
  }
  try {
    const files = await collect(user.id);
    for (let index = 0; index < files.length; index += 100) {
      const { error } = await admin.storage.from("documents").remove(files.slice(index, index + 100));
      if (error) throw error;
    }
    if ((await collect(user.id)).length !== 0) throw Error("Document removal could not be verified.");
    // All user_id tables must be kept in sync with the schema. Auth FK cascades provide a fallback.
    const tables = ["assessments", "legal_documents", "account_items", "insurance_items", "property_items", "business_items", "bill_items", "contact_items", "emergency_settings", "digital_items", "kids_items"];
    for (const table of tables) {
      const { error } = await admin.from(table).delete().eq("user_id", user.id);
      if (error) throw error;
    }
    // Remove both invitations sent by the user and invitations to their old identity.
    for (const column of ["owner_id", "invitee_id"]) {
      const { error } = await admin.from("shared_access").delete().eq(column, user.id);
      if (error) throw error;
    }
    if (user.email) {
      const { error } = await admin.from("shared_access").delete().eq("invitee_email", user.email);
      if (error) throw error;
    }
    for (const column of ["id", "user_id"]) {
      const { error } = await admin.from("profiles").delete().eq(column, user.id);
      if (error) throw error;
    }
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;
    return json(200, { deleted: true });
  } catch (error) {
    // Never claim success on partial deletion. Operations can be retried, or support can
    // complete a request if an interrupted account deletion requires admin intervention.
    console.error("Account deletion failed", error instanceof Error ? error.message : "unknown");
    return json(500, { error: "We couldn't complete account deletion. Please contact hello@clarevo.ca for help. Do not assume your information was removed." });
  }
});