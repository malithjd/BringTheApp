import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

function adminClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

router.delete('/delete', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const admin = adminClient();
  if (!admin) return res.status(503).json({ error: 'Service unavailable' });

  // Verify token and get user identity
  const { data: { user }, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

  // Archive before deletion
  await admin.from('deleted_accounts').insert({
    user_id: user.id,
    email: user.email,
    username: user.user_metadata?.username ?? null,
    metadata: { user_metadata: user.user_metadata },
  });

  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) return res.status(500).json({ error: 'Deletion failed' });

  res.json({ ok: true });
});

export default router;
