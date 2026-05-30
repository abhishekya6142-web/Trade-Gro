import { useState } from "react";
import { ArrowLeft, Clock, ChevronRight, BookOpen } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { Link, useLocation, useParams } from "wouter";

const LEARN_TOPICS = [
  {
    title: "Candlestick Patterns",
    emoji: "🕯️",
    desc: "Read candles like a pro",
    slug: "candlestick-patterns",
    color: "#FF6B35",
    lessons: [
      {
        name: "What is a Candlestick?",
        duration: "3 min",
        content: `A candlestick shows 4 price points: Open, High, Low, Close.

🟢 Green candle = Close > Open (Bullish)
🔴 Red candle = Close < Open (Bearish)

The body shows Open-Close range.
The wick shows High-Low range.

Key Rule: Long green body = strong buying. Long red body = strong selling.`
      },
      {
        name: "Bullish Engulfing",
        duration: "4 min",
        content: `A Bullish Engulfing pattern signals a reversal from downtrend to uptrend.

How to identify:
• Day 1: Small red candle
• Day 2: Large green candle that completely covers Day 1

What it means: Buyers took full control. Strong buy signal when found at support levels.

📌 Best used at: Bottom of downtrend, near support zone.`
      },
      {
        name: "Bearish Engulfing",
        duration: "4 min",
        content: `A Bearish Engulfing pattern signals a reversal from uptrend to downtrend.

How to identify:
• Day 1: Small green candle
• Day 2: Large red candle that completely covers Day 1

What it means: Sellers took full control. Strong sell signal when found at resistance levels.

📌 Best used at: Top of uptrend, near resistance zone.`
      },
      {
        name: "Doji Patterns",
        duration: "5 min",
        content: `A Doji forms when Open and Close are almost equal — showing indecision.

Types of Doji:
• Standard Doji: Cross shape — market undecided
• Dragonfly Doji: T shape — possible bullish reversal
• Gravestone Doji: Inverted T — possible bearish reversal

📌 Key Rule: Doji alone is not a signal. Wait for the next candle to confirm direction.`
      },
      {
        name: "Hammer & Shooting Star",
        duration: "5 min",
        content: `🔨 Hammer (Bullish):
• Small body at top
• Long lower wick (2x body)
• Found at bottom of downtrend
• Means: Sellers tried to push down but buyers came back strong

⭐ Shooting Star (Bearish):
• Small body at bottom
• Long upper wick (2x body)
• Found at top of uptrend
• Means: Buyers tried to push up but sellers rejected it

📌 Always confirm with next candle!`
      },
      {
        name: "Morning & Evening Star",
        duration: "6 min",
        content: `🌅 Morning Star (Bullish Reversal — 3 candles):
1. Large red candle
2. Small candle (gap down)
3. Large green candle

Means: Downtrend ending, bulls taking over.

🌆 Evening Star (Bearish Reversal — 3 candles):
1. Large green candle
2. Small candle (gap up)
3. Large red candle

Means: Uptrend ending, bears taking over.

📌 One of the most reliable reversal patterns!`
      },
    ],
  },
  {
    title: "Chart Patterns",
    emoji: "📈",
    desc: "Head & shoulders, flags...",
    slug: "chart-patterns",
    color: "#00D897",
    lessons: [
      {
        name: "Support & Resistance",
        duration: "4 min",
        content: `Support and Resistance are the foundation of technical analysis.

📗 Support: Price level where stock STOPS falling and bounces up.
• Buyers are strong here
• Good area to BUY

📕 Resistance: Price level where stock STOPS rising and falls down.
• Sellers are strong here
• Good area to SELL or book profit

📌 Key Rule: Old resistance becomes new support after breakout!`
      },
      {
        name: "Head & Shoulders",
        duration: "5 min",
        content: `Head & Shoulders is one of the most reliable reversal patterns.

Structure:
• Left Shoulder: Price rises then falls
• Head: Price rises higher then falls
• Right Shoulder: Price rises less than head then falls
• Neckline: Connect the two lows

Signal: When price breaks below neckline → Strong SELL signal

📌 Target = Distance from head to neckline, projected downward.`
      },
      {
        name: "Double Top & Bottom",
        duration: "5 min",
        content: `🔴 Double Top (Bearish):
• Price hits same high TWICE
• Can't break above resistance
• Break below neckline = SELL signal

🟢 Double Bottom (Bullish):
• Price hits same low TWICE
• Can't break below support
• Break above neckline = BUY signal

📌 The more times price tests a level without breaking, the stronger the signal when it finally reverses!`
      },
      {
        name: "Bull & Bear Flags",
        duration: "4 min",
        content: `Flags are continuation patterns — trend pauses then continues.

🟢 Bull Flag:
• Strong upward move (flagpole)
• Small downward consolidation (flag)
• Breakout upward = BUY
• Target = flagpole length added to breakout

🔴 Bear Flag:
• Strong downward move (flagpole)
• Small upward consolidation (flag)
• Breakout downward = SELL

📌 Flags are high probability trades with clear entry and target!`
      },
      {
        name: "Triangle Patterns",
        duration: "6 min",
        content: `Triangles form when price makes lower highs and higher lows.

📐 Ascending Triangle (Bullish):
• Flat top resistance + rising support
• Breakout usually upward

📐 Descending Triangle (Bearish):
• Flat bottom support + falling resistance
• Breakout usually downward

📐 Symmetrical Triangle:
• Both sides converging
• Breakout can go either way — wait for confirmation

📌 Volume should decrease inside triangle and spike on breakout!`
      },
      {
        name: "Cup & Handle",
        duration: "5 min",
        content: `Cup & Handle is a bullish continuation pattern.

Structure:
• Cup: Rounded U-shape bottom (weeks to months)
• Handle: Small downward drift after cup
• Breakout: Price breaks above cup rim

What it means: Stock consolidated, weak hands shaken out, ready for big move up.

📌 The longer the cup formation, the stronger the breakout! Best with high volume on breakout.`
      },
    ],
  },
  {
    title: "Volume Analysis",
    emoji: "📊",
    desc: "Track smart money flow",
    slug: "volume-analysis",
    color: "#4ECDC4",
    lessons: [
      {
        name: "What is Volume?",
        duration: "3 min",
        content: `Volume = Number of shares traded in a given period.

Why it matters:
• High volume = Strong conviction (big players active)
• Low volume = Weak move (may reverse)

Golden Rules:
✅ Price up + Volume up = Strong uptrend
✅ Price down + Volume up = Strong downtrend
⚠️ Price up + Volume down = Weak rally (be careful)
⚠️ Price down + Volume down = Weak selling (may bounce)

📌 Never trade a breakout without volume confirmation!`
      },
      {
        name: "Volume Confirms Trend",
        duration: "4 min",
        content: `Volume should INCREASE in the direction of the trend.

In Uptrend:
• Up days should have HIGHER volume
• Down days should have LOWER volume
• This confirms bulls are in control

In Downtrend:
• Down days should have HIGHER volume
• Up days should have LOWER volume
• This confirms bears are in control

📌 If volume doesn't confirm price, the trend may be weakening!`
      },
      {
        name: "Volume Divergence",
        duration: "5 min",
        content: `Divergence = Price and volume moving in opposite directions.

🚨 Bearish Divergence:
• Price making new highs
• Volume getting lower
• Warning: Rally losing strength, reversal coming

🚨 Bullish Divergence:
• Price making new lows
• Volume getting lower
• Warning: Selling losing strength, bounce coming

📌 Divergence is an early warning system — act before the crowd!`
      },
      {
        name: "OBV Indicator",
        duration: "4 min",
        content: `OBV (On Balance Volume) tracks cumulative buying and selling pressure.

How it works:
• Price up today → Add today's volume to OBV
• Price down today → Subtract today's volume from OBV

Signals:
✅ OBV rising + Price rising = Strong uptrend confirmed
✅ OBV rising + Price flat = Accumulation, breakout coming soon
⚠️ OBV falling + Price rising = Distribution, reversal warning

📌 OBV often leads price — watch it for early signals!`
      },
      {
        name: "Volume Profile Basics",
        duration: "6 min",
        content: `Volume Profile shows how much volume traded at each PRICE LEVEL.

Key concepts:
• POC (Point of Control): Price level with MOST volume — strongest support/resistance
• Value Area: Range where 70% of volume traded
• HVN (High Volume Node): Strong support/resistance levels
• LVN (Low Volume Node): Price moves fast through these areas

How to use:
• Buy near HVN support
• Sell near HVN resistance
• Expect fast moves through LVN zones

📌 Volume Profile reveals where big players actually traded!`
      },
    ],
  },
  {
    title: "Price Action",
    emoji: "💹",
    desc: "Trade without indicators",
    slug: "price-action",
    color: "#FFE66D",
    lessons: [
      {
        name: "What is Price Action?",
        duration: "3 min",
        content: `Price Action trading means reading the raw price chart — no indicators needed.

Why it works:
• Price reflects ALL information instantly
• Indicators are lagging (they follow price)
• Price Action traders see moves FIRST

Core tools:
• Candlestick patterns
• Support & Resistance
• Trend lines
• Market structure

📌 Master Price Action and you won't need 10 indicators on your chart!`
      },
      {
        name: "Higher Highs & Lower Lows",
        duration: "4 min",
        content: `Market structure is the foundation of Price Action.

📈 Uptrend = Higher Highs (HH) + Higher Lows (HL):
• Each rally goes higher than last
• Each pullback stays above last low
• TRADE: Buy at Higher Lows

📉 Downtrend = Lower Highs (LH) + Lower Lows (LL):
• Each drop goes lower than last
• Each bounce stays below last high
• TRADE: Sell at Lower Highs

📌 Never fight the trend structure — trade WITH it!`
      },
      {
        name: "Break of Structure",
        duration: "5 min",
        content: `Break of Structure (BOS) signals trend change.

🔄 Bullish BOS:
• Price in downtrend (LH + LL)
• Price breaks ABOVE last Lower High
• Trend may be shifting bullish
• Look for buy opportunities

🔄 Bearish BOS:
• Price in uptrend (HH + HL)
• Price breaks BELOW last Higher Low
• Trend may be shifting bearish
• Look for sell opportunities

📌 BOS + volume spike = high probability trade setup!`
      },
      {
        name: "Inside Bar Strategy",
        duration: "4 min",
        content: `An Inside Bar forms when a candle is completely within the previous candle's range.

What it means:
• Market is consolidating
• Big move coming soon
• Direction unknown — wait for breakout

Trading the Inside Bar:
• Place BUY order above mother bar high
• Place SELL order below mother bar low
• Whichever breaks first = your trade direction

📌 Inside bars on higher timeframes (Daily/Weekly) give the strongest signals!`
      },
      {
        name: "Pin Bar Setup",
        duration: "5 min",
        content: `Pin Bar = Long wick, small body — shows strong rejection of a price level.

🟢 Bullish Pin Bar:
• Long lower wick
• Found at support
• Shows buyers rejected lower prices
• Trade: Buy above pin bar high

🔴 Bearish Pin Bar:
• Long upper wick
• Found at resistance
• Shows sellers rejected higher prices
• Trade: Sell below pin bar low

📌 Best Pin Bars form at key S/R levels with confluence from trend direction!`
      },
    ],
  },
  {
    title: "Liquidity Zones",
    emoji: "🌊",
    desc: "Find hidden support levels",
    slug: "liquidity-zones",
    color: "#A8EDEA",
    lessons: [
      {
        name: "What is Liquidity?",
        duration: "3 min",
        content: `Liquidity = Areas where many buy/sell orders are waiting.

Why big players need liquidity:
• Institutions trade HUGE sizes
• They need many orders on other side to fill their trades
• They hunt areas where retail traders placed stop losses

Where liquidity hides:
• Above recent highs (buy stops)
• Below recent lows (sell stops)
• At round numbers (₹100, ₹500, ₹1000)
• At obvious support/resistance levels

📌 Banks and institutions MOVE price to grab liquidity before reversing!`
      },
      {
        name: "Equal Highs & Lows",
        duration: "4 min",
        content: `Equal Highs and Equal Lows are liquidity magnets.

📍 Equal Highs:
• Price tests same high level twice/thrice
• Many stop losses sitting just above
• Institutions push price up to grab them
• Then price reverses DOWN

📍 Equal Lows:
• Price tests same low level twice/thrice
• Many stop losses sitting just below
• Institutions push price down to grab them
• Then price reverses UP

📌 When you see equal highs/lows — expect a stop hunt before the real move!`
      },
      {
        name: "Stop Hunt Patterns",
        duration: "5 min",
        content: `Stop Hunts = Price spikes past a key level briefly then reverses sharply.

How it looks:
• Price breaks support/resistance with a wick
• Looks like a breakout
• Most retail traders get stopped out
• Price immediately reverses the other way

How to trade it:
• Don't enter on the first breakout of a key level
• Wait for price to come back inside the range
• Enter after the fake breakout candle closes
• Stop loss: beyond the spike wick

📌 If a breakout fails immediately — it's likely a stop hunt. Trade the reversal!`
      },
      {
        name: "Order Blocks",
        duration: "6 min",
        content: `Order Blocks are zones where institutions placed large orders.

How to find them:
• Look for the LAST candle before a big move up (Bullish OB)
• Look for the LAST candle before a big move down (Bearish OB)
• These zones act as future support/resistance

🟢 Bullish Order Block:
• Last red candle before strong up move
• Price returns here → likely to bounce up

🔴 Bearish Order Block:
• Last green candle before strong down move
• Price returns here → likely to drop

📌 Order Blocks work because institutions re-enter at the same price levels!`
      },
      {
        name: "Fair Value Gaps",
        duration: "5 min",
        content: `Fair Value Gap (FVG) = Price moved so fast it left a gap with no trading.

How it forms:
• Candle 1 and Candle 3 don't overlap
• Middle candle created a gap
• Market often returns to "fill" this gap

🟢 Bullish FVG:
• Gap formed during upward move
• Acts as support when price returns
• Look for buys in this zone

🔴 Bearish FVG:
• Gap formed during downward move
• Acts as resistance when price returns
• Look for sells in this zone

📌 FVGs show where price moved inefficiently — market loves to come back and rebalance!`
      },
    ],
  },
  {
    title: "Risk Management",
    emoji: "🛡️",
    desc: "Protect your capital",
    slug: "risk-management",
    color: "#FF4757",
    lessons: [
      {
        name: "1% Rule Explained",
        duration: "3 min",
        content: `The 1% Rule: Never risk more than 1% of your total capital on a single trade.

Example with ₹10,00,000:
• Max risk per trade = ₹10,000
• Even 10 losses in a row = only 10% drawdown
• You still have ₹9,00,000 to recover

Why it works:
• Protects from emotional decisions
• Keeps you in the game long term
• Allows recovery from losing streaks

📌 Professional traders survive by managing losses — not by winning every trade!`
      },
      {
        name: "Stop Loss Placement",
        duration: "4 min",
        content: `A Stop Loss automatically exits your trade to limit losses.

Where to place Stop Loss:
✅ Below support (for buy trades)
✅ Above resistance (for sell trades)
✅ Below the wick of entry candle
✅ Beyond key swing high/low

Common mistakes:
❌ Random stop loss (₹X fixed amount)
❌ Too tight (gets hit by normal volatility)
❌ No stop loss at all (account killer!)

📌 Place stop loss at a level where your trade idea is PROVEN WRONG — not just uncomfortable!`
      },
      {
        name: "Risk Reward Ratio",
        duration: "4 min",
        content: `Risk Reward Ratio (RRR) = How much you make vs how much you risk.

Example:
• Risk: ₹5,000 (stop loss)
• Reward: ₹15,000 (target)
• RRR = 1:3

Minimum RRR to aim for: 1:2

The math:
• Even with 40% win rate at 1:2 RRR = PROFITABLE
• Win 4/10 trades: +4×2 = +8 units
• Lose 6/10 trades: -6×1 = -6 units
• Net = +2 units profit!

📌 Good RRR means you don't need to win most trades to be profitable!`
      },
      {
        name: "Position Sizing",
        duration: "5 min",
        content: `Position Sizing = How many shares to buy based on your risk.

Formula:
Position Size = (Capital × Risk%) ÷ (Entry - Stop Loss)

Example:
• Capital: ₹10,00,000
• Risk: 1% = ₹10,000
• Entry: ₹500, Stop Loss: ₹480
• Risk per share: ₹20
• Position Size: ₹10,000 ÷ ₹20 = 500 shares

📌 Always calculate position size BEFORE entering — never "just buy some and see"!`
      },
      {
        name: "Managing Drawdowns",
        duration: "5 min",
        content: `Drawdown = How much your account is down from its peak.

Recovery math (why small drawdowns matter):
• -10% drawdown → Need +11% to recover
• -25% drawdown → Need +33% to recover
• -50% drawdown → Need +100% to recover!

Rules during drawdown:
• Reduce position size by 50%
• Stop trading if down 20% in a month
• Review your strategy — don't revenge trade
• Never try to "make it back quickly"

📌 The goal is to stay in the game. Small consistent gains beat big losses every time!`
      },
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
            ← Back to Learn
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

          {/* Lesson Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setSelectedLesson(null)}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#0F1629", border: "1px solid #1E2A40" }}
            >
              <ArrowLeft className="h-4 w-4 text-white" />
            </button>
            <div>
              <p className="text-xs" style={{ color: topic.color }}>{topic.title}</p>
              <h1 className="text-lg font-bold text-white">{lesson.name}</h1>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {topic.lessons.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full"
                style={{
                  background: i <= selectedLesson ? topic.color : "#1E2A40",
                }}
              />
            ))}
          </div>

          {/* Lesson Content */}
          <div
            className="rounded-2xl p-5 mb-6"
            style={{ background: "#0F1629", border: "1px solid #1E2A40" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-3.5 w-3.5" style={{ color: "#8B9CB3" }} />
              <span className="text-xs" style={{ color: "#8B9CB3" }}>{lesson.duration} read</span>
            </div>
            <div className="text-sm text-white leading-relaxed whitespace-pre-line">
              {lesson.content}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
              {selectedLesson > 0 && (
              <button
                onClick={() => setSelectedLesson(selectedLesson - 1)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ background: "#0F1629", border: "1px solid #1E2A40", color: "#8B9CB3" }}
              >
                ← Previous
              </button>
            )}
            {selectedLesson < topic.lessons.length - 1 ? (
              <button
                onClick={() => setSelectedLesson(selectedLesson + 1)}
                className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ background: topic.color, color: "#0A0E1A" }}
              >
                Next Lesson →
              </button>
            ) : (
              <button
                onClick={() => setLocation("/learn")}
                className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ background: topic.color, color: "#0A0E1A" }}
              >
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

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation("/learn")}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "#0F1629", border: "1px solid #1E2A40" }}
          >
            <ArrowLeft className="h-4 w-4 text-white" />
          </button>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${topic.color}20` }}
          >
            {topic.emoji}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{topic.title}</h1>
            <p className="text-xs" style={{ color: "#8B9CB3" }}>{topic.lessons.length} lessons</p>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-2">
          {topic.lessons.map((lesson, i) => (
            <button
              key={i}
              onClick={() => setSelectedLesson(i)}
              className="w-full flex items-center justify-between p-4 rounded-xl transition-all active:scale-95"
              style={{ background: "#0F1629", border: "1px solid #1E2A40" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: `${topic.color}20`, color: topic.color }}
                >
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
              <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "#8B9CB3" }} />
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
