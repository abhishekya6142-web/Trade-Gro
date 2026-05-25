import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const userId = req.headers['x-user-id'] || req.body?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  await supabase.from('trades').delete().eq('user_id', userId);
  
  const { data, error } = await supabase
    .from('users')
    .update({ virtual_balance: 1000000, starting_balance: 1000000 })
    .eq('id', userId)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.status(200).json({ success: true, data });
}
