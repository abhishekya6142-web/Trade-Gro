export interface HealthStatus {
  status: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  virtualBalance: number;
  startingBalance: number;
  totalPortfolioValue: number;
  totalPL: number;
  totalPLPercent: number;
  dailyPL: number;
  xp: number;
  level: number;
  badges: string[];
  winRate: number;
  totalTrades: number;
  createdAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface InitUserRequest {
  id: string;
  name: string;
  email?: string;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high52w?: number;
  low52w?: number;
  open?: number;
  previousClose?: number;
  sector?: string;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TradeRequestType =
  (typeof TradeRequestType)[keyof typeof TradeRequestType];

export const TradeRequestType = {
  buy: "buy",
  sell: "sell",
} as const;

export interface TradeRequest {
  userId: string;
  symbol: string;
  type: TradeRequestType;
  shares: number;
  price: number;
  stopLoss?: number;
  takeProfit?: number;
}

export type TradeType = (typeof TradeType)[keyof typeof TradeType];

export const TradeType = {
  buy: "buy",
  sell: "sell",
} as const;

export type TradeStatus = (typeof TradeStatus)[keyof typeof TradeStatus];

export const TradeStatus = {
  open: "open",
  closed: "closed",
} as const;

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  stockName: string;
  type: TradeType;
  shares: number;
  price: number;
  totalValue: number;
  pl?: number;
  plPercent?: number;
  stopLoss?: number;
  takeProfit?: number;
  status: TradeStatus;
  timestamp: string;
}

export interface TradeResult {
  success: boolean;
  trade?: Trade;
  newBalance?: number;
  message: string;
}

export interface Position {
  id: string;
  symbol: string;
  stockName: string;
  shares: number;
  avgBuyPrice: number;
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  pl: number;
  plPercent: number;
  dayChange?: number;
  dayChangePercent?: number;
}

export interface MonthlyPerformance {
  month: string;
  value: number;
  pl: number;
  plPercent: number;
}

export interface Portfolio {
  totalValue: number;
  cashBalance: number;
  investedValue: number;
  totalPL: number;
  totalPLPercent: number;
  dailyPL: number;
  dailyPLPercent: number;
  positions: Position[];
  monthlyData: MonthlyPerformance[];
}

export type ChallengeType = (typeof ChallengeType)[keyof typeof ChallengeType];

export const ChallengeType = {
  profit: "profit",
  accuracy: "accuracy",
  trades: "trades",
  noloss: "noloss",
  streak: "streak",
} as const;

export type ChallengePeriod =
  (typeof ChallengePeriod)[keyof typeof ChallengePeriod];

export const ChallengePeriod = {
  daily: "daily",
  weekly: "weekly",
  monthly: "monthly",
} as const;

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  target: number;
  progress: number;
  xpReward: number;
  badge: string;
  deadline: string;
  completed: boolean;
  claimed: boolean;
  period: ChallengePeriod;
}

export interface ClaimResult {
  success: boolean;
  xpEarned: number;
  badge?: string;
  newLevel?: number;
  message: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  totalValue: number;
  totalPL: number;
  totalPLPercent: number;
  totalTrades: number;
  winRate: number;
  level: number;
  badges: string[];
  isCurrentUser: boolean;
}

export type AnalyzeRequestIndicators = {
  rsi?: number;
  macd?: number;
  signal?: number;
  ema20?: number;
  ema50?: number;
};

export interface AnalyzeRequest {
  symbol: string;
  candles: Candle[];
  interval?: string;
  indicators?: AnalyzeRequestIndicators;
}

export type AnalysisResultSignal =
  (typeof AnalysisResultSignal)[keyof typeof AnalysisResultSignal];

export const AnalysisResultSignal = {
  bullish: "bullish",
  bearish: "bearish",
  neutral: "neutral",
} as const;

export type AnalysisResultRisk =
  (typeof AnalysisResultRisk)[keyof typeof AnalysisResultRisk];

export const AnalysisResultRisk = {
  low: "low",
  medium: "medium",
  high: "high",
} as const;

export type AnalysisResultIndicators = {
  rsiSignal?: string;
  macdSignal?: string;
  trendStrength?: string;
};

export interface AnalysisResult {
  symbol: string;
  signal: AnalysisResultSignal;
  confidence: number;
  trend: string;
  patterns: string[];
  supportLevel?: number;
  resistanceLevel?: number;
  summary: string;
  recommendation: string;
  risk: AnalysisResultRisk;
  indicators?: AnalysisResultIndicators;
}

export interface ChatRequest {
  message: string;
  context?: string;
}

export interface ChatResponse {
  message: string;
  tips?: string[];
}

export type NewsArticleSentiment =
  (typeof NewsArticleSentiment)[keyof typeof NewsArticleSentiment];

export const NewsArticleSentiment = {
  positive: "positive",
  negative: "negative",
  neutral: "neutral",
} as const;

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: NewsArticleSentiment;
  sentimentScore: number;
  relatedSymbols: string[];
}

export type SearchStocksParams = {
  q: string;
};

export type SearchStocks200 = {
  results: StockSearchResult[];
};

export type GetStockHistoryParams = {
  interval?: GetStockHistoryInterval;
  range?: GetStockHistoryRange;
};

export type GetStockHistoryInterval =
  (typeof GetStockHistoryInterval)[keyof typeof GetStockHistoryInterval];

export const GetStockHistoryInterval = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "1h": "1h",
  "1d": "1d",
  "1wk": "1wk",
} as const;

export type GetStockHistoryRange =
  (typeof GetStockHistoryRange)[keyof typeof GetStockHistoryRange];

export const GetStockHistoryRange = {
  "1d": "1d",
  "5d": "5d",
  "1mo": "1mo",
  "3mo": "3mo",
  "6mo": "6mo",
  "1y": "1y",
} as const;

export type GetStockHistory200 = {
  symbol: string;
  candles: Candle[];
};

export type GetTrendingStocks200 = {
  stocks: StockQuote[];
};

export type GetTradesParams = {
  limit?: number;
};

export type GetTrades200 = {
  trades: Trade[];
};

export type GetChallenges200 = {
  challenges: Challenge[];
};

export type GetLeaderboardParams = {
  period?: GetLeaderboardPeriod;
};

export type GetLeaderboardPeriod =
  (typeof GetLeaderboardPeriod)[keyof typeof GetLeaderboardPeriod];

export const GetLeaderboardPeriod = {
  daily: "daily",
  weekly: "weekly",
  monthly: "monthly",
  alltime: "alltime",
} as const;

export type GetLeaderboard200 = {
  entries: LeaderboardEntry[];
  userRank: number;
};

export type GetNewsParams = {
  symbol?: string;
};

export type GetNews200 = {
  articles: NewsArticle[];
};
