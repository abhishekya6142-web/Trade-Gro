import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { symbol } = req.query;

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    });
    const data = await response.json();

    const result = data?.chart?.result?.[0];
    const meta = result?.meta;

    if (!meta) return res.status(404).json({ error: 'Stock not found' });

    const opens  = result?.indicators?.quote?.[0]?.open  ?? [];
    const closes = result?.indicators?.quote?.[0]?.close ?? [];
    const highs  = result?.indicators?.quote?.[0]?.high  ?? [];
    const lows   = result?.indicators?.quote?.[0]?.low   ?? [];

    const latestOpen = opens.filter(Boolean).at(-1) ?? 0;
    const latestHigh = highs.filter(Boolean).at(-1) ?? 0;
    const latestLow  = lows.filter(Boolean).at(-1)  ?? 0;

    const price     = meta.regularMarketPrice ?? 0;
    const prevClose = meta.chartPreviousClose ?? 0;

    res.status(200).json({
      symbol:        meta.symbol,
      name:          meta.longName ?? meta.shortName ?? meta.symbol,
      price,
      previousClose: prevClose,
      change:        price - prevClose,
      changePercent: prevClose ? ((price - prevClose) / prevClose) * 100 : 0,
      open:          latestOpen,
      high:          latestHigh,
      low:           latestLow,
      high52w:       meta.fiftyTwoWeekHigh ?? 0,
      low52w:        meta.fiftyTwoWeekLow  ?? 0,
      volume:        meta.regularMarketVolume ?? 0,
      sector:        meta.sector ?? null,
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
}
