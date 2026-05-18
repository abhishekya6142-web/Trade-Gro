import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, name, email } = req.body;

  if (!id || !name) {
    return res.status(400).json({ error: 'id and name are required' });
  }

  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (existing) {
    return res.status(200).json(existing);
  }

  const { data, error } = await supabase
    .from('users')
    .insert({ id, name, email, virtual_balance: 1000000, starting_balance: 1000000 })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json(data);
}
