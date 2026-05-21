import { useEffect, useRef } from "react";
import { createChart, ColorType } from "lightweight-charts";

interface Props {
  symbol: string;
  interval: string;
  range: string;
  height?: number;
}

export function LightweightChart({ symbol, interval, range, height = 400 }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
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
      width: chartContainerRef.current.clientWidth,
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
        const res = await fetch(
          `/api/stocks/history/${symbol}?interval=${interval}&range=${range}`
        );
        const json = await res.json();
        const candles = json?.candles;
        if (!candles?.length) return;
        candleSeries.setData(candles);
        chart.timeScale().fitContent();
      } catch (err) {
        console.error("Chart error:", err);
      }
    };

    fetchData();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [symbol, interval, range, height]);

  return <div ref={chartContainerRef} style={{ width: "100%", height: `${height}px` }} />;
}
