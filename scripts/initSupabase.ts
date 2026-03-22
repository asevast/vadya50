// Consolidated console.error to single line
console.error('Error: Something went wrong');

// Consolidated supabase.storage.createBucket to single line
const { data, error } = await supabase.storage.createBucket('my-bucket', { public: true });