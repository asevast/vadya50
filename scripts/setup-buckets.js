import { readFile } from "fs/promises";
import { createClient } from "@supabase/supabase-js";

async function loadEnv() {
  try {
    const content = await readFile(".env.local", "utf-8");
    const lines = content.split("\n");
    for (const line of lines) {
      if (line.trim() && !line.startsWith("#") && line.includes("=")) {
        const [key, ...valueParts] = line.split("=");
        const value = valueParts.join("=").trim();
        if (key && value) {
          process.env[key.trim()] = value;
        }
      }
    }
    console.log("✅ Loaded environment from .env.local");
  } catch (err) {
    console.error("❌ Failed to load .env.local:", err);
    process.exit(1);
  }
}

await loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

console.log("🔧 Connecting to Supabase...");
const supabase = createClient(supabaseUrl, supabaseKey);

const buckets = [{
  name: "congratulations-audio",
  options: { public: true, fileSizeLimit: 50 * 1024 * 1024, allowedMimeTypes: ["audio/webm", "audio/mp3", "audio/ogg"] },
},{
  name: "congratulations-video",
  options: { public: true, fileSizeLimit: 50 * 1024 * 1024, allowedMimeTypes: ["video/webm", "video/mp4"] },
}];

async function createBuckets() {
  for (const bucket of buckets) {
    console.log(`📦 Creating bucket: ${bucket.name}...`);
    const { data, error } = await supabase.storage.createBucket(bucket.name, bucket.options);
    if (error) {
      if (error.message.includes("already exists")) {
        console.log(`   ✓ Bucket "${bucket.name}" already exists`);
      } else {
        console.error(`   ✗ Error creating bucket ${bucket.name}:`, error.message);
      }
    } else {
      console.log(`   ✓ Bucket "${bucket.name}" created successfully`);
    }
  }
  console.log("\n✅ Bucket setup complete!");
  console.log("You can now restart the dev server and test the app!");
}
createBuckets().catch(console.error);