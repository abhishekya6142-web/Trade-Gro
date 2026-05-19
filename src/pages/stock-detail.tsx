import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import {
  useGetStockQuote,
  useGetNews,
  useExecuteTrade,
  useAnalyzeChart,
  getGetStockQuoteQueryKey,
  getGetPortfolioQueryKey,
  getGetMeQueryKey,
  getGetTradesQueryKey,
} from "@workspace/api-client-react";
import { TradeRequestType } from "@workspace/api-client-react";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  BrainCircuit,
  Newspaper,
  Clock,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface IntervalOption {
  label: string;
  tvInterval: string;
}

const INTERVALS: IntervalOption[] = [
  { label: "15m", tvInterval: "15"  },
  { label: "1h",  tvInterval: "60"  },
  { label: "1D",  tvInterval: "D"   },
  { label: "1W",  tvInterval: "W"   },
  { label: "1M",  tvInterval: "M"   },
];

export default function StockDetail() {
  const params = useParams<{ symbol: string }>();
  const symbol = decodeURIComponent(params.symbol ?? "");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedInterval, setSelectedInterval] = useState<IntervalOption>(
    INTERVALS.find((i) => i.label === "1D")!
  );

  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [tradeShares, setTradeShares] = useState("1");
  const [tradeOpen, setTradeOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const { data: quote, isLoading: quoteLoading } = useGetStockQuote(symbol, {
    query: { enabled: !!symbol, queryKey: getGetStockQuoteQueryKey(symbol) },
  });

  const { data: newsData } = useGetNews({ symbol });
  const executeTrade = useExecuteTrade();
  const analyzeChart = useAnalyzeChart();

  const isPositive = (quote?.change ?? 0) >= 0;
  const ticker = symbol.replace(".NS", "").replace(".KS", "");

  const handleTrade = () => {
    const shares = parseInt(tradeShares);
    if (!shares || shares <= 0) {
      toast({ title: "Invalid quantity", description: "Please enter a valid number of shares.", variant: "destructive" });
      return;
    }
    const userId = localStorage.getItem("tradevision_user_id") ?? "";
    executeTrade.mutate(
      { data: { userId, symbol, type: tradeType as TradeRequestType, shares, price: quote?.price ?? 0 } },
      {
        onSuccess: (result) => {
          toast({
            title: result.success ? `${tradeType === "buy" ? "Bought" : "Sold"} ${shares} shares` : "Trade failed",
            description: result.message,
            variant: result.success ? "default" : "destructive",
          });
          if (result.success) {
            setTradeOpen(false);
            queryClient.invalidateQueries({ queryKey: getGetPortfolioQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetTradesQueryKey() });
          }
        },
        onError: () => {
          toast({ title: "Trade failed", description: "Something went wrong.", variant: "destructive" });
        },
      }
    );
  };

  const handleAnalyze = () => {
    setAnalysisOpen(true);
    analyzeChart.mutate({ data: { symbol, candles: [], interval: selectedInterval.label } });
  };

  const totalTradeValue = (parseInt(tradeShares) || 0) * (quote?.price ?? 0);

  return (
    <div className="min-h-screen pb-20" style={{ background: "#0A0E1A" }}>
      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation("/markets")}
            className="p-2 rounded-xl transition-colors"
            style={{ background: "#0F1629", border: "1px solid #1E2A40" }}
          >
            <ArrowLeft className="h-4 w-4 text-white" />
          </button>
          <div className="flex-1 min-w-0">
            {quoteLoading ? <Skeleton className="h-7 w-40" /> : (
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white">{quote?.symbol ?? ticker}</h1>
                <Badge variant="outline" className="text-xs" style={{ borderColor: "#1E2A40", color: "#8B9CB3" }}>
                  {quote?.sector ?? "Equity"}
                </Badge>
              </div>
            )}
            <p className="text-xs truncate mt-0.5" style={{ color: "#8B9CB3" }}>{quote?.name ?? symbol}</p>
          </div>
        </div>

        {/* Price Hero */}
        <div className="rounded-2xl p-4" style={{ background: "#0F1629", border: "1px solid #1E2A40" }}>
          {quoteLoading ? <Skeleton className="h-10 w-40" /> : (
            <>
              <div className="text-3xl font-bold text-white">{formatCurrency(quote?.price ?? 0)}</div>
              <div className="flex items-center gap-1 mt-1 text-base font-semibold"
                style={{ color: isPositive ? "#00D897" : "#FF4757" }}>
                {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {formatCurrency(Math.abs(quote?.change ?? 0), true)} ({formatPercent(Math.abs(quote?.changePercent ?? 0))})
              </div>
            </>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4" style={{ borderTop: "1px solid #1E2A40" }}>
            {[
              { label: "Open",       value: quote?.open         ? formatCurrency(quote.open)         : "—" },
              { label: "Prev Close", value: quote?.previousClose ? formatCurrency(quote.previousClose): "—" },
              { label: "52W High",   value: quote?.high52w       ? formatCurrency(quote.high52w)      : "—", color: "#00D897" },
              { label: "52W Low",    value: quote?.low52w        ? formatCurrency(quote.low52w)       : "—", color: "#FF4757" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xs mb-0.5" style={{ color: "#8B9CB3" }}>{s.label}</p>
                <p className="text-sm font-semibold" style={{ color: s.color ?? "white" }}>{s.value}</p>
              </div>
            ))}
          </div>
          {quote?.volume && (
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid #1E2A40" }}>
              <p className="text-xs" style={{ color: "#8B9CB3" }}>Volume</p>
              <p className="text-sm font-semibold text-white">{quote.volume.toLocaleString("en-IN")}</p>
            </div>
          )}
        </div>

        {/* Chart Card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#0F1629", border: "1px solid #1E2A40" }}>
          {/* Chart toolbar */}
          <div className="flex items-center justify-between px-4 py-3 gap-2 flex-wrap" style={{ borderBottom: "1px solid #1E2A40" }}>
            <div className="flex items-center gap-1">
              {INTERVALS.map((opt) => {
                const isActive = selectedInterval.label === opt.label;
                return (
                  <button
                    key={opt.label}
                    onClick={() => setSelectedInterval(opt)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: isActive ? "#00D897" : "transparent",
                      color: isActive ? "#0A0E1A" : "#8B9CB3",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzeChart.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: "#1A2540", color: "#00D897", border: "1px solid #1E2A40" }}
            >
              <BrainCircuit className="h-3.5 w-3.5" />
              {analyzeChart.isPending ? "Analyzing…" : "AI Analysis"}
            </button>
          </div>

          {/* TradingView Chart */}
          <div className="p-3">
            <iframe
              key={`${ticker}-${selectedInterval.tvInterval}`}
              src={`https://s.tradingview.com/widgetembed/?symbol=NSE:${ticker}&interval=${selectedInterval.tvInterval}&theme=dark&style=1&locale=en&hide_top_toolbar=0&hide_legend=0&save_image=0`}
              width="100%"
              height="450"
              frameBorder="0"
              allowTransparency={true}
              scrolling="no"
              style={{ borderRadius: "12px" }}
            />
          </div>
        </div>

        {/* Buy / Sell */}
        <div className="flex gap-3">
          <button
            className="flex-1 h-12 rounded-xl text-base font-bold transition-all hover:opacity-90"
            style={{ background: "#00D897", color: "#0A0E1A" }}
            onClick={() => { setTradeType("buy"); setTradeOpen(true); }}
          >
            Buy
          </button>
          <button
            className="flex-1 h-12 rounded-xl text-base font-bold transition-all hover:opacity-90"
            style={{ background: "rgba(255,71,87,0.15)", color: "#FF4757", border: "1px solid rgba(255,71,87,0.4)" }}
            onClick={() => { setTradeType("sell"); setTradeOpen(true); }}
          >
            Sell
          </button>
        </div>

        {/* News */}
        {newsData?.articles && newsData.articles.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "#0F1629", border: "1px solid #1E2A40" }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid #1E2A40" }}>
              <Newspaper className="h-4 w-4" style={{ color: "#8B9CB3" }} />
              <span className="text-sm font-bold text-white">Related News</span>
            </div>
            <div className="divide-y" style={{ borderColor: "#1E2A40" }}>
              {newsData.articles.slice(0, 4).map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 hover:opacity-80 transition-opacity"
                >
                  <p className="text-sm font-medium text-white leading-snug line-clamp-2">{article.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs" style={{ color: "#8B9CB3" }}>{article.source}</span>
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{
                        background: article.sentiment === "positive" ? "rgba(0,216,151,0.15)"
                          : article.sentiment === "negative" ? "rgba(255,71,87,0.15)" : "#1A2540",
                        color: article.sentiment === "positive" ? "#00D897"
                          : article.sentiment === "negative" ? "#FF4757" : "#8B9CB3",
                      }}
                    >
                      {article.sentiment}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trade Dialog */}
      <Dialog open={tradeOpen} onOpenChange={setTradeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tradeType === "buy" ? "Buy" : "Sell"} {ticker}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex justify-between text-sm p-3 rounded-lg" style={{ background: "#1A2540" }}>
              <span style={{ color: "#8B9CB3" }}>Current Price</span>
              <span className="font-bold text-white">{formatCurrency(quote?.price ?? 0)}</span>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Number of Shares</label>
              <Input
                type="number"
                min="1"
                value={tradeShares}
                onChange={(e) => setTradeShares(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="flex justify-between text-sm p-3 rounded-lg border" style={{ borderColor: "#1E2A40" }}>
              <span className="text-white">Total Value</span>
              <span className="font-bold text-white">{formatCurrency(totalTradeValue)}</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setTradeOpen(false)}>Cancel</Button>
              <Button
                className="flex-1 font-bold text-white"
                style={{ background: tradeType === "buy" ? "#00D897" : "#FF4757", color: tradeType === "buy" ? "#0A0E1A" : "white" }}
                onClick={handleTrade}
                disabled={executeTrade.isPending}
              >
                {executeTrade.isPending ? "Processing…" : `Confirm ${tradeType === "buy" ? "Buy" : "Sell"}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Analysis Dialog */}
      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5" style={{ color: "#00D897" }} />
              AI Chart Analysis — {ticker}
            </DialogTitle>
          </DialogHeader>
          {analyzeChart.isPending ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-5 w-full" style={{ animationDelay: `${i * 100}ms` }} />)}
            </div>
          ) : analyzeChart.data ? (
            <div className="space-y-4 py-2">
              <div className="flex flex-wrap gap-2">
                <Badge
                  className="text-sm font-semibold"
                  style={{
                    background: analyzeChart.data.signal === "bullish" ? "rgba(0,216,151,0.15)" : analyzeChart.data.signal === "bearish" ? "rgba(255,71,87,0.15)" : "rgba(245,158,11,0.15)",
                    color: analyzeChart.data.signal === "bullish" ? "#00D897" : analyzeChart.data.signal === "bearish" ? "#FF4757" : "#F59E0B",
                    border: "none",
                  }}
                >
                  {analyzeChart.data.signal.toUpperCase()}
                </Badge>
                <Badge variant="outline">{analyzeChart.data.confidence}% confidence</Badge>
                <Badge variant="outline" className="capitalize">Risk: {analyzeChart.data.risk}</Badge>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#8B9CB3" }}>Summary</p>
                <p className="text-sm leading-relaxed">{analyzeChart.data.summary}</p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
                                                                                   }    
