import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create the Supabase client with fallback values for build time
export const supabase = createClient(
  supabaseUrl || 'https://dummy.supabase.co',
  supabaseAnonKey || 'dummy-anon-key'
);

// Log warning if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables not found. Please check your .env.local file.'
  );
}

export default supabase;