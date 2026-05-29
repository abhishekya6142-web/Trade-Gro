import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({
      error: 'Message required'
    });
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        max_tokens: 2048,
        messages: [
          {
            role: 'system',
            content: `Tu TradeVision AI ka expert trading coach hai — naam hai "TradeBot".`
          },
          ...(history ?? []),
          { role: 'user', content: message },
        ],
      }),
    });

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ??
      "Yaar, kuch gadbad ho gayi. Dobara try karo!";

    return res.status(200).json({
      message: reply,
      tips: [],
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Abhi server busy hai, thodi der mein try karo! 🙏",
      tips: [],
    });
  }
}
