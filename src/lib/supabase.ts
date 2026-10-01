import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** true khi đã điền .env.local. Nếu false, ứng dụng chạy ở chế độ DEMO (dữ liệu trong trình duyệt). */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient(url as string, anonKey as string) : null;
