import { useGetMe, useGetPortfolio, useGetTrendingStocks } from "@workspace/api-client-react";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownRight, Search, PieChart, Bot, Trophy } from "lucide-react";
import { Link } from "wouter";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  return "Good evening,";
}

const QUICK_ACTIONS = [
  { label: "Trade", icon: Search, href: "/markets", color: "#00D897" },
  { label: "Portfolio", icon: PieChart, href: "/portfolio", color: "#00D897" },
  { label: "AI Coach", icon: Bot, href: "/coach", color: "#00D897" },
  { label: "Challenges", icon: Trophy, href: "/challenges", color: "#00D897" },
];

export default function Dashboard() {
  const { data: user, isLoading: isUserLoading } = useGetMe();
  const { data: portfolio } = useGetPortfolio();
  const { data: trendingResponse, isLoading: isTrendingLoading } = useGetTrendingStocks();

  const totalPL = user?.totalPL ?? 0;
  const totalPLPercent = user?.totalPLPercent ?? 0;
  const isPLPositive = totalPL >= 0;
  const positions = portfolio?.positions?.length ?? 0;

  return (
    <div className="min-h-screen" style={{ background: "#0A0E1A" }}>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: "#8B9CB3" }}>{getGreeting()}</p>
            {isUserLoading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <h1 className="text-2xl font-bold text-white">{user?.name ?? "Trader"}</h1>
            )}
          </div>
          {user && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: "#00D897", color: "#0A0E1A" }}
            >
              <Trophy className="h-3.5 w-3.5" />
              Lv {user.level}
            </div>
          )}
        </div>

        {/* Portfolio Value Hero */}
        <div
          className="rounded-2xl p-5 space-y-3"
          style={{ background: "#0F1629", border: "1px solid #1E2A40" }}
        >
          <p className="text-sm" style={{ color: "#8B9CB3" }}>Portfolio Value</p>
          {isUserLoading ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <div className="text-4xl font-bold text-white tracking-tight">
              {formatCurrency(user?.totalPortfolioValue ?? 0)}
            </div>
          )}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                background: isPLPositive ? "rgba(0,216,151,0.15)" : "rgba(255,71,87,0.15)",
                color: isPLPositive ? "#00D897" : "#FF4757",
              }}
            >
              {isPLPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {formatCurrency(Math.abs(totalPL), true)} ({formatPercent(Math.abs(totalPLPercent))})
            </div>
            <span className="text-sm" style={{ color: "#8B9CB3" }}>All time</span>
          </div>

          {/* Stats Row */}
          <div
            className="grid grid-cols-3 rounded-xl mt-1"
            style={{ background: "#0A0E1A", border: "1px solid #1E2A40" }}
          >
            {[
              { label: "Cash", value: formatCurrency(user?.virtualBalance ?? 0), color: "text-white" },
              {
                label: "Day P&L",
                value: `${(user?.dailyPL ?? 0) >= 0 ? "+" : ""}${formatCurrency(user?.dailyPL ?? 0, true)}`,
                color: (user?.dailyPL ?? 0) >= 0 ? "#00D897" : "#FF4757",
              },
              { label: "Positions", value: String(positions), color: "text-white" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="flex flex-col items-center py-3 px-2"
                style={{ borderRight: i < 2 ? "1px solid #1E2A40" : undefined }}
              >
                <span className="text-xs mb-1" style={{ color: "#8B9CB3" }}>{stat.label}</span>
                {isUserLoading ? (
                  <Skeleton className="h-5 w-20" />
                ) : (
                  <span
                    className="text-sm font-bold"
                    style={{ color: typeof stat.color === "string" && stat.color.startsWith("#") ? stat.color : undefined }}
                  >
                    {stat.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-base font-bold text-white mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            {QUICK_ACTIONS.map(({ label, icon: Icon, href }) => (
              <Link key={label} href={href}>
                <div className="flex flex-col items-center gap-2 cursor-pointer group">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-95"
                    style={{ background: "#0F1629", border: "1px solid #1E2A40" }}
                  >
                    <Icon className="h-7 w-7" style={{ color: "#00D897" }} />
                  </div>
                  <span className="text-xs text-center" style={{ color: "#8B9CB3" }}>{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Trending Stocks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white">Trending Stocks</h2>
            <Link href="/markets">
              <span className="text-sm font-semibold" style={{ color: "#00D897" }}>Trade</span>
            </Link>
          </div>

          {isTrendingLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {(trendingResponse?.stocks ?? []).slice(0, 8).map((stock) => {
                const isUp = stock.change >= 0;
                const ticker = stock.symbol.replace(".NS", "");
                return (
                  <Link key={stock.symbol} href={`/stock/${encodeURIComponent(stock.symbol)}`}>
                    <div
                      className="flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all hover:opacity-90"
                      style={{ background: "#0F1629", border: "1px solid #1E2A40" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: "#1A2540", color: "#00D897" }}
                        >
                          {ticker.slice(0, 4)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{stock.name}</p>
                          <p className="text-xs" style={{ color: "#8B9CB3" }}>
                            Vol: {(stock.volume / 1_000_000).toFixed(1)}M
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">{formatCurrency(stock.price)}</p>
                        <div
                          className="flex items-center justify-end gap-0.5 text-xs font-semibold rounded-md px-1.5 py-0.5 mt-0.5"
                          style={{
                            background: isUp ? "rgba(0,216,151,0.15)" : "rgba(255,71,87,0.15)",
                            color: isUp ? "#00D897" : "#FF4757",
                          }}
                        >
                          {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {formatPercent(Math.abs(stock.changePercent))}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
