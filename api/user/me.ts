import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const userId = req.headers['x-user-id'] || req.query.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json(data);
  }

  if (req.method === 'PATCH') {
    const { data, error } = await supabase
      .from('users')
      .update(req.body)
      .eq('id', userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
