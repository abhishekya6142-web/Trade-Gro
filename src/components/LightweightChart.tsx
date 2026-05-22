import { useEffect, useRef, useState } from "react";
import { createChart, ColorType } from "lightweight-charts";

interface Props {
  symbol: string;
  interval: string;
  range: string;
  height?: number;
  showRSI?: boolean;
  showUTBot?: boolean;
  drawMode?: boolean;
}

export function LightweightChart({ symbol, interval, range, height = 400, showRSI = false, showUTBot = false, drawMode = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const drawLines = useRef<{start:{x:number;y:number};end:{x:number;y:number}}[]>([]);
  const isDrawing = useRef(false);
  const drawStart = useRef<{x:number;y:number}|null>(null);
  const [, forceUpdate] = useState(0);
  const candleSeriesRef = useRef<any>(null);

  const calcRSI = (closes: number[], period = 14): (number | null)[] => {
    const rsi: (number | null)[] = new Array(closes.length).fill(null);
    if (closes.length < period + 1) return rsi;
    let avgGain = 0, avgLoss = 0;
    for (let i = 1; i <= period; i++) {
      const d = closes[i] - closes[i - 1];
      if (d > 0) avgGain += d; else avgLoss += Math.abs(d);
    }
    avgGain /= period; avgLoss /= period;
    for (let i = period; i < closes.length; i++) {
      if (i > period) {
        const d = closes[i] - closes[i - 1];
        avgGain = (avgGain * (period - 1) + (d > 0 ? d : 0)) / period;
        avgLoss = (avgLoss * (period - 1) + (d < 0 ? Math.abs(d) : 0)) / period;
      }
      rsi[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    }
    return rsi;
  };

  const calcUTBot = (candles: any[], keyValue = 1, atrPeriod = 10) => {
    const buys: any[] = [];
    const sells: any[] = [];
    if (candles.length < atrPeriod + 2) return { buys, sells };
    const atrs: number[] = [];
    for (let i = 1; i < candles.length; i++) {
      const tr = Math.max(
        candles[i].high - candles[i].low,
        Math.abs(candles[i].high - candles[i-1].close),
        Math.abs(candles[i].low - candles[i-1].close)
      );
      atrs.push(tr);
    }
    const atrSmoothed: number[] = [];
    let atrSum = atrs.slice(0, atrPeriod).reduce((a,b) => a+b, 0) / atrPeriod;
    atrSmoothed.push(atrSum);
    for (let i = atrPeriod; i < atrs.length; i++) {
      atrSum = (atrSum * (atrPeriod-1) + atrs[i]) / atrPeriod;
      atrSmoothed.push(atrSum);
    }
    let trailingStop = 0;
    let prevClose = candles[atrPeriod].close;
    for (let i = atrPeriod; i < candles.length - 1; i++) {
      const atr = atrSmoothed[i - atrPeriod] * keyValue;
      const close = candles[i+1].close;
      const prevTS = trailingStop;
      if (close > prevTS) trailingStop = Math.max(prevTS, close - atr);
      else if (close < prevTS) trailingStop = Math.min(prevTS, close + atr);
      else trailingStop = close > prevTS ? close - atr : close + atr;
      if (prevClose <= prevTS && close > trailingStop)
        buys.push({ time: candles[i+1].time, position: "belowBar", color: "#00D897", shape: "arrowUp", text: "BUY" });
      if (prevClose >= prevTS && close < trailingStop)
        sells.push({ time: candles[i+1].time, position: "aboveBar", color: "#FF4757", shape: "arrowDown", text: "SELL" });
      prevClose = close;
    }
    return { buys, sells };
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const w = container.offsetWidth || window.innerWidth - 48;
    const chart = createChart(container, {
      layout: { background: { type: ColorType.Solid, color: "#0A0E1A" }, textColor: "#8B9CB3" },
      grid: { vertLines: { color: "#1E2A40" }, horzLines: { color: "#1E2A40" } },
      rightPriceScale: { borderColor: "#1E2A40" },
      timeScale: { borderColor: "#1E2A40", timeVisible: true },
      crosshair: { mode: 1 },
      width: w,
      height: height,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#00D897", downColor: "#FF4757",
      borderUpColor: "#00D897", borderDownColor: "#FF4757",
      wickUpColor: "#00D897", wickDownColor: "#FF4757",
    });
    candleSeriesRef.current = candleSeries;

    let rsiSeries: any = null;
    if (showRSI) {
      rsiSeries = chart.addLineSeries({
        color: "#F59E0B", lineWidth: 1,
        priceScaleId: "rsi", title: "RSI(14)",
      });
      chart.priceScale("rsi").applyOptions({
        scaleMargins: { top: 0.75, bottom: 0 },
        borderColor: "#1E2A40",
      });
    }

    const fetchData = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        const res = await fetch(`/api/stocks/history/${symbol}?interval=${interval}&range=${range}`);
        const json = await res.json();
        const candles = json?.candles;
        if (!candles?.length) { if (isInitial) setError("No data"); return; }

        if (isInitial) {
          candleSeries.setData(candles);
          chart.timeScale().fitContent();
        } else {
          // Sirf last candle update karo
          const last = candles[candles.length - 1];
          candleSeries.update({
            time: last.time,
            open: last.open,
            high: last.high,
            low: last.low,
            close: last.close,
          });
        }

        if (showRSI && rsiSeries) {
          const closes = candles.map((c: any) => c.close);
          const rsiValues = calcRSI(closes);
          const rsiData = candles
            .map((c: any, i: number) => rsiValues[i] !== null ? { time: c.time, value: rsiValues[i] } : null)
            .filter(Boolean);
          rsiSeries.setData(rsiData);
        }

        if (showUTBot) {
          const { buys, sells } = calcUTBot(candles);
          const markers = [...buys, ...sells].sort((a,b) => a.time - b.time);
          if (markers.length) candleSeries.setMarkers(markers);
        } else {
          candleSeries.setMarkers([]);
        }

        if (isInitial) setError(null);
      } catch {
        if (isInitial) setError("Failed to load");
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    fetchData(true);

    // Real-time: har 5 second mein last candle update
    const refreshTimer = setInterval(() => fetchData(false), 5000);

    const handleResize = () => {
      const w2 = container.offsetWidth || window.innerWidth - 48;
      chart.applyOptions({ width: w2 });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(refreshTimer);
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [symbol, interval, range, height, showRSI, showUTBot]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!drawMode) return;
    isDrawing.current = true;
    const rect = containerRef.current!.getBoundingClientRect();
    drawStart.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!drawMode || !isDrawing.current || !drawStart.current) return;
    isDrawing.current = false;
    const rect = containerRef.current!.getBoundingClientRect();
    const end = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    drawLines.current = [...drawLines.current, { start: drawStart.current, end }];
    drawStart.current = null;
    forceUpdate(n => n + 1);
  };

  return (
    <div style={{ width: "100%", height: `${height}px`, position: "relative", background: "#0A0E1A" }}>
      {loading && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#8B9CB3", fontSize: "13px", background: "#0A0E1A", zIndex: 10 }}>
          Loading chart...
        </div>
      )}
      {error && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#FF4757", fontSize: "13px", zIndex: 10 }}>
          {error}
        </div>
      )}
      {(showRSI || showUTBot) && !loading && (
        <div style={{ position: "absolute", top: 6, left: 8, zIndex: 5, display: "flex", gap: "4px" }}>
          {showRSI && <span style={{ background: "rgba(245,158,11,0.2)", color: "#F59E0B", fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>RSI</span>}
          {showUTBot && <span style={{ background: "rgba(139,92,246,0.2)", color: "#8B5CF6", fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>UT Bot</span>}
        </div>
      )}
      {drawMode && (
        <div style={{ position: "absolute", top: 6, right: 8, zIndex: 5, background: "rgba(139,92,246,0.3)", color: "#8B5CF6", fontSize: "10px", padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>
          ✏️ Draw Mode
        </div>
      )}
      <div ref={containerRef} style={{ width: "100%", height: `${height}px`, cursor: drawMode ? "crosshair" : "default" }}
        onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} />
      {drawLines.current.length > 0 && (
        <svg style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 4 }} width="100%" height="100%">
          {drawLines.current.map((line, i) => (
            <line key={i} x1={line.start.x} y1={line.start.y} x2={line.end.x} y2={line.end.y}
              stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
          ))}
        </svg>
      )}
    </div>
  );
}
