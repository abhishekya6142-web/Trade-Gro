export default async function handler(req: any, res: any) {
  const { symbol } = req.query;
  
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1d&range=2d`;
    const response = await fetch(url);
    const json = await response.json();
    const meta = json?.chart?.result?.[0]?.meta;
    
    if (!meta) return res.status(404).json({ error: 'Stock not found' });
    
    const price = meta.regularMarketPrice || 0;
    const prev = meta.previousClose || price;
    const change = price - prev;
    const changePercent = prev ? (change / prev) * 100 : 0;
    
    return res.status(200).json({
      symbol,
      name: meta.longName || symbol,
      price,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: meta.regularMarketVolume || 0,
      marketCap: meta.marketCap,
      high52w: meta.fiftyTwoWeekHigh,
      low52w: meta.fiftyTwoWeekLow,
      open: meta.regularMarketOpen,
      previousClose: meta.previousClose,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch stock' });
  }
}
