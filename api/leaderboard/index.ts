import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: any, res: any) {
  const userId = req.headers['x-user-id'];

  // Sabhi users fetch karo
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .limit(50);

  if (!users) return res.status(200).json({ entries: [], userRank: 0 });

  // Sabhi open buy trades ek saath fetch karo (N+1 avoid)
  const { data: allTrades } = await supabase
    .from('trades')
    .select('user_id, type, shares, total_value, status')
    .eq('status', 'open')
    .eq('type', 'buy');

  // Har user ki invested value calculate karo (buy price pe, not live)
  const investedMap: Record<string, number> = {};
  for (const trade of allTrades || []) {
    if (!investedMap[trade.user_id]) investedMap[trade.user_id] = 0;
    investedMap[trade.user_id] += parseFloat(trade.total_value);
  }

  // totalValue = cash balance + invested amount (buy price)
  const entries = (users || [])
    .map((user: any) => {
      const invested = investedMap[user.id] || 0;
      const totalValue = parseFloat(user.virtual_balance) + invested;
      const totalPL = totalValue - user.starting_balance;
      const totalPLPercent = (totalPL / user.starting_balance) * 100;

      return {
        rank: 0, // baad mein set hoga
        userId: user.id,
        name: user.name,
        totalValue: parseFloat(totalValue.toFixed(2)),
        totalPL: parseFloat(totalPL.toFixed(2)),
        totalPLPercent: parseFloat(totalPLPercent.toFixed(2)),
        totalTrades: user.total_trades || 0,
        winRate: user.win_rate || 0,
        level: user.level || 1,
        badges: user.badges || [],
        isCurrentUser: user.id === userId,
      };
    })
    .sort((a: any, b: any) => b.totalValue - a.totalValue)
    .map((entry: any, index: number) => ({ ...entry, rank: index + 1 }));

  const userRankEntry = entries.find((e: any) => e.isCurrentUser);
  const userRank = userRankEntry ? userRankEntry.rank : 0;

  return res.status(200).json({ entries, userRank });
}
