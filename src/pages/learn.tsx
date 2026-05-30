import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

const LEARN_TOPICS = [
  {
    title: "Candlestick Patterns",
    emoji: "🕯️",
    desc: "Read candles like a pro",
    slug: "candlestick-patterns",
    color: "#FF6B35",
    lessons: [
      { name: "What is a Candlestick?", duration: "3 min" },
      { name: "Bullish Engulfing", duration: "4 min" },
      { name: "Bearish Engulfing", duration: "4 min" },
      { name: "Doji Patterns", duration: "5 min" },
      { name: "Hammer & Shooting Star", duration: "5 min" },
      { name: "Morning & Evening Star", duration: "6 min" },
    ],
  },
  {
    title: "Chart Patterns",
    emoji: "📈",
    desc: "Head & shoulders, flags...",
    slug: "chart-patterns",
    color: "#00D897",
    lessons: [
      { name: "Support & Resistance", duration: "4 min" },
      { name: "Head & Shoulders", duration: "5 min" },
      { name: "Double Top & Bottom", duration: "5 min" },
      { name: "Bull & Bear Flags", duration: "4 min" },
      { name: "Triangle Patterns", duration: "6 min" },
      { name: "Cup & Handle", duration: "5 min" },
    ],
  },
  {
    title: "Volume Analysis",
    emoji: "📊",
    desc: "Track smart money flow",
    slug: "volume-analysis",
    color: "#4ECDC4",
    lessons: [
      { name: "What is Volume?", duration: "3 min" },
      { name: "Volume Confirms Trend", duration: "4 min" },
      { name: "Volume Divergence", duration: "5 min" },
      { name: "OBV Indicator", duration: "4 min" },
      { name: "Volume Profile Basics", duration: "6 min" },
    ],
  },
  {
    title: "Price Action",
    emoji: "💹",
    desc: "Trade without indicators",
    slug: "price-action",
    color: "#FFE66D",
    lessons: [
      { name: "What is Price Action?", duration: "3 min" },
      { name: "Higher Highs & Lower Lows", duration: "4 min" },
      { name: "Break of Structure", duration: "5 min" },
      { name: "Inside Bar Strategy", duration: "4 min" },
      { name: "Pin Bar Setup", duration: "5 min" },
    ],
  },
  {
    title: "Liquidity Zones",
    emoji: "🌊",
    desc: "Find hidden support levels",
    slug: "liquidity-zones",
    color: "#A8EDEA",
    lessons: [
      { name: "What is Liquidity?", duration: "3 min" },
      { name: "Equal Highs & Lows", duration: "4 min" },
      { name: "Stop Hunt Patterns", duration: "5 min" },
      { name: "Order Blocks", duration: "6 min" },
      { name: "Fair Value Gaps", duration: "5 min" },
    ],
  },
  {
    title: "Risk Management",
    emoji: "🛡️",
    desc: "Protect your capital",
    slug: "risk-management",
    color: "#FF4757",
    lessons: [
      { name: "1% Rule Explained", duration: "3 min" },
      { name: "Stop Loss Placement", duration: "4 min" },
      { name: "Risk Reward Ratio", duration: "4 min" },
      { name: "Position Sizing", duration: "5 min" },
      { name: "Managing Drawdowns", duration: "5 min" },
    ],
  },
];

export default function Learn() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen" style={{ background: "#0A0E1A" }}>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation("/dashboard")}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "#0F1629", border: "1px solid #1E2A40" }}
          >
            <ArrowLeft className="h-4 w-4 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Learn Trading</h1>
            <p className="text-xs" style={{ color: "#8B9CB3" }}>6 topics · 32 lessons</p>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {LEARN_TOPICS.map((topic) => (
            <Link key={topic.slug} href={`/learn/${topic.slug}`}>
              <div
                className="p-4 rounded-xl cursor-pointer transition-all active:scale-95"
                style={{ background: "#0F1629", border: "1px solid #1E2A40" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                  style={{ background: `${topic.color}20` }}
                >
                  {topic.emoji}
                </div>
                <p className="text-sm font-bold text-white">{topic.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "#8B9CB3" }}>{topic.desc}</p>
                <p className="text-xs mt-2 font-semibold" style={{ color: topic.color }}>
                  {topic.lessons.length} lessons →
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

export { LEARN_TOPICS };
