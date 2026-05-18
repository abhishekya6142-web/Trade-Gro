import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { symbol, interval = '1d', range = '3mo' } = req.query;
  
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
    const response = await fetch(url);
    const data = await response.json();
    
    const result = data?.chart?.result?.[0];
    if (!result) return res.status(404).json({ error: 'No data' });
    
    const timestamps = result.timestamp;
    const ohlcv = result.indicators.quote[0];
    
    const candles = timestamps.map((ts: number, i: number) => ({
      time: ts,
      open: ohlcv.open[i],
      high: ohlcv.high[i],
      low: ohlcv.low[i],
      close: ohlcv.close[i],
      volume: ohlcv.volume[i],
    })).filter((c: any) => c.open && c.high && c.low && c.close);
    
    res.status(200).json({ symbol, candles });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
}
