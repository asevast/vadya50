import { createClient } from "@supabase/supabase-js";

const getEnv = (key: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY") => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Отсутствует переменная окружения ${key}`);
  }
  return value;
};

const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseServiceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
