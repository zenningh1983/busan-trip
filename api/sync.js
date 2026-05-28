const GH_TOKEN = process.env.GH_TOKEN;
const GH_API = 'https://api.github.com/repos/zenningh1983/busan-trip/contents/data.json';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ghHeaders = {
    'Authorization': `token ${GH_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  if (req.method === 'GET') {
    const r = await fetch(GH_API, { headers: ghHeaders });
    if (!r.ok) return res.status(r.status).json({ error: 'not found' });
    const file = await r.json();
    const data = JSON.parse(Buffer.from(file.content, 'base64').toString('utf-8'));
    return res.json(data);
  }

  if (req.method === 'PUT') {
    // Always fetch latest SHA to prevent conflicts
    let sha = null;
    const getR = await fetch(GH_API, { headers: ghHeaders });
    if (getR.ok) sha = (await getR.json()).sha;

    const content = Buffer.from(JSON.stringify(req.body, null, 2)).toString('base64');
    const body = { message: '自動同步', content, branch: 'main' };
    if (sha) body.sha = sha;

    const r = await fetch(GH_API, { method: 'PUT', headers: ghHeaders, body: JSON.stringify(body) });
    return res.status(r.status).json({ ok: r.ok });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
