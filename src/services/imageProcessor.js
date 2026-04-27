/**
 * Image processor for ClosetIQ.
 * Uses remove.bg API to remove background → ghost mannequin effect.
 * Falls back to white background if API key not set or quota exceeded.
 */

// Set your remove.bg API key here (free: 50 removals/month)
// Get one at: https://www.remove.bg/api
const REMOVE_BG_API_KEY = process.env.REACT_APP_REMOVE_BG_KEY || '';

const MAX_SIZE = 500;
const QUALITY  = 0.85;

const looksLikeImage = (file) => {
  if (!file) return false;
  if (file.type?.startsWith('image/')) return true;
  return /\.(jpe?g|png|gif|webp|heic|heif|bmp)$/i.test(file.name || '');
};

/**
 * Resize image and return as a Blob (used before sending to remove.bg).
 */
const resizeToBlob = (file, maxSize = MAX_SIZE) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Load failed')); };
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = maxSize / Math.max(img.width, img.height);
      const w = Math.round(img.width  * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        canvas.width = 0; canvas.height = 0;
        blob ? resolve(blob) : reject(new Error('toBlob failed'));
      }, 'image/jpeg', 0.85);
    };
    img.src = url;
  });

/**
 * Call remove.bg via our Vercel proxy (avoids CORS).
 * Falls back to direct API call for local development.
 */
const removeBackground = async (imageBlob) => {
  // Convert blob to base64 to send to our proxy
  const base64 = await blobToBase64(imageBlob);

  // Use our serverless proxy (works on Vercel, avoids CORS)
  const proxyUrl = '/api/remove-bg';

  const res = await fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `remove.bg proxy error ${res.status}`);
  }

  const data = await res.json();
  if (!data.base64) throw new Error('No result from remove.bg');

  // Convert base64 back to blob
  const byteString = atob(data.base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: 'image/png' });
};

/**
 * Convert a Blob/File to Base64 data URL.
 */
const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.onload  = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

/**
 * Add white background + padding to a PNG blob (after background removal).
 */
const addWhiteBackground = (blob, padding = 0.06) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Load failed')); };
    img.onload = () => {
      URL.revokeObjectURL(url);
      const padPx  = Math.round(Math.max(img.width, img.height) * padding);
      const cw = img.width  + padPx * 2;
      const ch = img.height + padPx * 2;
      const canvas = document.createElement('canvas');
      canvas.width = cw; canvas.height = ch;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, padPx, padPx);
      const base64 = canvas.toDataURL('image/jpeg', QUALITY);
      canvas.width = 0; canvas.height = 0;
      resolve(base64);
    };
    img.src = url;
  });

/**
 * Fallback: just resize + white background, no background removal.
 */
const fallbackProcess = async (file) => {
  const blob = await resizeToBlob(file, MAX_SIZE);
  return await blobToBase64(blob);
};

/**
 * Main entry point.
 * If REACT_APP_REMOVE_BG_KEY is set → removes background (ghost mannequin effect).
 * Otherwise → white background fallback.
 */
export const prepareImageForUpload = async (file) => {
  if (!looksLikeImage(file)) throw new Error('Please choose a valid image.');

  if (REMOVE_BG_API_KEY) {
    try {
      const resized  = await resizeToBlob(file, MAX_SIZE);
      const bgRemoved = await removeBackground(resized);
      const base64   = await addWhiteBackground(bgRemoved);
      return { base64, previewUrl: base64 };
    } catch (err) {
      console.warn('Background removal failed, using fallback:', err.message);
      // Fall through to fallback
    }
  }

  // Fallback — white background only
  const base64 = await fallbackProcess(file);
  return { base64, previewUrl: base64 };
};

// Keep this export for any legacy callers
export const imageToBase64 = (file, options = {}) =>
  prepareImageForUpload(file).then((r) => r.base64);
