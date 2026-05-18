import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'open');

  if (!user) return res.status(404).json({ error: 'User not found' });

  const positions: any[] = [];
  const symbolMap: any = {};

  for (const trade of trades || []) {
    if (!symbolMap[trade.symbol]) {
      symbolMap[trade.symbol] = { shares: 0, totalCost: 0, stock_name: trade.stock_name };
    }
    if (trade.type === 'buy') {
      symbolMap[trade.symbol].shares += trade.shares;
      symbolMap[trade.symbol].totalCost += trade.total_value;
    } else {
      symbolMap[trade.symbol].shares -= trade.shares;
    }
  }

  let investedValue = 0;
  for (const [symbol, data] of Object.entries(symbolMap) as any) {
    if (data.shares > 0) {
      const avgBuyPrice = data.totalCost / data.shares;
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1d&range=1d`;
        const response = await fetch(url);
        const json = await response.json();
        const currentPrice = json?.chart?.result?.[0]?.meta?.regularMarketPrice || avgBuyPrice;
        const totalValue = data.shares * currentPrice;
        const pl = totalValue - data.totalCost;
        const plPercent = (pl / data.totalCost) * 100;
        investedValue += totalValue;
        positions.push({
          symbol,
          stockName: data.stock_name,
          shares: data.shares,
          avgBuyPrice,
          currentPrice,
          totalValue,
          totalCost: data.totalCost,
          pl: parseFloat(pl.toFixed(2)),
          plPercent: parseFloat(plPercent.toFixed(2)),
        });
      } catch {}
    }
  }

  const totalValue = user.virtual_balance + investedValue;
  const totalPL = totalValue - user.starting_balance;
  const totalPLPercent = (totalPL / user.starting_balance) * 100;

  return res.status(200).json({
    totalValue,
    cashBalance: user.virtual_balance,
    investedValue,
    totalPL: parseFloat(totalPL.toFixed(2)),
    totalPLPercent: parseFloat(totalPLPercent.toFixed(2)),
    dailyPL: 0,
    dailyPLPercent: 0,
    positions,
    monthlyData: [],
  });
            }
