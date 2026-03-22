import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.storage.createBucket("my-bucket", { public: true });
  if (error) {
    console.error("Ошибка при создании bucket:", error.message);
    process.exit(1);
  }

  console.log("Bucket создан:", data?.name ?? "my-bucket");
}

void main();
