import { useGetPortfolio, useGetTrades } from "@workspace/api-client-react";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Briefcase } from "lucide-react";
import { Link } from "wouter";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function Portfolio() {
  const { data: portfolio, isLoading: portLoading } = useGetPortfolio();
  const { data: tradesData, isLoading: tradesLoading } = useGetTrades({ limit: 50 });

  const isPositive = (v: number) => v >= 0;

  const chartData = portfolio?.monthlyData?.map((m) => ({
    month: m.month,
    value: m.value,
    pl: m.pl,
  })) ?? [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Portfolio</h1>
        <p className="text-muted-foreground">Track your positions, P&L, and trade history.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {portLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Total Value</div>
                <div className="text-xl font-bold">{formatCurrency(portfolio?.totalValue ?? 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Invested</div>
                <div className="text-xl font-bold">{formatCurrency(portfolio?.investedValue ?? 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Total P&L</div>
                <div className={`text-xl font-bold flex items-center ${isPositive(portfolio?.totalPL ?? 0) ? "text-green-500" : "text-red-500"}`}>
                  {isPositive(portfolio?.totalPL ?? 0) ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {formatCurrency(Math.abs(portfolio?.totalPL ?? 0))}
                </div>
                <div className={`text-xs ${isPositive(portfolio?.totalPLPercent ?? 0) ? "text-green-500" : "text-red-500"}`}>
                  {formatPercent(portfolio?.totalPLPercent ?? 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Day P&L</div>
                <div className={`text-xl font-bold flex items-center ${isPositive(portfolio?.dailyPL ?? 0) ? "text-green-500" : "text-red-500"}`}>
                  {isPositive(portfolio?.dailyPL ?? 0) ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {formatCurrency(Math.abs(portfolio?.dailyPL ?? 0))}
                </div>
                <div className={`text-xs ${isPositive(portfolio?.dailyPLPercent ?? 0) ? "text-green-500" : "text-red-500"}`}>
                  {formatPercent(portfolio?.dailyPLPercent ?? 0)}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Performance Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                  />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                    formatter={(value: number) => [formatCurrency(value), "Portfolio Value"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5" />
            Open Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {portLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : portfolio?.positions && portfolio.positions.length > 0 ? (
            <div className="space-y-3">
              {portfolio.positions.map((pos) => (
                <Link key={pos.id} href={`/stock/${pos.symbol}`}>
                  <div
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-secondary/10 hover:bg-secondary/30 transition-colors cursor-pointer"
                    data-testid={`position-row-${pos.symbol}`}
                  >
                    <div>
                      <div className="font-bold">{pos.symbol}</div>
                      <div className="text-xs text-muted-foreground">{pos.stockName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {pos.shares} shares @ {formatCurrency(pos.avgBuyPrice)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(pos.totalValue)}</div>
                      <div className={`text-sm flex items-center justify-end ${isPositive(pos.pl) ? "text-green-500" : "text-red-500"}`}>
                        {isPositive(pos.pl) ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {formatCurrency(Math.abs(pos.pl))} ({formatPercent(pos.plPercent)})
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Current: {formatCurrency(pos.currentPrice)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>No open positions yet.</p>
              <Link href="/markets" className="text-primary hover:underline text-sm mt-1 inline-block">
                Browse markets to start trading
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          {tradesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : tradesData?.trades && tradesData.trades.length > 0 ? (
            <div className="space-y-2">
              {tradesData.trades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-secondary/10"
                  data-testid={`trade-row-${trade.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={trade.type === "buy" ? "border-green-500/40 text-green-500" : "border-red-500/40 text-red-500"}
                    >
                      {trade.type.toUpperCase()}
                    </Badge>
                    <div>
                      <div className="font-semibold text-sm">{trade.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {trade.shares} shares @ {formatCurrency(trade.price)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">{formatCurrency(trade.totalValue)}</div>
                    {trade.pl != null && (
                      <div className={`text-xs ${isPositive(trade.pl) ? "text-green-500" : "text-red-500"}`}>
                        {formatCurrency(trade.pl, true)}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {new Date(trade.timestamp).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No trades yet. Start trading to see your history here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
