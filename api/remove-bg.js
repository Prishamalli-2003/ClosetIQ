// Vercel serverless function — tries multiple background removal services
// Priority: remove.bg → Photoroom → fallback (white background only)

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageBase64 } = req.body || {};
  if (!imageBase64) return res.status(400).json({ error: 'No imageBase64 provided' });

  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const imageBuffer = Buffer.from(base64Data, 'base64');

  // ── Try remove.bg ──────────────────────────────────────────────────────
  const removeBgKey = process.env.REMOVE_BG_KEY;
  if (removeBgKey) {
    try {
      const boundary = `----FormBoundary${Date.now()}`;
      const CRLF = '\r\n';
      const body = Buffer.concat([
        Buffer.from(`--${boundary}${CRLF}Content-Disposition: form-data; name="image_file"; filename="photo.jpg"${CRLF}Content-Type: image/jpeg${CRLF}${CRLF}`, 'utf8'),
        imageBuffer,
        Buffer.from(`${CRLF}--${boundary}${CRLF}Content-Disposition: form-data; name="size"${CRLF}${CRLF}auto${CRLF}--${boundary}${CRLF}Content-Disposition: form-data; name="bg_color"${CRLF}${CRLF}ffffff${CRLF}--${boundary}--${CRLF}`, 'utf8'),
      ]);

      const r = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': removeBgKey, 'Content-Type': `multipart/form-data; boundary=${boundary}` },
        body,
      });

      if (r.ok) {
        const buf = Buffer.from(await r.arrayBuffer());
        return res.status(200).json({ base64: `data:image/png;base64,${buf.toString('base64')}`, service: 'remove.bg' });
      }
      console.warn('remove.bg failed:', r.status);
    } catch (e) {
      console.warn('remove.bg error:', e.message);
    }
  }

  // ── Try Photoroom ──────────────────────────────────────────────────────
  const photoroomKey = process.env.PHOTOROOM_KEY;
  if (photoroomKey) {
    try {
      const boundary = `----FormBoundary${Date.now()}`;
      const CRLF = '\r\n';
      const body = Buffer.concat([
        Buffer.from(`--${boundary}${CRLF}Content-Disposition: form-data; name="image_file"; filename="photo.jpg"${CRLF}Content-Type: image/jpeg${CRLF}${CRLF}`, 'utf8'),
        imageBuffer,
        Buffer.from(`${CRLF}--${boundary}--${CRLF}`, 'utf8'),
      ]);

      const r = await fetch('https://sdk.photoroom.com/v1/segment', {
        method: 'POST',
        headers: { 'x-api-key': photoroomKey, 'Content-Type': `multipart/form-data; boundary=${boundary}` },
        body,
      });

      if (r.ok) {
        const buf = Buffer.from(await r.arrayBuffer());
        return res.status(200).json({ base64: `data:image/png;base64,${buf.toString('base64')}`, service: 'photoroom' });
      }
      console.warn('Photoroom failed:', r.status);
    } catch (e) {
      console.warn('Photoroom error:', e.message);
    }
  }

  // ── No service available ───────────────────────────────────────────────
  return res.status(402).json({
    error: 'Background removal credits exhausted. Please add a new API key.',
    hint: 'Get a free key at remove.bg/api (50 free/month) or photoroom.com/api (100 free/month)'
  });
}
