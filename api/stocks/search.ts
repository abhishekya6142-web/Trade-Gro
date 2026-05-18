export default async function handler(req: any, res: any) {
  const { q } = req.query;
  
  if (!q) return res.status(400).json({ error: 'Query required' });
  
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${q}&lang=en-US&region=IN&quotesCount=10`;
    const response = await fetch(url);
    const json = await response.json();
    
    const results = (json?.quotes || [])
      .filter((q: any) => q.quoteType === 'EQUITY')
      .map((q: any) => ({
        symbol: q.symbol?.replace('.NS', '').replace('.BO', ''),
        name: q.longname || q.shortname || q.symbol,
        exchange: q.exchange || 'NSE',
        type: q.quoteType || 'EQUITY',
      }));
    
    return res.status(200).json({ results });
  } catch (error) {
    return res.status(500).json({ error: 'Search failed' });
  }
}
