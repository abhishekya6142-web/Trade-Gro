import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ message: "DEBUG: GROQ_API_KEY missing!", tips: [] });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: `Tu TradeBot hai — Trade-Gro app ka expert AI trading coach. Tu sirf trading, stock markets, technical analysis, chart patterns, candlestick patterns, investing strategies ke baare mein baat karta hai. Hinglish mein baat kar (Hindi + English mix). Short aur clear jawab de. Emojis use kar.`,
          },
          ...(history ?? []).map((h: any) => ({
            role: h.role,
            content: h.content,
          })),
          { role: 'user', content: message },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ message: `DEBUG: ${data.error.message}`, tips: [] });
    }

    const reply = data?.choices?.[0]?.message?.content ?? "Kuch gadbad ho gayi!";
    return res.status(200).json({ message: reply, tips: [] });

  } catch (error: any) {
    return res.status(200).json({ message: `DEBUG ERROR: ${error.message}`, tips: [] });
  }
}
