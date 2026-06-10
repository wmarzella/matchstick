/**
 * Supabase client — optional. The app runs fully on-device by default; set the
 * two EXPO_PUBLIC_SUPABASE_* env vars (see .env.example) to switch the store to
 * the multi-device Supabase backend with realtime signups and reveal.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(url as string, anonKey as string, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      realtime: { params: { eventsPerSecond: 5 } },
    })
  : null;
