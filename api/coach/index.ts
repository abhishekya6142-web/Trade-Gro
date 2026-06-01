import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ message: "DEBUG: GEMINI_API_KEY missing!", tips: [] });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const systemMessage = `Tu TradeBot hai — Trade-Gro app ka expert AI trading coach. Tu sirf trading, stock markets, technical analysis, chart patterns, candlestick patterns, investing strategies ke baare mein baat karta hai. Hinglish mein baat kar (Hindi + English mix). Short aur clear jawab de. Emojis use kar. Agar koi aur topic pooche toh bolna: "Main sirf trading ke baare mein help kar sakta hoon! 📈"`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: systemMessage }],
      },
      {
        role: 'model',
        parts: [{ text: 'Samajh gaya! Main TradeBot hoon aur sirf trading related sawaalon ka jawab dunga. 📈' }],
      },
      ...(history ?? []).map((h: any) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ message: `DEBUG: ${data.error.message}`, tips: [] });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Kuch gadbad ho gayi!";
    return res.status(200).json({ message: reply, tips: [] });

  } catch (error: any) {
    return res.status(200).json({ message: `DEBUG ERROR: ${error.message}`, tips: [] });
  }
}
