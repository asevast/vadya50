import type { Database } from "@/types/supabase";
import { createClient } from "@supabase/supabase-js";

let кэшАдминКлиента: ReturnType<typeof createClient<Database>> | null = null;

const получитьПеременную = (key: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY") => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Отсутствует переменная окружения ${key}`);
  }
  return value;
};

export const получитьSupabaseAdmin = () => {
  if (кэшАдминКлиента) return кэшАдминКлиента;

  const supabaseUrl = получитьПеременную("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseServiceKey = получитьПеременную("SUPABASE_SERVICE_ROLE_KEY");

  кэшАдминКлиента = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return кэшАдминКлиента;
};
