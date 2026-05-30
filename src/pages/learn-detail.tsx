import { useState } from "react";
import { ArrowLeft, Clock, ChevronRight } from "lucide-react";
import { useLocation, useParams } from "wouter";

const LEARN_TOPICS = [
  {
    title: "Candlestick Patterns",
    slug: "candlestick-patterns",
    color: "#FF6B35",
    emoji: "🕯️",
    lessons: [
      { name: "What is a Candlestick?", duration: "3 min", content: "A candlestick shows Open, High, Low, Close prices." },
      { name: "Bullish Engulfing", duration: "4 min", content: "Large green candle covers previous red candle. Strong buy signal." },
    ],
  },
  {
    title: "Chart Patterns",
    slug: "chart-patterns",
    color: "#00D897",
    emoji: "📈",
    lessons: [
      { name: "Support & Resistance", duration: "4 min", content: "Support is where price bounces up. Resistance is where price falls." },
    ],
  },
  {
    title: "Volume Analysis",
    slug: "volume-analysis",
    color: "#4ECDC4",
    emoji: "📊",
    lessons: [
      { name: "What is Volume?", duration: "3 min", content: "Volume = shares traded. High volume confirms strong moves." },
    ],
  },
  {
    title: "Price Action",
    slug: "price-action",
    color: "#FFE66D",
    emoji: "💹",
    lessons: [
      { name: "What is Price Action?", duration: "3 min", content: "Trading using only raw price chart without indicators." },
    ],
  },
  {
    title: "Liquidity Zones",
    slug: "liquidity-zones",
    color: "#A8EDEA",
    emoji: "🌊",
    lessons: [
      { name: "What is Liquidity?", duration: "3 min", content: "Liquidity is where many orders are waiting to be filled." },
    ],
  },
  {
    title: "Risk Management",
    slug: "risk-management",
    color: "#FF4757",
    emoji: "🛡️",
    lessons: [
      { name: "1% Rule", duration: "3 min", content: "Never risk more than 1% of capital on a single trade." },
    ],
  },
];

export default function LearnDetail() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  const topic = LEARN_TOPICS.find((t) => t.slug === slug);

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0E1A" }}>
        <div className="text-center">
          <p className="text-white text-lg font-bold">Topic not found</p>
          <button onClick={() => setLocation("/learn")} className="mt-4 text-sm" style={{ color: "#00D897" }}>
            Back to Learn
          </button>
        </div>
      </div>
    );
  }

  if (selectedLesson !== null) {
    const lesson = topic.lessons[selectedLesson];
    return (
      <div className="min-h-screen" style={{ background: "#0A0E1A" }}>
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setSelectedLesson(null)}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#0F1629", border: "1px solid #1E2A40" }}
            >
              <ArrowLeft className="h-4 w-4 text-white" />
            </button>
            <div>
              <p className="text-xs" style={{ color: topic.color }}>{topic.title}</p>
              <h1 className="text-lg font-bold text-white">{lesson.name}</h1>
            </div>
          </div>
          <div className="flex gap-1 mb-6">
            {topic.lessons.map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full"
                style={{ background: i <= selectedLesson ? topic.color : "#1E2A40" }} />
            ))}
          </div>
          <div className="rounded-2xl p-5 mb-6"
            style={{ background: "#0F1629", border: "1px solid #1E2A40" }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-3.5 w-3.5" style={{ color: "#8B9CB3" }} />
              <span className="text-xs" style={{ color: "#8B9CB3" }}>{lesson.duration}</span>
            </div>
            <p className="text-sm text-white leading-relaxed">{lesson.content}</p>
          </div>
          <div className="flex gap-3">
            {selectedLesson > 0 && (
              <button onClick={() => setSelectedLesson(selectedLesson - 1)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ background: "#0F1629", border: "1px solid #1E2A40", color: "#8B9CB3" }}>
                ← Previous
              </button>
            )}
            {selectedLesson < topic.lessons.length - 1 ? (
              <button onClick={() => setSelectedLesson(selectedLesson + 1)}
                className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ background: topic.color, color: "#0A0E1A" }}>
                Next →
              </button>
            ) : (
              <button onClick={() => setLocation("/learn")}
                className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ background: topic.color, color: "#0A0E1A" }}>
                ✅ Complete!
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0A0E1A" }}>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/learn")}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "#0F1629", border: "1px solid #1E2A40" }}>
            <ArrowLeft className="h-4 w-4 text-white" />
          </button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${topic.color}20` }}>
            {topic.emoji}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{topic.title}</h1>
            <p className="text-xs" style={{ color: "#8B9CB3" }}>{topic.lessons.length} lessons</p>
          </div>
        </div>
        <div className="space-y-2">
          {topic.lessons.map((lesson, i) => (
            <button key={i} onClick={() => setSelectedLesson(i)}
              className="w-full flex items-center justify-between p-4 rounded-xl"
              style={{ background: "#0F1629", border: "1px solid #1E2A40" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ background: `${topic.color}20`, color: topic.color }}>
                  {i + 1}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{lesson.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" style={{ color: "#8B9CB3" }} />
                    <span className="text-xs" style={{ color: "#8B9CB3" }}>{lesson.duration}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4" style={{ color: "#8B9CB3" }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
                                                                             }
