import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const rawSymbol = req.query.symbol;
  const symbol = Array.isArray(rawSymbol) ? rawSymbol[0] : rawSymbol ?? '';

  // Indian stocks ko .NS lagao, US stocks as-is
  const isIndian = symbol.endsWith('.NS') || symbol.endsWith('.BO');
  const finalSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;

  const tryFetch = async (sym: string) => {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`;
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    const data = await r.json();
    return data?.chart?.result?.[0]?.meta;
  };

  try {
    let meta = await tryFetch(finalSymbol);

    // Agar Indian .NS se data nahi mila toh US try karo
    if (!meta?.regularMarketPrice) {
      meta = await tryFetch(symbol.replace('.NS', '').replace('.BO', ''));
    }

    if (!meta?.regularMarketPrice) {
      return res.status(404).json({ error: 'Not found' });
    }

    const price = meta.regularMarketPrice ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? 0;
    const currency = meta.currency ?? (isIndian ? 'INR' : 'USD');

    res.status(200).json({
      symbol: meta.symbol ?? symbol,
      name: meta.longName ?? meta.shortName ?? symbol,
      sector: "Equity",
      currency,
      price: Number(price.toFixed(2)),
      previousClose: Number(prevClose.toFixed(2)),
      change: Number((price - prevClose).toFixed(2)),
      changePercent: prevClose ? Number(((price - prevClose) / prevClose * 100).toFixed(2)) : 0,
      high52w: Number((meta.fiftyTwoWeekHigh ?? 0).toFixed(2)),
      low52w: Number((meta.fiftyTwoWeekLow ?? 0).toFixed(2)),
      open: Number((meta.regularMarketOpen ?? 0).toFixed(2)),
      volume: meta.regularMarketVolume ?? 0,
    });
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
}
