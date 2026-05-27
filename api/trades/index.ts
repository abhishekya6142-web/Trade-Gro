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
    const body = req.body ?? {};
    const symbol = body.symbol ?? '';
    const type = body.type ?? 'buy';
    const shares = Number(body.shares ?? 0);
    const price = Number(body.price ?? 0);
    const total_value = shares * price;

    if (!symbol || shares <= 0 || price <= 0) {
      return res.status(400).json({ error: 'Invalid trade data', body });
    }

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

    await supabase.from('users')
      .update({ virtual_balance: new_balance })
      .eq('id', userId);

    const { data: trade, error } = await supabase
      .from('trades')
      .insert({
        user_id: userId,
        symbol,
        stock_name: body.stock_name ?? symbol,
        type,
        shares,
        price,
        total_value,
        status: 'open',
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ success: true, trade, newBalance: new_balance, message: `${type === 'buy' ? 'Bought' : 'Sold'} ${shares} shares of ${symbol}` });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
