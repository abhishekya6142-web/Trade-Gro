import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    await supabase.from('trades').delete().eq('user_id', userId);
    await supabase.from('users').update({
      cash: 1000000,
      portfolio_value: 1000000,
    }).eq('id', userId);

    res.status(200).json({ success: true, message: 'Account reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Reset failed' });
  }
}
