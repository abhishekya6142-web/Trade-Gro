import type { VercelRequest, VercelResponse } from '@vercel/node';

// Indian NSE stocks list — inhe .NS lagega
const NSE_STOCKS = new Set([
  "RELIANCE","TCS","INFY","HDFCBANK","WIPRO","BAJFINANCE","ICICIBANK",
  "SBIN","AXISBANK","KOTAKBANK","LT","HINDUNILVR","MARUTI","SUNPHARMA",
  "TITAN","ASIANPAINT","ULTRACEMCO","NTPC","POWERGRID","ONGC","ADANIENT",
  "ADANIPORTS","BAJAJFINSV","BHARTIARTL","BPCL","BRITANNIA","CIPLA",
  "COALINDIA","DIVISLAB","DRREDDY","EICHERMOT","GRASIM","HCLTECH",
  "HDFC","HDFCLIFE","HEROMOTOCO","HINDALCO","ITC","INDUSINDBK","JSWSTEEL",
  "M&M","NESTLEIND","PIDILITIND","SBILIFE","SHREECEM","TATAMOTORS",
  "TATASTEEL","TECHM","TATACONSUM","UPL","VEDL","ZOMATO","PAYTM",
  "NYKAA","DMART","POLICYBZR","IRCTC","IRFC","HAL","BEL","RVNL",
  "YESBANK","PNB","BANKBARODA","CANBK","UNIONBANK","IOB","CENTRALBK",
  "IDBI","FEDERALBNK","RBLBANK","IDFCFIRSTB","BANDHANBNK","AUBANK",
  "CHOLAFIN","MUTHOOTFIN","BAJAJ-AUTO","HEROMOTOCO","TVSMOTORS",
  "MOTHERSON","BOSCHLTD","MRF","APOLLOTYRE","EXIDEIND","AMARAJABAT",
  "TATAPOWER","ADANIGREEN","ADANITRANS","TORNTPOWER","CESC","NHPC",
  "SJVN","RECLTD","PFC","IREDA","SUZLON","INOXWIND","GREENKO",
  "DEEPAKNTR","PIIND","AARTIIND","ALKYLAMINE","BALRAMCHIN","TRIVENI",
  "ZYDUSLIFE","TORNTPHARM","AUROPHARMA","LUPIN","ALKEM","IPCALAB",
  "GRANULES","NATCOPHARM","GLENMARK","BIOCON","ABBOTINDIA","PFIZER",
  "SANOFI","GLAXO","METROPOLIS","THYROCARE","LALPATHLAB","DRLABERT",
  "APOLLOHOSP","FORTIS","MAXHEALTH","NHCHC","NARAYANA","KIMS",
  "NAUKRI","JUSTDIAL","INDIAMART","TRADINGO","MATRIMONY","AFFLE",
  "MAPLABS","COFORGE","PERSISTENT","LTIM","MPHASIS","HEXAWARE",
  "KPIT","TATAELXSI","CYIENT","NIITTECH","MASTEK","ZENSAR","BIRLASOFT",
  "RPOWER","RCOM","IDEA","MTNL","BSNL","RAILTEL","CDSL","BSE",
  "MCX","CAMS","KFIN","ANGELONE","IIFL","MOTILALOFS","ICICIGI",
  "HDFCAMC","NIPPONLIFE","ABSLAMC","UTIAMC","MFSL","CANFINHOME",
  "LICHSGFIN","PNBHOUSING","REPCO","APTUS","HOMEFIRST","AAVAS",
  "VARUNBEV","TATACONSUM","DABUR","EMAMILTD","MARICO","COLPAL",
  "PGHH","GILLETTE","JYOTHYLAB","VENKEYS","VSTIND","RADICO",
  "UNITDSPR","TILAKNAGAR","GLOBUSSPR","MCDOWELL-N"
]);

function getFinalSymbol(symbol: string): string {
  if (symbol.includes('.')) return symbol; // Already has suffix: RELIANCE.NS, AAPL.US etc
  if (NSE_STOCKS.has(symbol.toUpperCase())) return `${symbol}.NS`; // Indian stock
  return symbol; // US stock — AAPL, GOOGL, MSFT etc
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const rawSymbol = req.query.symbol;
  const symbol = Array.isArray(rawSymbol) ? rawSymbol[0] : rawSymbol ?? '';
  const interval = Array.isArray(req.query.interval) ? req.query.interval[0] : req.query.interval ?? '1d';
  const range = Array.isArray(req.query.range) ? req.query.range[0] : req.query.range ?? '1y';

  const finalSymbol = getFinalSymbol(symbol);

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${finalSymbol}?interval=${interval}&range=${range}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    });

    const data = await response.json();
    const result = data?.chart?.result?.[0];

    if (!result) {
      return res.status(404).json({ error: 'No data found', symbol: finalSymbol });
    }

    const timestamps: number[] = result.timestamp;
    const ohlcv = result.indicators.quote[0];

    const candles = timestamps
      .map((ts: number, i: number) => ({
        time: ts,
        open: Number(ohlcv.open[i]?.toFixed(2)),
        high: Number(ohlcv.high[i]?.toFixed(2)),
        low: Number(ohlcv.low[i]?.toFixed(2)),
        close: Number(ohlcv.close[i]?.toFixed(2)),
        volume: ohlcv.volume[i] ?? 0,
      }))
      .filter((c) => c.open && c.high && c.low && c.close);

    res.status(200).json({ symbol: finalSymbol, candles });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
  }
