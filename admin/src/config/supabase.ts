import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables. Check .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const STORAGE_BUCKET = 'studio-images';

export function getStudioImageUrl(studioId: string, type: 'logo' | 'cover'): string {
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${studioId}/${type}.png`;
}

export { STORAGE_BUCKET };
