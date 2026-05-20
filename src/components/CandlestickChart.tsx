import { useEffect, useRef } from "react";
import { createChart, ColorType } from "lightweight-charts";
import { Candle } from "@workspace/api-client-react";

interface CandlestickChartProps {
  data: Candle[];
}

export function CandlestickChart({ data }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0F1629" },
        textColor: "#8B9CB3",
      },
      grid: {
        vertLines: { color: "#1E2A40" },
        horzLines: { color: "#1E2A40" },
      },
      crosshair: {
        vertLine: { color: "#8B9CB3", labelBackgroundColor: "#1E2A40" },
        horzLine: { color: "#8B9CB3", labelBackgroundColor: "#1E2A40" },
      },
      rightPriceScale: { borderColor: "#1E2A40" },
      timeScale: {
        borderColor: "#1E2A40",
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerRef.current.clientWidth,
      height: 400,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#00D897",
      downColor: "#FF4757",
      borderUpColor: "#00D897",
      borderDownColor: "#FF4757",
      wickUpColor: "#00D897",
      wickDownColor: "#FF4757",
    });

    candleSeries.setData(
      data.map((c) => ({
        time: c.time as any,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    volumeSeries.setData(
      data.map((c) => ({
        time: c.time as any,
        value: c.volume,
        color: c.close >= c.open ? "rgba(0,216,151,0.4)" : "rgba(255,71,87,0.4)",
      }))
    );

    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [data]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "400px", borderRadius: "12px", overflow: "hidden" }}
    />
  );
}         
