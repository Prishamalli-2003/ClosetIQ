// Vercel serverless function — proxies remove.bg API to avoid CORS
// Deployed at: /api/remove-bg

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.REMOVE_BG_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Forward the multipart form data to remove.bg
    const { default: fetch } = await import('node-fetch');
    const FormData = (await import('form-data')).default;

    // Get the base64 image from request body
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Convert base64 to buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const form = new FormData();
    form.append('image_file', imageBuffer, { filename: 'photo.jpg', contentType: 'image/jpeg' });
    form.append('size', 'auto');
    form.append('bg_color', 'ffffff');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        ...form.getHeaders(),
      },
      body: form,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errData?.errors?.[0]?.title || `remove.bg error ${response.status}`
      });
    }

    const resultBuffer = await response.buffer();
    const resultBase64 = `data:image/png;base64,${resultBuffer.toString('base64')}`;

    res.status(200).json({ base64: resultBase64 });
  } catch (err) {
    console.error('remove-bg proxy error:', err);
    res.status(500).json({ error: err.message });
  }
}
