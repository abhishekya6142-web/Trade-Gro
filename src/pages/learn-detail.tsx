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
      {
        name: "What is a Candlestick?",
        duration: "3 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Candlestick_chart_scheme_03-en.svg/800px-Candlestick_chart_scheme_03-en.svg.png",
        content: `A candlestick shows 4 price points: Open, High, Low, Close.

🟢 Green candle = Close > Open (Bullish)
🔴 Red candle = Close < Open (Bearish)

The BODY shows the Open-Close range.
The WICK (shadow) shows the High-Low range.

📌 Key Rule: Long green body = strong buying pressure. Long red body = strong selling pressure.`,
      },
      {
        name: "Bullish Engulfing",
        duration: "4 min",
        image: "https://chartschool.stockcharts.com/school/uploads/Candlesticks/BullishEngulfing2.png",
        content: `A Bullish Engulfing pattern signals reversal from downtrend to uptrend.

How to identify:
• Day 1: Small red candle
• Day 2: Large green candle that completely covers Day 1

What it means:
Buyers took FULL control. Strong buy signal when found at support levels.

📌 Best used at: Bottom of downtrend, near support zone.
📌 Confirm with: Next candle should also be green.`,
      },
      {
        name: "Bearish Engulfing",
        duration: "4 min",
        image: "https://chartschool.stockcharts.com/school/uploads/Candlesticks/BearishEngulfing2.png",
        content: `A Bearish Engulfing signals reversal from uptrend to downtrend.

How to identify:
• Day 1: Small green candle
• Day 2: Large red candle that completely covers Day 1

What it means:
Sellers took FULL control. Strong sell signal at resistance levels.

📌 Best used at: Top of uptrend, near resistance zone.
📌 Volume should be higher on Day 2 for confirmation.`,
      },
      {
        name: "Doji Patterns",
        duration: "5 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Doji_candlestick_patterns.svg/800px-Doji_candlestick_patterns.svg.png",
        content: `A Doji forms when Open and Close are almost equal — showing INDECISION.

Types of Doji:
• Standard Doji ✚ — market completely undecided
• Dragonfly Doji 🔱 — long lower wick, possible bullish reversal
• Gravestone Doji 🪦 — long upper wick, possible bearish reversal
• Long-legged Doji — very long wicks both sides, extreme indecision

📌 Key Rule: Doji alone is NOT a signal.
Wait for the NEXT candle to confirm direction!`,
      },
      {
        name: "Hammer & Shooting Star",
        duration: "5 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Hammer_and_Shooting_Star.png/800px-Hammer_and_Shooting_Star.png",
        content: `🔨 Hammer (Bullish):
• Small body at TOP
• Long lower wick (at least 2x body size)
• Found at BOTTOM of downtrend
• Means: Sellers tried hard but buyers rejected lower prices

⭐ Shooting Star (Bearish):
• Small body at BOTTOM
• Long upper wick (at least 2x body size)
• Found at TOP of uptrend
• Means: Buyers tried hard but sellers rejected higher prices

📌 Always wait for next candle confirmation!`,
      },
      {
        name: "Morning & Evening Star",
        duration: "6 min",
        image: "https://chartschool.stockcharts.com/school/uploads/Candlesticks/MorningStar.png",
        content: `These are powerful 3-candle reversal patterns.

🌅 Morning Star (Bullish Reversal):
1. Large RED candle (bears in control)
2. Small candle with gap down (indecision)
3. Large GREEN candle (bulls take over)

🌆 Evening Star (Bearish Reversal):
1. Large GREEN candle (bulls in control)
2. Small candle with gap up (indecision)
3. Large RED candle (bears take over)

📌 One of the MOST RELIABLE reversal patterns!
📌 Middle candle can be a Doji for extra strength.`,
      },
    ],
  },
  {
    title: "Chart Patterns",
    slug: "chart-patterns",
    color: "#00D897",
    emoji: "📈",
    lessons: [
      {
        name: "Support & Resistance",
        duration: "4 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Support_and_Resistance_levels.png/800px-Support_and_Resistance_levels.png",
        content: `Support and Resistance are the FOUNDATION of technical analysis.

📗 Support:
• Price level where stock STOPS falling and bounces UP
• Buyers are strong here
• Good area to BUY

📕 Resistance:
• Price level where stock STOPS rising and falls DOWN
• Sellers are strong here
• Good area to SELL or book profit

📌 Golden Rule: Old resistance becomes NEW support after breakout!
📌 More touches = Stronger the level.`,
      },
      {
        name: "Head & Shoulders",
        duration: "5 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Head_and_shoulders_chart_pattern.svg/800px-Head_and_shoulders_chart_pattern.svg.png",
        content: `Head & Shoulders is one of the most RELIABLE reversal patterns.

Structure:
👤 Left Shoulder: Price rises then falls
👤 Head: Price rises HIGHER then falls
👤 Right Shoulder: Price rises LESS than head then falls
📏 Neckline: Connect the two lows

Signal: Price breaks below neckline → Strong SELL signal

📌 Target = Distance from head to neckline, projected downward.
📌 Volume should decrease from left shoulder to right shoulder.`,
      },
      {
        name: "Double Top & Bottom",
        duration: "5 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Double_top_and_double_bottom.png/800px-Double_top_and_double_bottom.png",
        content: `These are strong reversal patterns after extended moves.

🔴 Double Top (Bearish):
• Price hits same HIGH twice
• Cannot break above resistance
• Break below neckline = SELL signal
• Target = Height of the pattern projected down

🟢 Double Bottom (Bullish):
• Price hits same LOW twice
• Cannot break below support
• Break above neckline = BUY signal
• Target = Height of the pattern projected up

📌 The more time between the two tops/bottoms, the stronger the signal!`,
      },
      {
        name: "Bull & Bear Flags",
        duration: "4 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Bull_flag_chart_pattern.png/800px-Bull_flag_chart_pattern.png",
        content: `Flags are CONTINUATION patterns — trend pauses then continues.

🟢 Bull Flag:
• Strong upward move (the flagpole) 📊
• Small downward consolidation (the flag) 📉
• Breakout upward = BUY
• Target = flagpole length added to breakout point

🔴 Bear Flag:
• Strong downward move (flagpole)
• Small upward consolidation (flag)
• Breakout downward = SELL

📌 Volume should be HIGH on flagpole, LOW during flag, HIGH on breakout!`,
      },
      {
        name: "Triangle Patterns",
        duration: "6 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Ascending_triangle_chart_pattern.png/800px-Ascending_triangle_chart_pattern.png",
        content: `Triangles form as price makes converging highs and lows.

📐 Ascending Triangle (Bullish):
• Flat top resistance + rising support line
• Breakout usually goes UPWARD
• Buy on breakout above flat top

📐 Descending Triangle (Bearish):
• Flat bottom support + falling resistance line
• Breakout usually goes DOWNWARD
• Sell on breakdown below flat bottom

📐 Symmetrical Triangle:
• Both sides converging equally
• Breakout can go either direction
• Wait for confirmation before entering

📌 Volume decreases inside triangle, SPIKES on breakout!`,
      },
      {
        name: "Cup & Handle",
        duration: "5 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Cup_and_handle_chart_pattern.png/800px-Cup_and_handle_chart_pattern.png",
        content: `Cup & Handle is a bullish CONTINUATION pattern.

Structure:
☕ Cup: Rounded U-shape bottom (weeks to months)
🤝 Handle: Small downward drift after cup rim
🚀 Breakout: Price breaks above cup rim with volume

What it means:
• Stock consolidated, weak hands shaken out
• Smart money accumulated during cup
• Handle shakes out last weak holders
• Ready for big move UP

📌 Longer cup = Stronger breakout!
📌 Handle should be less than 50% of cup depth.`,
      },
    ],
  },
  {
    title: "Volume Analysis",
    slug: "volume-analysis",
    color: "#4ECDC4",
    emoji: "📊",
    lessons: [
      {
        name: "What is Volume?",
        duration: "3 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Volume_chart.png/800px-Volume_chart.png",
        content: `Volume = Total number of shares traded in a time period.

Why it matters:
• High volume = Strong conviction (big players active)
• Low volume = Weak move (may reverse soon)

The 4 Golden Rules:
✅ Price UP + Volume UP = Strong uptrend — BUY
✅ Price DOWN + Volume UP = Strong downtrend — SELL
⚠️ Price UP + Volume DOWN = Weak rally — be careful
⚠️ Price DOWN + Volume DOWN = Weak selling — may bounce

📌 NEVER trade a breakout without volume confirmation!`,
      },
      {
        name: "Volume Confirms Trend",
        duration: "4 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Volume_trend_confirmation.png/800px-Volume_trend_confirmation.png",
        content: `Volume should INCREASE in the direction of the trend.

In a Healthy Uptrend:
📈 Up days = HIGHER volume (bulls are active)
📉 Down days = LOWER volume (just profit booking)

In a Healthy Downtrend:
📉 Down days = HIGHER volume (bears are active)
📈 Up days = LOWER volume (just short covering)

Warning Signs:
🚨 Price making new highs but volume declining
→ Uptrend losing strength, reversal coming

🚨 Price making new lows but volume declining
→ Downtrend losing strength, bounce coming

📌 Volume is the LIE DETECTOR of the market!`,
      },
      {
        name: "OBV Indicator",
        duration: "4 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/On_Balance_Volume.png/800px-On_Balance_Volume.png",
        content: `OBV (On Balance Volume) tracks cumulative buying and selling pressure.

How it calculates:
• Price UP today → ADD today's volume to OBV
• Price DOWN today → SUBTRACT today's volume from OBV

Reading OBV:
✅ OBV rising + Price rising = Strong uptrend CONFIRMED
🔮 OBV rising + Price flat = Smart money ACCUMULATING — breakout soon!
⚠️ OBV falling + Price rising = DISTRIBUTION — reversal warning!
📉 OBV falling + Price falling = Strong downtrend confirmed

📌 OBV often LEADS price — it's an early warning system!`,
      },
      {
        name: "Volume Divergence",
        duration: "5 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Volume_divergence.png/800px-Volume_divergence.png",
        content: `Divergence = Price and volume moving in OPPOSITE directions.

🚨 Bearish Volume Divergence:
• Price making new HIGHS
• Volume getting LOWER each rally
• What it means: Rally losing strength
• Action: Prepare to exit longs

🚨 Bullish Volume Divergence:
• Price making new LOWS
• Volume getting LOWER each drop
• What it means: Selling losing strength
• Action: Prepare to enter longs

How to trade:
1. Spot the divergence
2. Wait for price confirmation (reversal candle)
3. Enter with stop loss beyond the extreme

📌 Divergence is an EARLY WARNING — act before the crowd!`,
      },
      {
        name: "Volume Profile Basics",
        duration: "6 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Volume_Profile.png/800px-Volume_Profile.png",
        content: `Volume Profile shows how much volume traded at each PRICE LEVEL.

Key Concepts:
🎯 POC (Point of Control):
Price level with MOST volume — strongest support/resistance

📊 Value Area:
Range where 70% of volume traded — price spends most time here

🏔️ HVN (High Volume Node):
Strong support/resistance levels — price slows down here

🏜️ LVN (Low Volume Node):
Price moves FAST through these — little support/resistance

How to trade:
• BUY near HVN support
• SELL near HVN resistance
• Expect fast moves through LVN zones

📌 Volume Profile reveals where BIG PLAYERS actually traded!`,
      },
    ],
  },
  {
    title: "Price Action",
    slug: "price-action",
    color: "#FFE66D",
    emoji: "💹",
    lessons: [
      {
        name: "What is Price Action?",
        duration: "3 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Price_action_trading.png/800px-Price_action_trading.png",
        content: `Price Action = Trading using ONLY the raw price chart — no indicators needed.

Why it works:
• Price reflects ALL information instantly
• Indicators LAG behind price
• Price Action traders see moves FIRST

The 3 Core Tools:
1. 🕯️ Candlestick patterns
2. 📏 Support & Resistance levels
3. 📐 Trend lines & market structure

Advantages:
✅ Works on any timeframe
✅ Works on any market (stocks, forex, crypto)
✅ No lagging indicators cluttering your chart
✅ See what big players are actually doing

📌 Master Price Action = Trade with CLARITY!`,
      },
      {
        name: "Higher Highs & Lower Lows",
        duration: "4 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Higher_highs_lower_lows.png/800px-Higher_highs_lower_lows.png",
        content: `Market structure is the FOUNDATION of Price Action trading.

📈 Uptrend = Higher Highs (HH) + Higher Lows (HL):
• Each rally goes HIGHER than the last
• Each pullback stays ABOVE the last low
• Trade: BUY at Higher Lows (HL)
• Stop: Below the last Higher Low

📉 Downtrend = Lower Highs (LH) + Lower Lows (LL):
• Each drop goes LOWER than the last
• Each bounce stays BELOW the last high
• Trade: SELL at Lower Highs (LH)
• Stop: Above the last Lower High

📌 NEVER fight the trend structure — always trade WITH it!`,
      },
      {
        name: "Break of Structure",
        duration: "5 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Break_of_structure.png/800px-Break_of_structure.png",
        content: `Break of Structure (BOS) signals a potential TREND CHANGE.

🔄 Bullish BOS:
• Price was making Lower Highs + Lower Lows
• Suddenly breaks ABOVE the last Lower High
• First sign trend may be shifting bullish
• Wait for pullback, then BUY

🔄 Bearish BOS:
• Price was making Higher Highs + Higher Lows
• Suddenly breaks BELOW the last Higher Low
• First sign trend may be shifting bearish
• Wait for bounce, then SELL

Confirmation needed:
✅ BOS candle closes beyond the level
✅ Volume spike on the break
✅ Next candle continues in direction

📌 BOS + high volume = HIGH PROBABILITY trade!`,
      },
      {
        name: "Inside Bar Strategy",
        duration: "4 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Inside_bar_pattern.png/800px-Inside_bar_pattern.png",
        content: `An Inside Bar forms when a candle is COMPLETELY within the previous candle's range.

What it means:
• Market is CONSOLIDATING
• A big move is coming
• Direction unknown — wait for breakout

How to trade:
📍 Mother Bar: The larger outer candle
📍 Inside Bar: The smaller candle within

Strategy:
• Place BUY order above mother bar HIGH
• Place SELL order below mother bar LOW
• Whichever breaks first = your trade direction
• Stop loss: Other side of mother bar

📌 Inside bars on DAILY or WEEKLY charts give the strongest signals!`,
      },
      {
        name: "Pin Bar Setup",
        duration: "5 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/p/pin_bar_pattern.png/800px-pin_bar_pattern.png",
        content: `Pin Bar = Long wick + small body = Strong REJECTION of a price level.

🟢 Bullish Pin Bar:
• Long LOWER wick (rejection of lower prices)
• Small body near the top
• Found at SUPPORT level
• Trade: BUY above pin bar high
• Stop: Below pin bar low (the wick)

🔴 Bearish Pin Bar:
• Long UPPER wick (rejection of higher prices)
• Small body near the bottom
• Found at RESISTANCE level
• Trade: SELL below pin bar low
• Stop: Above pin bar high (the wick)

Best Pin Bar conditions:
✅ At key S/R level
✅ In direction of main trend
✅ On higher timeframe (1H, 4H, Daily)

📌 Pin Bars at KEY LEVELS with trend = highest probability setup!`,
      },
    ],
  },
  {
    title: "Liquidity Zones",
    slug: "liquidity-zones",
    color: "#A8EDEA",
    emoji: "🌊",
    lessons: [
      {
        name: "What is Liquidity?",
        duration: "3 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/l/liquidity_zones.png/800px-liquidity_zones.png",
        content: `Liquidity = Areas where MANY buy or sell orders are waiting.

Why big institutions need it:
• They trade MASSIVE sizes (crores of shares)
• Need many orders on the other side to fill their trades
• They HUNT areas where retail traders placed stop losses

Where liquidity hides:
📍 Above recent HIGHS (buy stops waiting there)
📍 Below recent LOWS (sell stops waiting there)
📍 At round numbers (₹100, ₹500, ₹1000, ₹2000)
📍 At obvious S/R levels everyone can see

The truth:
🏦 Banks and institutions MOVE price to grab liquidity...
...then REVERSE in the opposite direction!

📌 Think like the institution — where are retail stops hiding?`,
      },
      {
        name: "Equal Highs & Lows",
        duration: "4 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/equal_highs_lows.png/800px-equal_highs_lows.png",
        content: `Equal Highs and Equal Lows = LIQUIDITY MAGNETS.

📍 Equal Highs:
• Price tests the SAME high level 2-3 times
• Retail traders place stop losses just ABOVE
• Institutions push price up to grab those stops
• Then price REVERSES down sharply

📍 Equal Lows:
• Price tests the SAME low level 2-3 times
• Retail traders place stop losses just BELOW
• Institutions push price down to grab those stops
• Then price REVERSES up sharply

How to trade:
1. Spot equal highs or equal lows on chart
2. Anticipate a STOP HUNT above/below
3. Wait for the hunt to happen
4. Enter after price reverses back

📌 When you see equal highs/lows — EXPECT a stop hunt!`,
      },
      {
        name: "Stop Hunt Patterns",
        duration: "5 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/s/stop_hunt.png/800px-stop_hunt.png",
        content: `Stop Hunt = Price spikes PAST a key level briefly then reverses sharply.

How it looks on chart:
• Price approaches key support/resistance
• Breaks through with a WICK or small candle
• Looks exactly like a breakout
• Most retail traders get stopped out
• Price IMMEDIATELY reverses the other direction

The trap:
❌ Retail: "Breakout! Enter now!"
✅ Smart: "Stop hunt! Wait for reversal."

How to trade it:
1. Identify the key level
2. Wait for price to break AND quickly reverse
3. Enter after the reversal candle closes
4. Stop loss: Beyond the spike wick
5. Target: Previous structure

📌 Failed breakout = Stop hunt = TRADE THE REVERSAL!`,
      },
      {
        name: "Order Blocks",
        duration: "6 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/o/order_block.png/800px-order_block.png",
        content: `Order Blocks = Zones where INSTITUTIONS placed massive orders.

How to find Bullish Order Block:
• Look for the LAST red candle before a big move UP
• That candle's range = Bullish Order Block zone
• When price returns to this zone → expect bounce UP

How to find Bearish Order Block:
• Look for the LAST green candle before a big move DOWN
• That candle's range = Bearish Order Block zone
• When price returns to this zone → expect drop DOWN

Why it works:
🏦 Institutions couldn't fill all their orders at once
🏦 They wait for price to return to same level
🏦 Then they RE-ENTER their original position

Trading Order Blocks:
1. Identify the block zone
2. Wait for price to return (retest)
3. Look for confirmation candle
4. Enter with tight stop

📌 Order Blocks work because BIG MONEY re-enters at same levels!`,
      },
      {
        name: "Fair Value Gaps",
        duration: "5 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fair_value_gap.png/800px-fair_value_gap.png",
        content: `Fair Value Gap (FVG) = Price moved so FAST it left a gap with no trading.

How it forms (3 candles):
• Candle 1 and Candle 3 do NOT overlap
• Middle candle created an imbalance
• Market often returns to "fill" this gap

🟢 Bullish FVG:
• Gap formed during a fast UPWARD move
• Acts as SUPPORT when price returns
• Look for buy entries in this zone

🔴 Bearish FVG:
• Gap formed during a fast DOWNWARD move
• Acts as RESISTANCE when price returns
• Look for sell entries in this zone

Trading FVGs:
1. Identify the gap zone on chart
2. Wait for price to return (fill the gap)
3. Look for rejection candle inside FVG
4. Enter with stop beyond FVG

📌 FVGs show price inefficiency — market LOVES to come back and rebalance!`,
      },
    ],
  },
  {
    title: "Risk Management",
    slug: "risk-management",
    color: "#FF4757",
    emoji: "🛡️",
    lessons: [
      {
        name: "1% Rule Explained",
        duration: "3 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/r/risk_management.png/800px-risk_management.png",
        content: `The 1% Rule: Never risk more than 1% of total capital on ONE trade.

Example with ₹10,00,000:
• Max risk per trade = ₹10,000
• 10 losses in a row = only 10% drawdown
• Still have ₹9,00,000 to recover!

Why most traders fail:
❌ Risk 10-20% per trade
❌ One bad trade destroys weeks of profit
❌ Emotional decisions after big loss

Why 1% rule works:
✅ Protects from emotional decisions
✅ Keeps you in the game long term
✅ Allows recovery from losing streaks
✅ Reduces stress dramatically

📌 Professional traders SURVIVE by managing losses — not by winning every trade!`,
      },
      {
        name: "Stop Loss Placement",
        duration: "4 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/s/stop_loss.png/800px-stop_loss.png",
        content: `Stop Loss = Automatic exit that limits your maximum loss on a trade.

Where to place Stop Loss:
✅ For BUY trades: Below support level or candle wick
✅ For SELL trades: Above resistance level or candle wick
✅ Below/above the entry pattern (hammer wick, etc.)
✅ Beyond key swing high or swing low

Common mistakes:
❌ Random fixed amount (₹500 stop on every trade)
❌ Too tight — normal price noise triggers it
❌ No stop loss at all — ACCOUNT KILLER!
❌ Moving stop loss further when trade goes against you

The right mindset:
"If price reaches my stop, my trade idea is WRONG."

📌 Place stop at level where your analysis is PROVEN WRONG — not just uncomfortable!`,
      },
      {
        name: "Risk Reward Ratio",
        duration: "4 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/r/risk_reward.png/800px-risk_reward.png",
        content: `Risk Reward Ratio (RRR) = Potential profit ÷ Potential loss.

Example:
• Risk: ₹5,000 (stop loss distance)
• Reward: ₹15,000 (target distance)
• RRR = 1:3

Minimum to aim for: 1:2

The MATH that changes everything:
With 1:2 RRR, even 40% win rate = PROFITABLE!

10 trades at 1:2 RRR:
• Win 4 trades: +4 × ₹10,000 = +₹40,000
• Lose 6 trades: -6 × ₹5,000 = -₹30,000
• NET PROFIT = +₹10,000 ✅

📌 You don't need to win most trades — you need GOOD RRR!`,
      },
      {
        name: "Position Sizing",
        duration: "5 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/p/position_sizing.png/800px-position_sizing.png",
        content: `Position Sizing = How many shares to buy based on your risk amount.

The Formula:
Position Size = Risk Amount ÷ Risk Per Share

Where:
• Risk Amount = Capital × Risk % (usually 1%)
• Risk Per Share = Entry Price - Stop Loss Price

Example:
• Capital: ₹10,00,000
• Risk: 1% = ₹10,000
• Entry: ₹500
• Stop Loss: ₹480
• Risk per share: ₹500 - ₹480 = ₹20
• Position Size: ₹10,000 ÷ ₹20 = 500 shares
• Total invested: 500 × ₹500 = ₹2,50,000

📌 ALWAYS calculate position size BEFORE entering a trade!`,
      },
      {
        name: "Managing Drawdowns",
        duration: "5 min",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/drawdown.png/800px-drawdown.png",
        content: `Drawdown = How much your account is DOWN from its peak.

The brutal recovery math:
• -10% drawdown → Need +11.1% to recover
• -20% drawdown → Need +25% to recover
• -33% drawdown → Need +50% to recover
• -50% drawdown → Need +100% to recover!! 😱

Rules during a losing streak:
1. Reduce position size by 50%
2. Stop trading if down 15-20% in a month
3. Review your trades — find what's wrong
4. NEVER revenge trade to "make it back"
5. Take a break — clear your head

Signs you need a break:
🚨 Taking trades out of frustration
🚨 Increasing size after losses
🚨 Ignoring your own rules

📌 The GOAL is to stay in the game. Small consistent gains beat big losses EVERY TIME!`,
      },
    ],
  },
];

export default function LearnDetail() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

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

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setSelectedLesson(null)}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#0F1629", border: "1px solid #1E2A40" }}
            >
              <ArrowLeft className="h-4 w-4 text-white" />
            </button>
            <div>
              <p className="text-xs font-semibold" style={{ color: topic.color }}>{topic.title}</p>
              <h1 className="text-lg font-bold text-white leading-tight">{lesson.name}</h1>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-1 mb-5">
            {topic.lessons.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-all"
                style={{ background: i <= selectedLesson ? topic.color : "#1E2A40" }}
              />
            ))}
          </div>

          {/* Image */}
          {lesson.image && !imgError[selectedLesson] && (
            <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid #1E2A40" }}>
              <img
                src={lesson.image}
                alt={lesson.name}
                className="w-full object-cover"
                style={{ maxHeight: "200px", background: "#1A2540" }}
                onError={() => setImgError(prev => ({ ...prev, [selectedLesson]: true }))}
              />
            </div>
          )}

          {/* Content */}
          <div className="rounded-2xl p-5 mb-5" style={{ background: "#0F1629", border: "1px solid #1E2A40" }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-3.5 w-3.5" style={{ color: "#8B9CB3" }} />
              <span className="text-xs" style={{ color: "#8B9CB3" }}>{lesson.duration} read</span>
              <span className="text-xs px-2 py-0.5 rounded-full ml-1" style={{ background: `${topic.color}20`, color: topic.color }}>
                {selectedLesson + 1}/{topic.lessons.length}
              </span>
            </div>
            <div className="text-sm text-white leading-relaxed whitespace-pre-line">
              {lesson.content}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {selectedLesson > 0 && (
              <button
                onClick={() => { setSelectedLesson(selectedLesson - 1); setImgError({}); }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ background: "#0F1629", border: "1px solid #1E2A40", color: "#8B9CB3" }}
              >
                ← Previous
              </button>
            )}
            {selectedLesson < topic.lessons.length - 1 ? (
              <button
                onClick={() => { setSelectedLesson(selectedLesson + 1); setImgError({}); }}
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
                ✅ Topic Complete!
              </button>
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0A0E1A" }}>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-5">

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
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: `${topic.color}20` }}
          >
            {topic.emoji}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{topic.title}</h1>
            <p className="text-xs" style={{ color: "#8B9CB3" }}>{topic.lessons.length} lessons</p>
          </div>
        </div>

        {/* Lessons */}
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
