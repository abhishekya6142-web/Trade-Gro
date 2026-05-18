export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const symbols = ['RELIANCE.NS','TCS.NS','INFY.NS','HDFCBANK.NS','ICICIBANK.NS','WIPRO.NS','SBIN.NS','BHARTIARTL.NS','ITC.NS','KOTAKBANK.NS'];
    
    const results = await Promise.all(symbols.map(async (symbol) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`;
      const response = await fetch(url);
      const json = await response.json();
      const meta = json?.chart?.result?.[0]?.meta;
      
      if (!meta) return null;
      
      const price = meta.regularMarketPrice || 0;
      const prev = meta.previousClose || price;
      const change = price - prev;
      const changePercent = prev ? (change / prev) * 100 : 0;
      
      return {
        symbol: symbol.replace('.NS', ''),
        name: meta.longName || symbol,
        price,
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: meta.regularMarketVolume || 0,
      };
    }));

    const stocks = results.filter(Boolean);
    return res.status(200).json({ stocks });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch stocks' });
  }
}
