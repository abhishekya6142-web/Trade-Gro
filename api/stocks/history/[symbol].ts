import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { symbol, interval = '1d', range = '3mo' } = req.query;

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    });
    const data = await response.json();

    const result = data?.chart?.result?.[0];
    if (!result) return res.status(404).json({ error: 'No data' });

    const timestamps = result.timestamp;
    const ohlcv = result.indicators.quote[0];

    const candles = timestamps.map((ts: number, i: number) => ({
      time: ts,
      open: ohlcv.open[i] ?? 0,
      high: ohlcv.high[i] ?? 0,
      low: ohlcv.low[i] ?? 0,
      close: ohlcv.close[i] ?? 0,
      volume: ohlcv.volume[i] ?? 0,
    })).filter((c: any) => c.open && c.close);

    res.status(200).json({ symbol, candles });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
}
