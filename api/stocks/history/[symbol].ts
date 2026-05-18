export default async function handler(req: any, res: any) {
  const { symbol, interval = '1d', range = '1mo' } = req.query;
  
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=${interval}&range=${range}`;
    const response = await fetch(url);
    const json = await response.json();
    const result = json?.chart?.result?.[0];
    
    if (!result) return res.status(404).json({ error: 'No data found' });
    
    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    
    const candles = timestamps.map((time: number, i: number) => ({
      time,
      open: quotes.open?.[i] || 0,
      high: quotes.high?.[i] || 0,
      low: quotes.low?.[i] || 0,
      close: quotes.close?.[i] || 0,
      volume: quotes.volume?.[i] || 0,
    })).filter((c: any) => c.close > 0);
    
    return res.status(200).json({ symbol, candles });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
}
