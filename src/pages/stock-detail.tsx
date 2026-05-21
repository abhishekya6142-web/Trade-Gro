// v2
import { useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, ArrowDownRight, ArrowLeft, BrainCircuit, Newspaper, Maximize2, Minimize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { LightweightChart } from "@/components/LightweightChart";

interface IntervalOption { label: string; interval: string; range: string; }

const INTERVALS: IntervalOption[] = [
  { label: "15m", interval: "15m", range: "5d"  },
  { label: "1h",  interval: "60m", range: "1mo" },
  { label: "1D",  interval: "1d",  range: "1y"  },
  { label: "1W",  interval: "1wk", range: "5y"  },
  { label: "1M",  interval: "1mo", range: "10y" },
];

export default function StockDetail() {
  const params = useParams<{ symbol: string }>();
  const symbol = decodeURIComponent(params.symbol ?? "");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedInterval, setSelectedInterval] = useState<IntervalOption>(INTERVALS.find((i) => i.label === "1D")!);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
  const ticker = symbol.replace(".NS", "").replace(".BO", "").replace(".KS", "");

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
        onError: () => toast({ title: "Trade failed", description: "Something went wrong.", variant: "destructive" }),
      }
    );
  };

  const handleAnalyze = () => {
    setAnalysisOpen(true);
    analyzeChart.mutate({ data: { symbol, candles: [], interval: selectedInterval.interval } });
  };

  const totalTradeValue = (parseInt(tradeShares) || 0) * (quote?.price ?? 0);

  return (
    <>
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#0A0E1A" }}>
          <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ borderBottom: "1px solid #1E2A40" }}>
            <div className="flex items-center gap-1">
              {INTERVALS.map((opt) => (
                <button key={opt.label} onClick={() => setSelectedInterval(opt)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: selectedInterval.label === opt.label ? "#00D897" : "transparent", color: selectedInterval.label === opt.label ? "#0A0E1A" : "#8B9CB3" }}>
                  {opt.label}
                </button>
              ))}
            </div>
            <button onClick={() => setIsFullscreen(false)} className="p-2 rounded-xl" style={{ background: "#1A2540" }}>
              <Minimize2 className="h-4 w-4 text-white" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <LightweightChart symbol={symbol} interval={selectedInterval.interval} range={selectedInterval.range} height={window.innerHeight - 120} />
          </div>
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2" style={{ height: "60px", background: "#0F1629", borderTop: "1px solid #1E2A40" }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{quote?.symbol ?? ticker}</p>
              <p className="text-xs" style={{ color: isPositive ? "#00D897" : "#FF4757" }}>
                {formatCurrency(quote?.price ?? 0)} {isPositive ? "▲" : "▼"} {formatPercent(Math.abs(quote?.changePercent ?? 0))}
              </p>
            </div>
            <button onClick={() => { setTradeType("buy"); setTradeOpen(true); }} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ background: "#00D897", color: "#0A0E1A" }}>Buy</button>
            <button onClick={() => { setTradeType("sell"); setTradeOpen(true); }} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ background: "rgba(255,71,87,0.15)", color: "#FF4757", border: "1px solid rgba(255,71,87,0.4)" }}>Sell</button>
            <button onClick={() => setIsFullscreen(false)} className="p-2 rounded-xl" style={{ background: "#1A2540" }}>
              <Minimize2 className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen pb-20" style={{ background: "#0A0E1A" }}>
        <div className="max-w-3xl mx-auto px-4 pt-4 space-y-4">

          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/markets")} className="p-2 rounded-xl" style={{ background: "#0F1629", border: "1px solid #1E2A40" }}>
              <ArrowLeft className="h-4 w-4 text-white" />
            </button>
            <div className="flex-1 min-w-0">
              {quoteLoading ? <Skeleton className="h-7 w-40" /> : (
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-white">{quote?.symbol ?? ticker}</h1>
                  <Badge variant="outline" className="text-xs" style={{ borderColor: "#1E2A40", color: "#8B9CB3" }}>{quote?.sector ?? "Equity"}</Badge>
                </div>
              )}
              <p className="text-xs truncate mt-0.5" style={{ color: "#8B9CB3" }}>{quote?.name ?? symbol}</p>
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{ background: "#0F1629", border: "1px solid #1E2A40" }}>
            {quoteLoading ? <Skeleton className="h-10 w-40" /> : (
              <>
                <div className="text-3xl font-bold text-white">{formatCurrency(quote?.price ?? 0)}</div>
                <div className="flex items-center gap-1 mt-1 text-base font-semibold" style={{ color: isPositive ? "#00D897" : "#FF4757" }}>
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

          <div className="rounded-2xl overflow-hidden" style={{ background: "#0F1629", border: "1px solid #1E2A40" }}>
            <div className="flex items-center justify-between px-4 py-3 gap-2" style={{ borderBottom: "1px solid #1E2A40" }}>
              <div className="flex items-center gap-1">
                {INTERVALS.map((opt) => (
                  <button key={opt.label} onClick={() => setSelectedInterval(opt)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: selectedInterval.label === opt.label ? "#00D897" : "transparent", color: selectedInterval.label === opt.label ? "#0A0E1A" : "#8B9CB3" }}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleAnalyze} disabled={analyzeChart.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: "#1A2540", color: "#00D897", border: "1px solid #1E2A40" }}>
                  <BrainCircuit className="h-3.5 w-3.5" />
                  {analyzeChart.isPending ? "Analyzing…" : "AI Analysis"}
                </button>
                <button onClick={() => setIsFullscreen(true)} className="p-1.5 rounded-lg" style={{ background: "#1A2540", border: "1px solid #1E2A40" }}>
                  <Maximize2 className="h-3.5 w-3.5" style={{ color: "#8B9CB3" }} />
                </button>
              </div>
            </div>
            <div className="p-3">
              <LightweightChart symbol={symbol} interval={selectedInterval.interval} range={selectedInterval.range} height={400} />
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 h-12 rounded-xl text-base font-bold" style={{ background: "#00D897", color: "#0A0E1A" }}
              onClick={() => { setTradeType("buy"); setTradeOpen(true); }}>Buy</button>
            <button className="flex-1 h-12 rounded-xl text-base font-bold" style={{ background: "rgba(255,71,87,0.15)", color: "#FF4757", border: "1px solid rgba(255,71,87,0.4)" }}
              onClick={() => { setTradeType("sell"); setTradeOpen(true); }}>Sell</button>
          </div>

          {newsData?.articles && newsData.articles.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "#0F1629", border: "1px solid #1E2A40" }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid #1E2A40" }}>
                <Newspaper className="h-4 w-4" style={{ color: "#8B9CB3" }} />
                <span className="text-sm font-bold text-white">Related News</span>
              </div>
              <div className="divide-y" style={{ borderColor: "#1E2A40" }}>
                {newsData.articles.slice(0, 4).map((article) => (
                  <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" className="block px-4 py-3 hover:opacity-80">
                    <p className="text-sm font-medium text-white leading-snug line-clamp-2">{article.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs" style={{ color: "#8B9CB3" }}>{article.source}</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{
                        background: article.sentiment === "positive" ? "rgba(0,216,151,0.15)" : article.sentiment === "negative" ? "rgba(255,71,87,0.15)" : "#1A2540",
                        color: article.sentiment === "positive" ? "#00D897" : article.sentiment === "negative" ? "#FF4757" : "#8B9CB3",
                      }}>{article.sentiment}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={tradeOpen} onOpenChange={setTradeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{tradeType === "buy" ? "Buy" : "Sell"} {ticker}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex justify-between text-sm p-3 rounded-lg" style={{ background: "#1A2540" }}>
              <span style={{ color: "#8B9CB3" }}>Current Price</span>
              <span className="font-bold text-white">{formatCurrency(quote?.price ?? 0)}</span>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Number of Shares</label>
              <Input type="number" min="1" value={tradeShares} onChange={(e) => setTradeShares(e.target.value)} className="h-12" />
            </div>
            <div className="flex justify-between text-sm p-3 rounded-lg border" style={{ borderColor: "#1E2A40" }}>
              <span className="text-white">Total Value</span>
              <span className="font-bold text-white">{formatCurrency(totalTradeValue)}</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setTradeOpen(false)}>Cancel</Button>
              <Button className="flex-1 font-bold" style={{ background: tradeType === "buy" ? "#00D897" : "#FF4757", color: tradeType === "buy" ? "#0A0E1A" : "white" }}
                onClick={handleTrade} disabled={executeTrade.isPending}>
                {executeTrade.isPending ? "Processing…" : `Confirm ${tradeType === "buy" ? "Buy" : "Sell"}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5" style={{ color: "#00D897" }} />
              AI Chart Analysis — {ticker}
            </DialogTitle>
          </DialogHeader>
          {analyzeChart.isPending ? (
            <div className="space-y-3 py-4">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-5 w-full" />)}</div>
          ) : analyzeChart.data ? (
            <div className="space-y-4 py-2">
              <div className="flex flex-wrap gap-2">
                <Badge className="text-sm font-semibold" style={{
                  background: analyzeChart.data.signal === "bullish" ? "rgba(0,216,151,0.15)" : analyzeChart.data.signal === "bearish" ? "rgba(255,71,87,0.15)" : "rgba(245,158,11,0.15)",
                  color: analyzeChart.data.signal === "bullish" ? "#00D897" : analyzeChart.data.signal === "bearish" ? "#FF4757" : "#F59E0B", border: "none",
                }}>{analyzeChart.data.signal.toUpperCase()}</Badge>
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
    </>
  );
    }      
