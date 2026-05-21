import { useEffect, useRef, useState } from "react";
import { createChart, ColorType } from "lightweight-charts";

interface Props {
  symbol: string;
  interval: string;
  range: string;
  height?: number;
}

export function LightweightChart({ symbol, interval, range, height = 400 }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const w = container.offsetWidth || window.innerWidth - 48;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "#0F1629" },
        textColor: "#8B9CB3",
      },
      grid: {
        vertLines: { color: "#1E2A40" },
        horzLines: { color: "#1E2A40" },
      },
      rightPriceScale: { borderColor: "#1E2A40" },
      timeScale: { borderColor: "#1E2A40", timeVisible: true },
      width: w,
      height: height,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#00D897",
      downColor: "#FF4757",
      borderUpColor: "#00D897",
      borderDownColor: "#FF4757",
      wickUpColor: "#00D897",
      wickDownColor: "#FF4757",
    });

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/stocks/history/${symbol}?interval=${interval}&range=${range}`
        );
        const json = await res.json();
        const candles = json?.candles;
        if (!candles?.length) {
          setError("No data");
          return;
        }
        candleSeries.setData(candles);
        chart.timeScale().fitContent();
        setError(null);
      } catch (err) {
        setError("Failed to load chart");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleResize = () => {
      const w2 = container.offsetWidth || window.innerWidth - 48;
      chart.applyOptions({ width: w2 });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [symbol, interval, range, height]);

  return (
    <div style={{ width: "100%", height: `${height}px`, position: "relative" }}>
      {loading && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          color: "#8B9CB3", fontSize: "14px", background: "#0F1629"
        }}>
          Loading chart...
        </div>
      )}
      {error && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          color: "#FF4757", fontSize: "14px"
        }}>
          {error}
        </div>
      )}
      <div ref={chartContainerRef} style={{ width: "100%", height: `${height}px` }} />
    </div>
  );
          }          
