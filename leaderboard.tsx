import { useState } from "react";
import { useGetLeaderboard, getGetLeaderboardQueryKey } from "@workspace/api-client-react";
import { GetLeaderboardPeriod } from "@workspace/api-client-react";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowUpRight, ArrowDownRight } from "lucide-react";

const PERIODS: { label: string; value: GetLeaderboardPeriod }[] = [
  { label: "Daily", value: GetLeaderboardPeriod.daily },
  { label: "Weekly", value: GetLeaderboardPeriod.weekly },
  { label: "Monthly", value: GetLeaderboardPeriod.monthly },
  { label: "All Time", value: GetLeaderboardPeriod.alltime },
];

const RANK_COLORS = ["text-yellow-400", "text-gray-300", "text-amber-600"];

export default function Leaderboard() {
  const [period, setPeriod] = useState<GetLeaderboardPeriod>(GetLeaderboardPeriod.alltime);

  const { data, isLoading } = useGetLeaderboard(
    { period },
    { query: { queryKey: getGetLeaderboardQueryKey({ period }) } }
  );

  const isPositive = (v: number) => v >= 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Trophy className="h-7 w-7 text-yellow-400" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">See how you stack up against other traders.</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl w-fit">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === p.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`period-tab-${p.value}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {data?.userRank && data.userRank > 0 && (
        <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 text-sm font-medium text-center">
          Your rank: <span className="text-primary font-bold">#{data.userRank}</span>
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-muted-foreground font-medium grid grid-cols-12 gap-2">
            <span className="col-span-1 text-center">#</span>
            <span className="col-span-5">Trader</span>
            <span className="col-span-3 text-right">Portfolio</span>
            <span className="col-span-3 text-right">P&L</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 pb-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))
          ) : data?.entries && data.entries.length > 0 ? (
            data.entries.map((entry, idx) => (
              <div
                key={entry.userId}
                className={`grid grid-cols-12 gap-2 items-center p-3 rounded-lg transition-colors ${
                  entry.isCurrentUser
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-secondary/30"
                }`}
                data-testid={`leaderboard-row-${entry.rank}`}
              >
                <div className="col-span-1 text-center">
                  {idx < 3 ? (
                    <Trophy className={`h-4 w-4 mx-auto ${RANK_COLORS[idx]}`} />
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">{entry.rank}</span>
                  )}
                </div>
                <div className="col-span-5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">
                      {entry.name}
                      {entry.isCurrentUser && (
                        <span className="ml-1 text-xs text-primary font-medium">(You)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="outline" className="text-xs px-1.5 py-0">Lvl {entry.level}</Badge>
                    {entry.badges.slice(0, 2).map((b) => (
                      <span key={b} className="text-xs text-muted-foreground truncate max-w-[60px]">{b}</span>
                    ))}
                  </div>
                </div>
                <div className="col-span-3 text-right">
                  <div className="text-sm font-semibold">{formatCurrency(entry.totalValue)}</div>
                  <div className="text-xs text-muted-foreground">{entry.totalTrades} trades</div>
                </div>
                <div className="col-span-3 text-right">
                  <div className={`text-sm font-semibold flex items-center justify-end ${isPositive(entry.totalPL) ? "text-green-500" : "text-red-500"}`}>
                    {isPositive(entry.totalPL) ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {formatPercent(entry.totalPLPercent)}
                  </div>
                  <div className={`text-xs ${isPositive(entry.totalPL) ? "text-green-500/70" : "text-red-500/70"}`}>
                    {formatCurrency(entry.totalPL, true)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">No data for this period.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
