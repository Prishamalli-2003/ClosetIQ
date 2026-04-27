/**
 * Vercel serverless function — background removal proxy
 * Tries multiple services in order until one works
 */

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

  // ── 1. Try remove.bg ──────────────────────────────────────────────────
  const removeBgKey = process.env.REMOVE_BG_KEY;
  if (removeBgKey) {
    try {
      const result = await callRemoveBg(imageBuffer, removeBgKey);
      if (result) return res.status(200).json({ base64: result, service: 'remove.bg' });
    } catch (e) { console.warn('remove.bg:', e.message); }
  }

  // ── 2. Try ClipDrop ───────────────────────────────────────────────────
  const clipdropKey = process.env.CLIPDROP_KEY;
  if (clipdropKey) {
    try {
      const result = await callClipdrop(imageBuffer, clipdropKey);
      if (result) return res.status(200).json({ base64: result, service: 'clipdrop' });
    } catch (e) { console.warn('clipdrop:', e.message); }
  }

  // ── 3. Try Photoroom ──────────────────────────────────────────────────
  const photoroomKey = process.env.PHOTOROOM_KEY;
  if (photoroomKey) {
    try {
      const result = await callPhotoroom(imageBuffer, photoroomKey);
      if (result) return res.status(200).json({ base64: result, service: 'photoroom' });
    } catch (e) { console.warn('photoroom:', e.message); }
  }

  return res.status(402).json({
    error: 'No background removal service available. Add CLIPDROP_KEY, REMOVE_BG_KEY, or PHOTOROOM_KEY to Vercel environment variables.',
  });
}

// ── Service implementations ───────────────────────────────────────────────

async function callRemoveBg(imageBuffer, apiKey) {
  const boundary = `----${Date.now()}`;
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image_file"; filename="photo.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),
    imageBuffer,
    Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="size"\r\n\r\nauto\r\n--${boundary}\r\nContent-Disposition: form-data; name="bg_color"\r\n\r\nffffff\r\n--${boundary}--\r\n`),
  ]);
  const r = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey, 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body,
  });
  if (!r.ok) throw new Error(`remove.bg ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  return `data:image/png;base64,${buf.toString('base64')}`;
}

async function callClipdrop(imageBuffer, apiKey) {
  const boundary = `----${Date.now()}`;
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image_file"; filename="photo.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),
    imageBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  const r = await fetch('https://clipdrop-api.co/remove-background/v1', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body,
  });
  if (!r.ok) throw new Error(`clipdrop ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  return `data:image/png;base64,${buf.toString('base64')}`;
}

async function callPhotoroom(imageBuffer, apiKey) {
  const boundary = `----${Date.now()}`;
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image_file"; filename="photo.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),
    imageBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  const r = await fetch('https://sdk.photoroom.com/v1/segment', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body,
  });
  if (!r.ok) throw new Error(`photoroom ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  return `data:image/png;base64,${buf.toString('base64')}`;
}
