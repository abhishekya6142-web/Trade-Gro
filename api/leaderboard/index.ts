import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: any, res: any) {
  const userId = req.headers['x-user-id'];

  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('virtual_balance', { ascending: false })
    .limit(50);

  const entries = (users || []).map((user: any, index: number) => ({
    rank: index + 1,
    userId: user.id,
    name: user.name,
    totalValue: user.virtual_balance,
    totalPL: user.virtual_balance - user.starting_balance,
    totalPLPercent: ((user.virtual_balance - user.starting_balance) / user.starting_balance) * 100,
    totalTrades: user.total_trades || 0,
    winRate: user.win_rate || 0,
    level: user.level || 1,
    badges: user.badges || [],
    isCurrentUser: user.id === userId,
  }));

  const userRank = entries.findIndex((e: any) => e.isCurrentUser) + 1;

  return res.status(200).json({ entries, userRank });
}
