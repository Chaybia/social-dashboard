// Rafraîchit le token Instagram (à appeler tous les 30 jours)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'token manquant' });

  const r = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`);
  const data = await r.json();
  if (data.error) return res.status(400).json({ error: data.error.message });
  return res.status(200).json({ access_token: data.access_token, expires_in: data.expires_in });
}
