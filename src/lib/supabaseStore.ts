import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const TABLE = "atulyaswar_kv";

function getUrl(): string {
  return (
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    ""
  ).trim();
}

function getServiceKey(): string {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
}

export function hasSupabaseConfig(): boolean {
  const rawUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const url = rawUrl.trim();
  const key = rawKey.trim();
  if (!url || !key) return false;
  if (/\s/.test(rawUrl) || /\s/.test(rawKey)) return false;
  return (
    url.startsWith("https://") ||
    url.startsWith("http://127.0.0.1") ||
    url.startsWith("http://localhost")
  );
}

let client: SupabaseClient | null = null;

function getAdminClient(): SupabaseClient {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase is not configured.");
  }
  if (!client) {
    client = createClient(getUrl(), getServiceKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export async function supabaseReadJson<T>(key: string): Promise<T | null> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data?.value) {
    return null;
  }
  return data.value as T;
}

export async function supabaseWriteJson(key: string, value: unknown): Promise<void> {
  const supabase = getAdminClient();
  const { error } = await supabase.from(TABLE).upsert(
    {
      key,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) {
    throw error;
  }
}
