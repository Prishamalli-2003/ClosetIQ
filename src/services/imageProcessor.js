/**
 * Image processor for ClosetIQ.
 * Calls /api/remove-bg (Vercel serverless proxy) to remove background.
 * Falls back to white background if the API is unavailable.
 */

const MAX_SIZE = 600;
const QUALITY  = 0.85;

const looksLikeImage = (file) => {
  if (!file) return false;
  if (file.type?.startsWith('image/')) return true;
  return /\.(jpe?g|png|gif|webp|heic|heif|bmp)$/i.test(file.name || '');
};

/** Resize image to a blob */
const resizeToBlob = (file, maxSize = MAX_SIZE) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Load failed')); };
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
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
      }, 'image/jpeg', 0.82);
    };
    img.src = url;
  });

/** Blob → base64 data URL */
const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.onload  = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

/** Add white background + padding after background removal */
const addWhiteBackground = (blob, padding = 0.05) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Load failed')); };
    img.onload = () => {
      URL.revokeObjectURL(url);
      const padPx = Math.round(Math.max(img.width, img.height) * padding);
      const cw = img.width + padPx * 2;
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

/** Call our Vercel proxy to remove background */
const removeBackgroundViaProxy = async (imageBlob) => {
  const base64 = await blobToBase64(imageBlob);

  const res = await fetch('/api/remove-bg', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Proxy error ${res.status}`);
  }

  const data = await res.json();
  if (!data.base64) throw new Error('Empty response from proxy');

  // base64 PNG → Blob
  const parts = data.base64.split(',');
  const byteString = atob(parts[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: 'image/png' });
};

/** Fallback: resize + white background only */
const fallbackProcess = async (file) => {
  const blob = await resizeToBlob(file, MAX_SIZE);
  return await blobToBase64(blob);
};

/**
 * Main entry point used by Wardrobe, PurchaseSupport, OutfitLog.
 *
 * Flow:
 *  1. Resize image to 600px
 *  2. Call /api/remove-bg proxy → remove.bg removes background
 *  3. Add white background + padding
 *  4. Return base64 data URL
 *
 * If proxy fails (quota exceeded, network error) → falls back to white background.
 */
export const prepareImageForUpload = async (file, options = {}) => {
  if (!looksLikeImage(file)) throw new Error('Please choose a valid image.');

  try {
    const resized    = await resizeToBlob(file, options.maxWidth || MAX_SIZE);
    const bgRemoved  = await removeBackgroundViaProxy(resized);
    const base64     = await addWhiteBackground(bgRemoved);
    console.log('✅ Background removed successfully');
    return { base64, previewUrl: base64 };
  } catch (err) {
    console.warn('⚠️ Background removal failed:', err.message, '— using white background fallback');
    const base64 = await fallbackProcess(file);
    return { base64, previewUrl: base64 };
  }
};

export const imageToBase64 = (file, options = {}) =>
  prepareImageForUpload(file, options).then((r) => r.base64);
