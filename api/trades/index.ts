import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const userId = req.headers['x-user-id'] || req.body?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ trades: data });
  }

  if (req.method === 'POST') {
    const { symbol, stock_name, type, shares, price, stop_loss, take_profit } = req.body;
    const total_value = shares * price;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('cash')
      .eq('id', userId)
      .single();

    if (userError || !user) return res.status(404).json({ error: 'User not found' });

    if (type === 'buy' && user.cash < total_value) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    const new_balance = type === 'buy'
      ? user.cash - total_value
      : user.cash + total_value;

    await supabase.from('users').update({ cash: new_balance }).eq('id', userId);

    const { data: trade, error } = await supabase
      .from('trades')
      .insert({
        user_id: userId,
        symbol,
        stock_name: stock_name ?? symbol,
        type,
        shares,
        price,
        total_value,
        stop_loss: stop_loss ?? null,
        take_profit: take_profit ?? null,
        status: 'open',
      })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(201).json({ success: true, trade, message: `${type === 'buy' ? 'Bought' : 'Sold'} ${shares} shares of ${symbol}`, newBalance: new_balance });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
