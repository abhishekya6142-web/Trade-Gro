import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { symbol, interval = '1d', range = '1mo' } = req.query;

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const data = await response.json();
    const result = data?.chart?.result?.[0];

    if (!result) {
      return res.status(404).json({ error: 'No data found' });
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

    res.status(200).json({ symbol, candles });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
}
