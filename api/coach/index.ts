import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const contents = [
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
        system_instruction: {
          parts: [{
            text: `Tu TradeBot hai — Trade-Gro app ka expert AI trading coach.
Tu sirf trading, stock markets, technical analysis, chart patterns,
candlestick patterns, investing strategies ke baare mein baat karta hai.
Hinglish mein baat kar (Hindi + English mix).
Short aur clear jawab de. Emojis use kar. 
Agar koi aur topic pooche toh bolna: "Main sirf trading ke baare mein help kar sakta hoon! 📈"`
          }]
        },
        contents,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    });

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
      ?? "Yaar, kuch gadbad ho gayi. Dobara try karo!";

    return res.status(200).json({ message: reply, tips: [] });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Abhi server busy hai, thodi der mein try karo! 🙏",
      tips: [],
    });
  }
}
