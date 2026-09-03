import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Env değişkenleri yoksa uygulama localStorage moduna düşer. */
export const isRemote = Boolean(url && anonKey);

export const supabase = isRemote
  ? createClient(url, anonKey, {
      // Giriş yok: oturum saklamaya, token yenilemeye gerek yok.
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
