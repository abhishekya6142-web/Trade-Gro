import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Smart symbol resolver - .NS/.BO handle karta hai
async function fetchCurrentPrice(symbol: string, fallback: number): Promise<number> {
  const variants = symbol.includes('.')
    ? [symbol]
    : [`${symbol}.NS`, `${symbol}.BO`, symbol];

  for (const sym of variants) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`;
      const res = await fetch(url);
      const json = await res.json();
      const price = json?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price && price > 0) return price;
    } catch {}
  }
  return fallback;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!user) return res.status(404).json({ error: 'User not found' });

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'open');

  // Positions group karo symbol wise
  const symbolMap: any = {};
  for (const trade of trades || []) {
    if (!symbolMap[trade.symbol]) {
      symbolMap[trade.symbol] = {
        shares: 0,
        totalCost: 0,
        stock_name: trade.stock_name,
      };
    }
    if (trade.type === 'buy') {
      symbolMap[trade.symbol].shares += parseFloat(trade.shares);
      symbolMap[trade.symbol].totalCost += parseFloat(trade.total_value);
    } else {
      symbolMap[trade.symbol].shares -= parseFloat(trade.shares);
    }
  }

  const positions: any[] = [];
  let investedValue = 0;
  let previousDayValue = 0;

  // Parallel fetch - sabke prices ek saath fetch karo (fast!)
  await Promise.all(
    Object.entries(symbolMap).map(async ([symbol, data]: any) => {
      if (data.shares <= 0) return;

      const avgBuyPrice = data.totalCost / data.shares;
      const currentPrice = await fetchCurrentPrice(symbol, avgBuyPrice);

      const totalValue = data.shares * currentPrice;
      const pl = totalValue - data.totalCost;
      const plPercent = (pl / data.totalCost) * 100;

      // Daily P&L ke liye previous close fetch karo
      try {
        const sym = symbol.includes('.') ? symbol : `${symbol}.NS`;
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=5d`;
        const res = await fetch(url);
        const json = await res.json();
        const closes = json?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
        const prevClose = closes[closes.length - 2] || currentPrice;
        previousDayValue += data.shares * prevClose;
      } catch {
        previousDayValue += totalValue;
      }

      investedValue += totalValue;

      positions.push({
        id: symbol,
        symbol,
        stockName: data.stock_name,
        shares: data.shares,
        avgBuyPrice: parseFloat(avgBuyPrice.toFixed(2)),
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        totalValue: parseFloat(totalValue.toFixed(2)),
        totalCost: parseFloat(data.totalCost.toFixed(2)),
        pl: parseFloat(pl.toFixed(2)),
        plPercent: parseFloat(plPercent.toFixed(2)),
      });
    })
  );

  const totalValue = parseFloat(user.virtual_balance) + investedValue;
  const totalPL = totalValue - user.starting_balance;
  const totalPLPercent = (totalPL / user.starting_balance) * 100;

  // Daily P&L = aaj ki value - kal ki value
  const dailyPL = investedValue - previousDayValue;
  const dailyPLPercent = previousDayValue > 0
    ? (dailyPL / previousDayValue) * 100
    : 0;

  return res.status(200).json({
    totalValue: parseFloat(totalValue.toFixed(2)),
    cashBalance: parseFloat(user.virtual_balance),
    investedValue: parseFloat(investedValue.toFixed(2)),
    totalPL: parseFloat(totalPL.toFixed(2)),
    totalPLPercent: parseFloat(totalPLPercent.toFixed(2)),
    dailyPL: parseFloat(dailyPL.toFixed(2)),
    dailyPLPercent: parseFloat(dailyPLPercent.toFixed(2)),
    positions,
    monthlyData: [],
  });
}
