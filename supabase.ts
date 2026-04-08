import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fygzsbzikxjqutddggkf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_XzxP9q8_igz3SZAae45eJQ_CJXu2DUP';

// Check if the URL is a placeholder or empty
const isPlaceholder = !supabaseUrl || 
                     supabaseUrl.includes('placeholder.supabase.co') || 
                     supabaseUrl.includes('your-project-id') ||
                     supabaseUrl === 'https://.supabase.co';

const isKeyPlaceholder = !supabaseAnonKey || 
                         supabaseAnonKey === 'your-anon-key' || 
                         supabaseAnonKey === 'placeholder' ||
                         supabaseAnonKey.length < 20;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && !isPlaceholder && !isKeyPlaceholder);

// Use a safe fallback URL for the client to prevent immediate crashes, 
// but we will guard all calls with isSupabaseConfigured.
const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://invalid-project-id.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'invalid-key'
);

export default supabase;