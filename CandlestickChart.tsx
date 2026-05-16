import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Candle } from "@workspace/api-client-react";
import {
  Crosshair,
  Minus,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  X,
  Maximize2,
  MoveHorizontal,
} from "lucide-react";

interface CandlestickChartProps {
  data: Candle[];
}

const PRICE_LBL_W   = 72;
const TIME_LBL_H    = 28;
const GAP           = 0.28;
const GRID          = 6;
const SVG_W         = 800;
const BULL          = "#00D897";
const BEAR          = "#FF4757";
const DEFAULT_VISIBLE = 80;

type Tool = "crosshair" | "trendline" | "pencil" | "hline";
interface TrendLine  { type: "trendline"; t1: number; p1: number; t2: number; p2: number }
interface PencilPath { type: "pencil";    d: string }
interface HLine      { type: "hline";     price: number }
type Drawing = TrendLine | PencilPath | HLine;

function fmt(v: number) { return v.toFixed(2); }
function fmtTime(ts: number, span: number) {
  const d = new Date(ts * 1000);
  if (span <= 80)  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  if (span <= 500) return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  return                  d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}
function touchDist(t1: Touch, t2: Touch) {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
}

// ── Indicator helpers ─────────────────────────────────────────────────────────
function calcMA(data: Candle[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const sum = data.slice(i - period + 1, i + 1).reduce((s, c) => s + c.close, 0);
    return sum / period;
  });
}

function calcRSI(data: Candle[], period = 14): (number | null)[] {
  const out: (number | null)[] = new Array(data.length).fill(null);
  if (data.length < period + 1) return out;
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const d = data[i].close - data[i - 1].close;
    if (d > 0) avgGain += d; else avgLoss += Math.abs(d);
  }
  avgGain /= period; avgLoss /= period;
  for (let i = period; i < data.length; i++) {
    if (i > period) {
      const d    = data[i].close - data[i - 1].close;
      avgGain = (avgGain * (period - 1) + (d > 0 ? d : 0)) / period;
      avgLoss = (avgLoss * (period - 1) + (d < 0 ? Math.abs(d) : 0)) / period;
    }
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

export function CandlestickChart({ data }: CandlestickChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // ── View state ─────────────────────────────────────────────────────────────
  const initialView = () => {
    const end   = Math.max(0, data.length - 1);
    const start = Math.max(0, end - DEFAULT_VISIBLE + 1);
    return { start, end };
  };
  const [view, setView] = useState(initialView);
  const viewRef = useRef(view);
  useEffect(() => { viewRef.current = view; }, [view]);

  // Reset when data changes
  const prevDataRef = useRef(data);
  useEffect(() => {
    if (prevDataRef.current !== data) {
      prevDataRef.current = data;
      const end   = Math.max(0, data.length - 1);
      const start = Math.max(0, end - DEFAULT_VISIBLE + 1);
      setView({ start, end });
      setDrawings([]);
      setPendingTL(null);
      setPencilPath("");
    }
  }, [data]);

  // ── UI toggles ─────────────────────────────────────────────────────────────
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tool, setTool]   = useState<Tool>("crosshair");
  const toolRef           = useRef<Tool>("crosshair");
  useEffect(() => { toolRef.current = tool; }, [tool]);

  const [showMA9,  setShowMA9]  = useState(true);
  const [showMA20, setShowMA20] = useState(true);
  const [showMA50, setShowMA50] = useState(false);
  const [showRSI,  setShowRSI]  = useState(false);

  // ── Drawing state ──────────────────────────────────────────────────────────
  const [drawings,    setDrawings]    = useState<Drawing[]>([]);
  const [pendingTL,   setPendingTL]   = useState<{ t: number; p: number } | null>(null);
  const [pencilPath,  setPencilPath]  = useState("");
  const pendingTLRef  = useRef<{ t: number; p: number } | null>(null);
  const pencilPathRef = useRef("");
  useEffect(() => { pendingTLRef.current  = pendingTL; },  [pendingTL]);
  useEffect(() => { pencilPathRef.current = pencilPath; }, [pencilPath]);

  // ── Hover state ────────────────────────────────────────────────────────────
  const [hoverSvg,   setHoverSvg]   = useState<{ x: number; y: number } | null>(null);
  const [tooltipIdx, setTooltipIdx] = useState<number | null>(null);

  // ── Layout ─────────────────────────────────────────────────────────────────
  const svgH    = isFullscreen ? Math.max(400, window.innerHeight - 96) : 400;
  const svgHRef = useRef(svgH);
  useEffect(() => { svgHRef.current = svgH; }, [svgH]);

  const innerW  = SVG_W - PRICE_LBL_W;
  const usableH = svgH - TIME_LBL_H;

  // Panel heights — RSI panel appears/disappears
  const rsiPanelH = showRSI ? usableH * 0.20 : 0;
  const volPanelH = usableH * 0.16;
  const priceH    = usableH - volPanelH - rsiPanelH - (showRSI ? 8 : 4);

  const volTop = priceH + 4;
  const volBot = volTop + volPanelH;
  const rsiTop = showRSI ? volBot + 4 : 0;
  const rsiBot = showRSI ? rsiTop + rsiPanelH - 4 : 0;

  const innerWRef  = useRef(innerW);
  const priceHRef  = useRef(priceH);
  const dataLenRef = useRef(data.length);
  useEffect(() => { innerWRef.current  = innerW;  }, [innerW]);
  useEffect(() => { priceHRef.current  = priceH;  }, [priceH]);
  useEffect(() => { dataLenRef.current = data.length; }, [data.length]);

  const visibleData = useMemo(() => data.slice(view.start, view.end + 1), [data, view]);
  const span  = view.end - view.start + 1;
  const slotW = innerW / Math.max(1, span);
  const bodyW = Math.max(1, slotW * (1 - GAP));
  const slotWRef = useRef(slotW);
  useEffect(() => { slotWRef.current = slotW; }, [slotW]);

  const stats = useMemo(() => {
    if (!visibleData.length) return null;
    let minP = Infinity, maxP = -Infinity, maxVol = 0;
    for (const c of visibleData) {
      if (c.low  < minP) minP = c.low;
      if (c.high > maxP) maxP = c.high;
      if (c.volume > maxVol) maxVol = c.volume;
    }
    const pad = (maxP - minP) * 0.06 || maxP * 0.02;
    return { minP: minP - pad, maxP: maxP + pad, maxVol };
  }, [visibleData]);

  const statsRef = useRef(stats);
  useEffect(() => { statsRef.current = stats; }, [stats]);

  // ── Indicator values (computed over full data) ─────────────────────────────
  const ma9All  = useMemo(() => calcMA(data, 9),  [data]);
  const ma20All = useMemo(() => calcMA(data, 20), [data]);
  const ma50All = useMemo(() => calcMA(data, 50), [data]);
  const rsiAll  = useMemo(() => calcRSI(data, 14), [data]);

  // ── Coordinate helpers ─────────────────────────────────────────────────────
  const toX = useCallback((i: number) => (i + 0.5) * slotW, [slotW]);

  const toY = useCallback((price: number) => {
    if (!stats) return 0;
    return ((stats.maxP - price) / (stats.maxP - stats.minP)) * priceH;
  }, [stats, priceH]);

  const toVolY = useCallback((vol: number) => {
    if (!stats) return volBot;
    return volBot - (vol / stats.maxVol) * (volBot - volTop);
  }, [stats, volBot, volTop]);

  const toRsiY = useCallback((rsi: number) => {
    return rsiTop + ((100 - rsi) / 100) * (rsiBot - rsiTop);
  }, [rsiTop, rsiBot]);

  const tlTimeToX = useCallback((t: number) => {
    const idx = data.findIndex((c) => c.time >= t);
    if (idx < 0) return -1;
    return toX(idx - view.start);
  }, [data, view.start, toX]);

  // ── Build SVG path for an MA line over visible range ──────────────────────
  const buildMAPath = useCallback((maValues: (number | null)[]) => {
    let path = "";
    for (let i = 0; i < visibleData.length; i++) {
      const val = maValues[view.start + i];
      if (val === null) continue;
      const x = toX(i), y = toY(val);
      path += path === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return path;
  }, [visibleData.length, view.start, toX, toY]);

  // ── Build SVG path for RSI line over visible range ────────────────────────
  const buildRSIPath = useCallback(() => {
    let path = "";
    for (let i = 0; i < visibleData.length; i++) {
      const val = rsiAll[view.start + i];
      if (val === null) continue;
      const x = toX(i), y = toRsiY(val);
      path += path === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return path;
  }, [visibleData.length, view.start, rsiAll, toX, toRsiY]);

  // ── Pan / zoom helpers ─────────────────────────────────────────────────────
  const applyZoom = useCallback((cursorSvgX: number, factor: number) => {
    const { start, end } = viewRef.current;
    const currentSpan = end - start + 1;
    const fraction = Math.max(0, Math.min(1, cursorSvgX / innerWRef.current));
    const newSpan   = Math.round(Math.max(10, Math.min(dataLenRef.current, currentSpan * factor)));
    const centerIdx = start + Math.round(fraction * (currentSpan - 1));
    const newStart  = Math.max(0, Math.round(centerIdx - fraction * newSpan));
    const newEnd    = Math.min(dataLenRef.current - 1, newStart + newSpan - 1);
    setView({ start: newStart, end: newEnd });
  }, []);

  const applyPan = useCallback((clientX: number, panStart: { clientX: number; start: number; end: number }) => {
    const el = svgRef.current;
    if (!el) return;
    const rect       = el.getBoundingClientRect();
    const spanLen    = panStart.end - panStart.start;
    const pxPerCandle = rect.width / (spanLen + 1);
    const shift      = -Math.round((clientX - panStart.clientX) / pxPerCandle);
    const newStart   = Math.max(0, Math.min(dataLenRef.current - 1 - spanLen, panStart.start + shift));
    setView({ start: newStart, end: newStart + spanLen });
  }, []);

  // ── Imperative event listeners ─────────────────────────────────────────────
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    const ia = {
      isPanning: false, isPinching: false, isDrawing: false,
      pan:   { clientX: 0, start: 0, end: 0 },
      pinch: { dist: 0, midSvgX: 0, start: 0, end: 0 },
    };

    const clientToSvg = (cx: number, cy: number) => {
      const rect = el.getBoundingClientRect();
      return {
        x: ((cx - rect.left) / rect.width)  * SVG_W,
        y: ((cy - rect.top)  / rect.height) * svgHRef.current,
      };
    };

    const svgXToLocalIdx = (svgX: number) => {
      const { start, end } = viewRef.current;
      const sp = end - start + 1;
      const sw = innerWRef.current / Math.max(1, sp);
      return Math.min(sp - 1, Math.max(0, Math.floor(svgX / sw)));
    };

    const svgYToPrice = (svgY: number) => {
      const s = statsRef.current;
      if (!s) return 0;
      return s.maxP - (svgY / priceHRef.current) * (s.maxP - s.minP);
    };

    // Mouse
    const onMouseDown = (e: MouseEvent) => {
      const { x, y } = clientToSvg(e.clientX, e.clientY);
      const t = toolRef.current;
      if (t === "crosshair") {
        ia.isPanning = true;
        ia.pan = { clientX: e.clientX, start: viewRef.current.start, end: viewRef.current.end };
      } else if (t === "hline") {
        const price = svgYToPrice(y);
        setDrawings(prev => [...prev, { type: "hline", price }]);
      } else if (t === "trendline") {
        const localIdx = svgXToLocalIdx(x);
        const dataIdx  = viewRef.current.start + localIdx;
        const time     = (window as any).__tvData?.[dataIdx]?.time ?? 0;
        const price    = svgYToPrice(y);
        if (!pendingTLRef.current) {
          setPendingTL({ t: time, p: price });
        } else {
          setDrawings(prev => [...prev, { type: "trendline", t1: pendingTLRef.current!.t, p1: pendingTLRef.current!.p, t2: time, p2: price }]);
          setPendingTL(null);
        }
      } else if (t === "pencil") {
        ia.isDrawing = true;
        setPencilPath(`M ${x.toFixed(1)} ${y.toFixed(1)}`);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const { x, y } = clientToSvg(e.clientX, e.clientY);
      setHoverSvg({ x, y });
      setTooltipIdx(svgXToLocalIdx(x));
      if (ia.isPanning && toolRef.current === "crosshair") applyPan(e.clientX, ia.pan);
      else if (ia.isDrawing && toolRef.current === "pencil") setPencilPath(p => `${p} L ${x.toFixed(1)} ${y.toFixed(1)}`);
    };

    const onMouseUp = () => {
      if (ia.isPanning) ia.isPanning = false;
      if (ia.isDrawing) {
        ia.isDrawing = false;
        const path = pencilPathRef.current;
        if (path) { setDrawings(prev => [...prev, { type: "pencil", d: path }]); setPencilPath(""); }
      }
    };

    const onMouseLeave = () => {
      ia.isPanning = false; ia.isDrawing = false;
      setHoverSvg(null); setTooltipIdx(null);
    };

    // Touch
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        ia.isPinching = false; ia.isPanning = true;
        ia.pan = { clientX: e.touches[0].clientX, start: viewRef.current.start, end: viewRef.current.end };
      } else if (e.touches.length >= 2) {
        ia.isPanning = false; ia.isPinching = true;
        const rect = el.getBoundingClientRect();
        const midClientX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        ia.pinch = {
          dist:    touchDist(e.touches[0], e.touches[1]),
          midSvgX: ((midClientX - rect.left) / rect.width) * SVG_W,
          start:   viewRef.current.start,
          end:     viewRef.current.end,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1 && ia.isPanning) {
        applyPan(e.touches[0].clientX, ia.pan);
        const { x, y } = clientToSvg(e.touches[0].clientX, e.touches[0].clientY);
        setHoverSvg({ x, y }); setTooltipIdx(svgXToLocalIdx(x));
      } else if (e.touches.length >= 2 && ia.isPinching) {
        const newDist  = touchDist(e.touches[0], e.touches[1]);
        const factor   = ia.pinch.dist / Math.max(1, newDist);
        const spanLen  = ia.pinch.end - ia.pinch.start;
        const newSpan  = Math.round(Math.max(10, Math.min(dataLenRef.current, spanLen * factor)));
        const fraction = Math.max(0, Math.min(1, ia.pinch.midSvgX / innerWRef.current));
        const centerIdx = ia.pinch.start + Math.round(fraction * spanLen);
        const newStart  = Math.max(0, Math.round(centerIdx - fraction * newSpan));
        setView({ start: newStart, end: Math.min(dataLenRef.current - 1, newStart + newSpan - 1) });
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 0) {
        ia.isPanning = false; ia.isPinching = false;
        setHoverSvg(null); setTooltipIdx(null);
      } else if (e.touches.length === 1 && ia.isPinching) {
        ia.isPinching = false; ia.isPanning = true;
        ia.pan = { clientX: e.touches[0].clientX, start: viewRef.current.start, end: viewRef.current.end };
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect  = el.getBoundingClientRect();
      const svgX  = ((e.clientX - rect.left) / rect.width) * SVG_W;
      applyZoom(svgX, e.deltaY > 0 ? 1.25 : 0.8);
    };

    el.addEventListener("mousedown",  onMouseDown);
    el.addEventListener("mousemove",  onMouseMove);
    el.addEventListener("mouseup",    onMouseUp);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove",  onTouchMove,  { passive: false });
    el.addEventListener("touchend",   onTouchEnd,   { passive: false });
    el.addEventListener("wheel",      onWheel,      { passive: false });

    return () => {
      el.removeEventListener("mousedown",  onMouseDown);
      el.removeEventListener("mousemove",  onMouseMove);
      el.removeEventListener("mouseup",    onMouseUp);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
      el.removeEventListener("touchend",   onTouchEnd);
      el.removeEventListener("wheel",      onWheel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyPan, applyZoom]);

  useEffect(() => {
    (window as any).__tvData = data;
    return () => { delete (window as any).__tvData; };
  }, [data]);

  const zoomBy = (factor: number) => {
    const { start, end } = viewRef.current;
    const mid      = Math.round((start + end) / 2);
    const newSpan  = Math.max(10, Math.min(data.length, Math.round((end - start + 1) * factor)));
    const newStart = Math.max(0, mid - Math.floor(newSpan / 2));
    setView({ start: newStart, end: Math.min(data.length - 1, newStart + newSpan - 1) });
  };

  // ── Early exit ─────────────────────────────────────────────────────────────
  if (!data.length || !stats) {
    return (
      <div className="flex items-center justify-center w-full h-full text-sm" style={{ color: "#8B9CB3" }}>
        No chart data available
      </div>
    );
  }

  // ── Derived render values ──────────────────────────────────────────────────
  const lastCandle   = data[data.length - 1];
  const currentPrice = lastCandle?.close ?? 0;
  const isUp         = currentPrice >= (data[data.length - 2]?.close ?? currentPrice);
  const currentY     = toY(currentPrice);
  const showPriceLine = view.end >= data.length - 1;

  const yTicks = Array.from({ length: GRID + 1 }, (_, i) =>
    stats.minP + ((stats.maxP - stats.minP) * i) / GRID
  ).reverse();

  const timeIdxs: number[] = [];
  const tStep = Math.max(1, Math.floor(span / 6));
  for (let i = 0; i < span; i += tStep) timeIdxs.push(i);
  if (timeIdxs[timeIdxs.length - 1] !== span - 1) timeIdxs.push(span - 1);

  const tooltipCandle = tooltipIdx !== null ? visibleData[tooltipIdx] : null;

  // RSI value at hover
  const hoverRSI = tooltipIdx !== null ? rsiAll[view.start + tooltipIdx] : null;

  // MA paths
  const ma9Path  = showMA9  ? buildMAPath(ma9All)  : "";
  const ma20Path = showMA20 ? buildMAPath(ma20All) : "";
  const ma50Path = showMA50 ? buildMAPath(ma50All) : "";
  const rsiPath  = showRSI  ? buildRSIPath() : "";

  // ── Chart SVG ──────────────────────────────────────────────────────────────
  const chartContent = (
    <div
      className="relative w-full select-none"
      style={{
        background: isFullscreen ? "#000" : "hsl(var(--card))",
        height: isFullscreen ? "100%" : `${svgH}px`,
        overscrollBehavior: "none",
        touchAction: "none",       // ← fixes mobile pan
        overflow: "hidden",
      }}
    >
      {/* OHLC tooltip */}
      {tooltipCandle && hoverSvg && (
        <div
          className="absolute z-20 pointer-events-none rounded-lg px-2.5 py-2 text-xs font-mono space-y-0.5"
          style={{
            background: isFullscreen ? "#111827" : "hsl(var(--background))",
            border: "1px solid #1E2A40",
            top: 8,
            left: Math.min((hoverSvg.x / SVG_W) * 100, 60) + "%",
          }}
        >
          <div style={{ color: "#8B9CB3" }}>{new Date(tooltipCandle.time * 1000).toLocaleString("en-IN")}</div>
          <div className="flex gap-2 flex-wrap">
            <span style={{ color: "#8B9CB3" }}>O</span>
            <span style={{ color: tooltipCandle.close >= tooltipCandle.open ? BULL : BEAR }}>{fmt(tooltipCandle.open)}</span>
            <span style={{ color: "#8B9CB3" }}>H</span>
            <span style={{ color: BULL }}>{fmt(tooltipCandle.high)}</span>
            <span style={{ color: "#8B9CB3" }}>L</span>
            <span style={{ color: BEAR }}>{fmt(tooltipCandle.low)}</span>
            <span style={{ color: "#8B9CB3" }}>C</span>
            <span style={{ color: tooltipCandle.close >= tooltipCandle.open ? BULL : BEAR }}>{fmt(tooltipCandle.close)}</span>
          </div>
          <div style={{ color: "#8B9CB3" }}>Vol: {(tooltipCandle.volume / 1000).toFixed(0)}K</div>
          {showRSI && hoverRSI !== null && (
            <div style={{ color: "#3B82F6" }}>RSI: {hoverRSI.toFixed(1)}</div>
          )}
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${svgH}`}
        width="100%"
        height={svgH}
        style={{ display: "block", touchAction: "none", cursor: tool === "hline" ? "crosshair" : "crosshair", userSelect: "none", WebkitUserSelect: "none" }}
      >
        <rect width={SVG_W} height={svgH} fill={isFullscreen ? "#000" : "hsl(var(--card))"} />

        {/* Price grid */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line x1={0} y1={toY(tick)} x2={innerW} y2={toY(tick)} stroke="#1E2A40" strokeWidth="0.5" strokeDasharray="3 5" />
            <text x={innerW + 4} y={toY(tick) + 4} fill="#8B9CB3" fontSize="10">{fmt(tick)}</text>
          </g>
        ))}

        {/* Volume separator */}
        <line x1={0} y1={volTop - 2} x2={innerW} y2={volTop - 2} stroke="#1E2A40" strokeWidth="0.5" strokeOpacity="0.6" />

        {/* Candles + volume */}
        {visibleData.map((c, i) => {
          const isBull = c.close >= c.open;
          const color  = isBull ? BULL : BEAR;
          const x      = toX(i);
          const bTop   = toY(Math.max(c.open, c.close));
          const bBot   = toY(Math.min(c.open, c.close));
          const bH     = Math.max(1, bBot - bTop);
          const vY     = toVolY(c.volume);
          const wickW  = Math.max(0.8, bodyW * 0.12);
          return (
            <g key={c.time}>
              <line x1={x} y1={toY(c.high)} x2={x} y2={toY(c.low)} stroke={color} strokeWidth={wickW} />
              <rect x={x - bodyW / 2} y={bTop} width={bodyW} height={bH} fill={color} fillOpacity={isBull ? 0.85 : 1} />
              <rect x={x - bodyW / 2} y={vY} width={bodyW} height={Math.max(1, volBot - vY)} fill={color} fillOpacity="0.4" />
            </g>
          );
        })}

        {/* MA lines — clipped to price area */}
        <clipPath id="price-clip"><rect x={0} y={0} width={innerW} height={priceH} /></clipPath>
        <g clipPath="url(#price-clip)">
          {showMA9  && ma9Path  && <path d={ma9Path}  fill="none" stroke="#F59E0B" strokeWidth="1.2" opacity="0.9" />}
          {showMA20 && ma20Path && <path d={ma20Path} fill="none" stroke="#3B82F6" strokeWidth="1.2" opacity="0.9" />}
          {showMA50 && ma50Path && <path d={ma50Path} fill="none" stroke="#A855F7" strokeWidth="1.2" opacity="0.9" />}
        </g>

        {/* RSI panel */}
        {showRSI && (
          <g>
            {/* RSI background */}
            <rect x={0} y={rsiTop} width={innerW} height={rsiBot - rsiTop} fill="#0A0E1A" fillOpacity="0.4" />
            <line x1={0} y1={rsiTop} x2={innerW} y2={rsiTop} stroke="#1E2A40" strokeWidth="0.5" />
            {/* 70 line */}
            <line x1={0} y1={toRsiY(70)} x2={innerW} y2={toRsiY(70)} stroke={BEAR} strokeWidth="0.5" strokeDasharray="3 4" strokeOpacity="0.6" />
            <text x={innerW + 2} y={toRsiY(70) + 4} fill={BEAR} fontSize="9" opacity="0.7">70</text>
            {/* 30 line */}
            <line x1={0} y1={toRsiY(30)} x2={innerW} y2={toRsiY(30)} stroke={BULL} strokeWidth="0.5" strokeDasharray="3 4" strokeOpacity="0.6" />
            <text x={innerW + 2} y={toRsiY(30) + 4} fill={BULL} fontSize="9" opacity="0.7">30</text>
            {/* 50 line */}
            <line x1={0} y1={toRsiY(50)} x2={innerW} y2={toRsiY(50)} stroke="#8B9CB3" strokeWidth="0.4" strokeDasharray="2 5" strokeOpacity="0.3" />
            {/* RSI label */}
            <text x={4} y={rsiTop + 10} fill="#3B82F6" fontSize="9" fontWeight="600">RSI(14)</text>
            {/* RSI line */}
            <clipPath id="rsi-clip"><rect x={0} y={rsiTop} width={innerW} height={rsiBot - rsiTop} /></clipPath>
            <g clipPath="url(#rsi-clip)">
              {rsiPath && <path d={rsiPath} fill="none" stroke="#3B82F6" strokeWidth="1.5" />}
            </g>
          </g>
        )}

        {/* Crosshair */}
        {hoverSvg && tooltipIdx !== null && (
          <>
            <line x1={hoverSvg.x} y1={0} x2={hoverSvg.x} y2={svgH - TIME_LBL_H} stroke="#8B9CB3" strokeWidth="0.5" strokeDasharray="3 4" strokeOpacity="0.5" />
            <line x1={0} y1={hoverSvg.y} x2={innerW} y2={hoverSvg.y} stroke="#8B9CB3" strokeWidth="0.5" strokeDasharray="3 4" strokeOpacity="0.5" />
          </>
        )}

        {/* Current price line */}
        {showPriceLine && (
          <>
            <line x1={0} y1={currentY} x2={innerW} y2={currentY} stroke={isUp ? BULL : BEAR} strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.85" />
            <rect x={innerW} y={currentY - 9} width={PRICE_LBL_W} height={18} fill={isUp ? BULL : BEAR} rx="3" />
            <text x={innerW + PRICE_LBL_W / 2} y={currentY + 4} fill={isUp ? "#0A0E1A" : "#fff"} fontSize="10" fontWeight="700" textAnchor="middle">
              {fmt(currentPrice)}
            </text>
          </>
        )}

        {/* Time labels */}
        {timeIdxs.map((i) => visibleData[i] ? (
          <text key={i} x={toX(i)} y={svgH - 6} fill="#8B9CB3" fontSize="10" textAnchor="middle">
            {fmtTime(visibleData[i].time, span)}
          </text>
        ) : null)}

        {/* Drawings — clipped to price area */}
        <clipPath id="chart-clip"><rect x={0} y={0} width={innerW} height={priceH} /></clipPath>
        <g clipPath="url(#chart-clip)">
          {drawings.map((d, i) => {
            if (d.type === "pencil") {
              return <path key={i} d={d.d} fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />;
            }
            if (d.type === "hline") {
              const y = toY(d.price);
              return (
                <g key={i}>
                  <line x1={0} y1={y} x2={innerW} y2={y} stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 3" opacity="0.8" />
                  <text x={4} y={y - 3} fill="#F59E0B" fontSize="9" opacity="0.8">{fmt(d.price)}</text>
                </g>
              );
            }
            // trendline
            const x1 = tlTimeToX(d.t1), y1 = toY(d.p1);
            const x2 = tlTimeToX(d.t2), y2 = toY(d.p2);
            if (x1 < 0 && x2 < 0) return null;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F59E0B" strokeWidth="1.5" />;
          })}
          {pencilPath && <path d={pencilPath} fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />}
          {pendingTL && <circle cx={tlTimeToX(pendingTL.t)} cy={toY(pendingTL.p)} r="4" fill="#F59E0B" />}
          {pendingTL && hoverSvg && (
            <line x1={tlTimeToX(pendingTL.t)} y1={toY(pendingTL.p)} x2={hoverSvg.x} y2={hoverSvg.y} stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
          )}
        </g>
      </svg>
    </div>
  );

  // ── MA legend badges ───────────────────────────────────────────────────────
  const maLegend = (
    <div className="flex items-center gap-1.5 flex-wrap">
      {[
        { label: "MA9",  color: "#F59E0B", show: showMA9,  toggle: () => setShowMA9(v => !v) },
        { label: "MA20", color: "#3B82F6", show: showMA20, toggle: () => setShowMA20(v => !v) },
        { label: "MA50", color: "#A855F7", show: showMA50, toggle: () => setShowMA50(v => !v) },
      ].map(({ label, color, show, toggle }) => (
        <button
          key={label}
          onClick={toggle}
          className="px-2 py-0.5 rounded text-xs font-bold transition-all"
          style={{
            background: show ? `${color}22` : "transparent",
            color: show ? color : "#4A5568",
            border: `1px solid ${show ? color : "#1E2A40"}`,
          }}
        >
          {label}
        </button>
      ))}
      <button
        onClick={() => setShowRSI(v => !v)}
        className="px-2 py-0.5 rounded text-xs font-bold transition-all"
        style={{
          background: showRSI ? "#3B82F622" : "transparent",
          color: showRSI ? "#3B82F6" : "#4A5568",
          border: `1px solid ${showRSI ? "#3B82F6" : "#1E2A40"}`,
        }}
      >
        RSI
      </button>
    </div>
  );

  // ── Toolbar ────────────────────────────────────────────────────────────────
  const toolbar = (
    <div
      className="flex items-center gap-1 px-2 py-1.5 rounded-xl flex-wrap"
      style={{ background: isFullscreen ? "#111" : "hsl(var(--secondary))", border: "1px solid #1E2A40" }}
    >
      {([
        { t: "crosshair" as Tool, Icon: Crosshair,      label: "Pan / Zoom" },
        { t: "trendline" as Tool, Icon: TrendingUp,     label: "Trend Line" },
        { t: "pencil"    as Tool, Icon: Pencil,         label: "Draw" },
        { t: "hline"     as Tool, Icon: MoveHorizontal, label: "H-Line" },
      ]).map(({ t, Icon, label }) => (
        <button key={t} onClick={() => { setTool(t); setPendingTL(null); }} title={label}
          className="p-1.5 rounded-lg transition-all"
          style={{ background: tool === t ? "#00D897" : "transparent", color: tool === t ? "#0A0E1A" : "#8B9CB3" }}>
          <Icon className="h-4 w-4" />
        </button>
      ))}

      <div className="w-px h-4 mx-1" style={{ background: "#1E2A40" }} />
      <button onClick={() => zoomBy(0.75)} title="Zoom In"  className="p-1.5 rounded-lg" style={{ color: "#8B9CB3" }}><Plus  className="h-4 w-4" /></button>
      <button onClick={() => zoomBy(1.33)} title="Zoom Out" className="p-1.5 rounded-lg" style={{ color: "#8B9CB3" }}><Minus className="h-4 w-4" /></button>
      <div className="w-px h-4 mx-1" style={{ background: "#1E2A40" }} />

      {maLegend}

      <div className="w-px h-4 mx-1" style={{ background: "#1E2A40" }} />
      <button onClick={() => { setDrawings([]); setPendingTL(null); setPencilPath(""); }}
        title="Clear drawings" className="p-1.5 rounded-lg" style={{ color: "#8B9CB3" }}>
        <Trash2 className="h-4 w-4" />
      </button>

      {view.end < data.length - 1 && (
        <button
          onClick={() => { const end = data.length - 1; setView({ start: Math.max(0, end - (view.end - view.start)), end }); }}
          className="px-2 py-1 rounded-lg text-xs font-semibold ml-1"
          style={{ background: "#1A2540", color: "#00D897" }}
        >
          Latest →
        </button>
      )}

      <button onClick={() => setIsFullscreen(f => !f)} title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        className="p-1.5 rounded-lg ml-auto" style={{ color: "#8B9CB3" }}>
        {isFullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#000", touchAction: "none" }}>
        <div className="px-3 pt-2 pb-1">{toolbar}</div>
        <div className="flex-1 overflow-hidden">{chartContent}</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chartContent}
      {toolbar}
    </div>
  );
}
