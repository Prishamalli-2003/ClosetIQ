// Vercel serverless function — proxies remove.bg to avoid browser CORS
// POST /api/remove-bg  { imageBase64: "data:image/jpeg;base64,..." }

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req, res) {
  // Allow CORS from same origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.REMOVE_BG_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'REMOVE_BG_KEY not set in Vercel environment variables' });
  }

  const { imageBase64 } = req.body || {};
  if (!imageBase64) return res.status(400).json({ error: 'No imageBase64 in request body' });

  try {
    // Strip data URL prefix and convert to Buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Build multipart form manually (no external deps needed)
    const boundary = `----FormBoundary${Date.now()}`;
    const CRLF = '\r\n';

    const partHeader =
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="image_file"; filename="photo.jpg"${CRLF}` +
      `Content-Type: image/jpeg${CRLF}${CRLF}`;

    const sizeField =
      `${CRLF}--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="size"${CRLF}${CRLF}` +
      `auto`;

    const bgField =
      `${CRLF}--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="bg_color"${CRLF}${CRLF}` +
      `ffffff`;

    const closing = `${CRLF}--${boundary}--${CRLF}`;

    const body = Buffer.concat([
      Buffer.from(partHeader, 'utf8'),
      imageBuffer,
      Buffer.from(sizeField + bgField + closing, 'utf8'),
    ]);

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
      body,
    });

    if (!response.ok) {
      let errMsg = `remove.bg returned ${response.status}`;
      try {
        const errData = await response.json();
        errMsg = errData?.errors?.[0]?.title || errMsg;
      } catch (_) {}
      return res.status(response.status).json({ error: errMsg });
    }

    // Result is a PNG binary
    const resultBuffer = Buffer.from(await response.arrayBuffer());
    const resultBase64 = `data:image/png;base64,${resultBuffer.toString('base64')}`;

    return res.status(200).json({ base64: resultBase64 });
  } catch (err) {
    console.error('remove-bg proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
}
