// Vercel serverless function — échange le code OAuth Instagram contre un token longue durée
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { code, redirect_uri } = req.query;
  if (!code) return res.status(400).json({ error: 'code manquant' });

  const appId     = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;

  if (!appId || !appSecret) {
    return res.status(500).json({ error: 'Variables INSTAGRAM_APP_ID et INSTAGRAM_APP_SECRET non configurées dans Vercel' });
  }

  try {
    // 1. Échange du code contre un token court
    const shortRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({ client_id: appId, client_secret: appSecret, grant_type: 'authorization_code', redirect_uri, code }),
    });
    const shortData = await shortRes.json();
    if (shortData.error_type) return res.status(400).json({ error: shortData.error_message });

    // 2. Échange contre un token longue durée (60 jours)
    const longRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortData.access_token}`
    );
    const longData = await longRes.json();
    if (longData.error) return res.status(400).json({ error: longData.error.message });

    return res.status(200).json({ access_token: longData.access_token, expires_in: longData.expires_in });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
