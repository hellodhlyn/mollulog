import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseSchema } from "./schema";

export interface Env {
  __STATIC_CONTENT: KVNamespace<string>;
  KV_USERDATA: KVNamespace;
  KV_STATIC_DATA: KVNamespace;

  HOST: string;
  STAGE: "dev" | "prod";

  SESSION_SECRET: string;
  GOOGLE_CLIENT_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
}

let _db: SupabaseClient<SupabaseSchema>;

export function getDB(env: Env) {
  if (_db) {
    return _db;
  }

  _db = createClient<SupabaseSchema>(env.SUPABASE_URL, env.SUPABASE_KEY);
  return _db;
}
