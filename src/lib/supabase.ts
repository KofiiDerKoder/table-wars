/**
 * TABLE WARS! - Supabase Client
 * 
 * Initializes the Supabase client for database interactions and real-time syncing.
 * 
 * Last Updated: May 13, 2026
 */

import { createClient } from '@supabase/supabase-js';
...

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
