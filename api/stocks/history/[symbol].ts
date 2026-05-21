import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const rawSymbol = req.query.symbol;
  const symbol = Array.isArray(rawSymbol) ? rawSymbol[0] : rawSymbol ?? '';
  const interval = Array.isArray(req.query.interval) ? req.query.interval[0] : req.query.interval ?? '1d';
  const range = Array.isArray(req.query.range) ? req.query.range[0] : req.query.range ?? '1mo';

  // Symbol mein .NS nahi hai toh add karo Indian stocks ke liye
  const finalSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;

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
