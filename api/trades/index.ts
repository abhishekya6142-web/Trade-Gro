import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: any, res: any) {
  const userId = req.headers['x-user-id'] || req.body?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ trades: data });
  }

  if (req.method === 'POST') {
    const { symbol, stock_name, type, shares, price, stop_loss, take_profit } = req.body;
    const total_value = shares * price;

    const { data: user } = await supabase
      .from('users')
      .select('virtual_balance')
      .eq('id', userId)
      .single();

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (type === 'buy' && user.virtual_balance < total_value) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const new_balance = type === 'buy' 
      ? user.virtual_balance - total_value 
      : user.virtual_balance + total_value;

    await supabase.from('users').update({ virtual_balance: new_balance }).eq('id', userId);

    const { data: trade, error } = await supabase
      .from('trades')
      .insert({ user_id: userId, symbol, stock_name, type, shares, price, total_value, stop_loss, take_profit, status: 'open' })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ success: true, trade, newBalance: new_balance });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
