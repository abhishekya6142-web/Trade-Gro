import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const { symbol } = req.query;
  
  try {
    // Yahoo Finance API (free, no key needed)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const response = await fetch(url);
    const data = await response.json();
    
    const quote = data?.chart?.result?.[0]?.meta;
    
    if (!quote) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    res.status(200).json({
      symbol: quote.symbol,
      price: quote.regularMarketPrice || 0,
      previousClose: quote.chartPreviousClose || 0,
      change: (quote.regularMarketPrice - quote.chartPreviousClose) || 0,
      changePercent: (((quote.regularMarketPrice - quote.chartPreviousClose) / quote.chartPreviousClose) * 100) || 0,
      high52w: quote.fiftyTwoWeekHigh || 0,
      low52w: quote.fiftyTwoWeekLow || 0,
      open: quote.regularMarketOpen || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
}
