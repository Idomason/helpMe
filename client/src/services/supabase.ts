import { createClient, SupabaseClient } from "@supabase/supabase-js";

// const supabaseUrl = "https://zqsnjlmobmphrtvbtelh.supabase.co";
// const supabaseKey =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxc25qbG1vYm1waHJ0dmJ0ZWxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5MjEyNTYsImV4cCI6MjA0NzQ5NzI1Nn0.5EO_z9CCbpSEhyH68aJhkUoLd4AHq6yxLvlXBwcVADk";
// const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabase;
