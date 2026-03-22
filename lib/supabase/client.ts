import { createClient } from "@supabase/supabase-js";

const getEnv = (key: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Отсутствует переменная окружения ${key}`);
  }
  return value;
};

const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
