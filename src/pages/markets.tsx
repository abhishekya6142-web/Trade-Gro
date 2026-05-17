import { useState, useEffect } from "react";
import { useSearchStocks, useGetTrendingStocks, getSearchStocksQueryKey } from "@workspace/api-client-react";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import { Link } from "wouter";
import { COMPANIES, SECTOR_COLORS } from "@/lib/companies";

const SECTORS = Array.from(new Set(COMPANIES.map((c) => c.sector))).sort();

export default function Markets() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeSector, setActiveSector] = useState<string>("All");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: searchResults, isLoading: isSearchLoading } = useSearchStocks(
    { q: debouncedQuery },
    { query: { enabled: debouncedQuery.length > 1, queryKey: getSearchStocksQueryKey({ q: debouncedQuery }) } }
  );

  const { data: trendingResponse, isLoading: isTrendingLoading } = useGetTrendingStocks();

  const priceMap = new Map(
    (trendingResponse?.stocks ?? []).map((s) => [s.symbol, s])
  );

  const filtered = COMPANIES.filter((c) =>
    (activeSector === "All" || c.sector === activeSector) &&
    (debouncedQuery.length < 2 ||
      c.symbol.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(debouncedQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen pb-20" style={{ background: "#0A0E1A" }}>
      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-4">

        <div>
          <h1 className="text-2xl font-bold text-white">Markets</h1>
          <p className="text-sm mt-0.5" style={{ color: "#8B9CB3" }}>
            {COMPANIES.length} companies — NSE, BSE & Global
          </p>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#8B9CB3" }} />
          <input
            className="w-full h-11 pl-9 pr-4 rounded-xl text-sm text-white placeholder-opacity-60 outline-none"
            style={{
              background: "#0F1629",
              border: "1px solid #1E2A40",
              color: "white",
            }}
            placeholder="Search symbol or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Sector filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["All", ...SECTORS].map((s) => (
            <button
              key={s}
              onClick={() => setActiveSector(s)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: activeSector === s ? "#00D897" : "#0F1629",
                color: activeSector === s ? "#0A0E1A" : "#8B9CB3",
                border: "1px solid",
                borderColor: activeSector === s ? "#00D897" : "#1E2A40",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Trending section (live prices) — only when no search */}
        {debouncedQuery.length < 2 && activeSector === "All" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-4 rounded-full" style={{ background: "#00D897" }} />
              <span className="text-sm font-bold text-white">Trending Now</span>
            </div>
            {isTrendingLoading ? (
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(trendingResponse?.stocks ?? []).map((stock) => {
                  const isUp = stock.change >= 0;
                  return (
                    <Link key={stock.symbol} href={`/stock/${encodeURIComponent(stock.symbol)}`}>
                      <div
                        className="p-3 rounded-xl cursor-pointer hover:opacity-90 transition-all"
                        style={{ background: "#0F1629", border: "1px solid #1E2A40" }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                            style={{ background: "#1A2540", color: "#00D897" }}
                          >
                            {stock.symbol.replace(".NS", "")}
                          </span>
                          <span
                            className="text-[10px] font-semibold"
                            style={{ color: isUp ? "#00D897" : "#FF4757" }}
                          >
                            {isUp ? "+" : ""}{formatPercent(stock.changePercent)}
                          </span>
                        </div>
                        <p className="text-xs text-white font-semibold truncate">{stock.name}</p>
                        <p className="text-sm font-bold text-white mt-0.5">{formatCurrency(stock.price)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Yahoo Finance search results */}
        {debouncedQuery.length > 1 && searchResults?.results && searchResults.results.length > 0 && (
          <div>
            <p className="text-xs mb-2" style={{ color: "#8B9CB3" }}>Search results from Yahoo Finance</p>
            <div className="space-y-2">
              {searchResults.results.map((stock) => (
                <Link key={stock.symbol} href={`/stock/${encodeURIComponent(stock.symbol)}`}>
                  <div
                    className="flex items-center justify-between p-3.5 rounded-xl cursor-pointer hover:opacity-90 transition-all"
                    style={{ background: "#0F1629", border: "1px solid #1E2A40" }}
                  >
                    <div>
                      <p className="font-bold text-white text-sm">{stock.symbol}</p>
                      <p className="text-xs" style={{ color: "#8B9CB3" }}>{stock.name}</p>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-lg font-medium"
                      style={{ background: "#1A2540", color: "#8B9CB3" }}
                    >
                      {stock.exchange}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        {debouncedQuery.length > 1 && isSearchLoading && (
          <div className="space-y-2">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        )}

        {/* All companies list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full" style={{ background: "#1E2A40" }} />
              <span className="text-sm font-bold text-white">
                {activeSector === "All" ? "All Companies" : activeSector}
                <span className="ml-2 text-xs font-normal" style={{ color: "#8B9CB3" }}>
                  ({filtered.length})
                </span>
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {filtered.map((company) => {
              const live = priceMap.get(company.symbol);
              const isUp = live ? live.change >= 0 : null;
              const sectorColor = SECTOR_COLORS[company.sector] ?? "#8B9CB3";

              return (
                <Link key={company.symbol} href={`/stock/${encodeURIComponent(company.symbol)}`}>
                  <div
                    className="flex items-center justify-between p-3.5 rounded-xl cursor-pointer hover:opacity-90 transition-all"
                    style={{ background: "#0F1629", border: "1px solid #1E2A40" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ background: `${sectorColor}18`, color: sectorColor }}
                      >
                        {company.symbol.replace(".NS", "").replace(".KS", "").slice(0, 5)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{company.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-medium" style={{ color: sectorColor }}>
                            {company.sector}
                          </span>
                          {live && (
                            <span className="text-[10px]" style={{ color: "#4A5568" }}>
                              Vol {(live.volume / 1_000_000).toFixed(1)}M
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      {live ? (
                        <>
                          <p className="text-sm font-bold text-white">{formatCurrency(live.price)}</p>
                          <div
                            className="flex items-center justify-end gap-0.5 text-[10px] font-semibold mt-0.5"
                            style={{ color: isUp ? "#00D897" : "#FF4757" }}
                          >
                            {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {formatPercent(Math.abs(live.changePercent))}
                          </div>
                        </>
                      ) : (
                        <ArrowUpRight className="h-4 w-4" style={{ color: "#1E2A40" }} />
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
