import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client (server-only — never expose the key to clients).
 * Returns null when the required env vars are missing.
 */
export function adminClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Resolve the authenticated Supabase user from a request's
 * `Authorization: Bearer <token>` header. Returns null if the header is
 * missing, the admin client is unconfigured, or the token is invalid.
 */
export async function getUserFromRequest(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;

  const admin = adminClient();
  if (!admin) return null;

  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}
