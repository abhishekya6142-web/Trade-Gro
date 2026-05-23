import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const rawSymbol = req.query.symbol;
  const symbol = Array.isArray(rawSymbol) ? rawSymbol[0] : rawSymbol ?? '';
  const finalSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${finalSymbol}?interval=1d&range=1d`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    });

    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;

    if (!meta) {
      return res.status(404).json({ error: 'Not found', symbol: finalSymbol });
    }

    const price = meta.regularMarketPrice ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? 0;

    res.status(200).json({
      symbol: meta.symbol ?? finalSymbol,
      name: meta.longName ?? meta.shortName ?? finalSymbol,
      price: Number(price.toFixed(2)),
      previousClose: Number(prevClose.toFixed(2)),
      change: Number((price - prevClose).toFixed(2)),
      changePercent: prevClose ? Number(((price - prevClose) / prevClose * 100).toFixed(2)) : 0,
      high52w: Number((meta.fiftyTwoWeekHigh ?? 0).toFixed(2)),
      low52w: Number((meta.fiftyTwoWeekLow ?? 0).toFixed(2)),
      open: Number((meta.regularMarketOpen ?? 0).toFixed(2)),
      volume: meta.regularMarketVolume ?? 0,
      sector: meta.exchangeName ?? "Equity",
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
}
