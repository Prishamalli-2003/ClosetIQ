/**
 * Image processor for ClosetIQ.
 *
 * Background removal:
 *  1. Calls /api/remove-bg (Vercel serverless) which tries remove.bg → ClipDrop → Photoroom
 *  2. Falls back to white background if all services fail
 *
 * To enable background removal, add one of these to Vercel environment variables:
 *  - CLIPDROP_KEY  (100 free/day — get at clipdrop.co/apis)
 *  - REMOVE_BG_KEY (50 free/month — get at remove.bg/api)
 *  - PHOTOROOM_KEY (paid — photoroom.com/api)
 */

const MAX_SIZE = 600;
const QUALITY  = 0.85;

const looksLikeImage = (file) => {
  if (!file) return false;
  if (file.type?.startsWith('image/')) return true;
  return /\.(jpe?g|png|gif|webp|heic|heif|bmp)$/i.test(file.name || '');
};

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

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.onload  = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

const addWhiteBackground = (blobOrBase64, padding = 0.05) =>
  new Promise((resolve, reject) => {
    const isBlob = blobOrBase64 instanceof Blob;
    const url = isBlob ? URL.createObjectURL(blobOrBase64) : blobOrBase64;
    const img = new Image();
    img.onerror = () => { if (isBlob) URL.revokeObjectURL(url); reject(new Error('Load failed')); };
    img.onload = () => {
      if (isBlob) URL.revokeObjectURL(url);
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

const fallbackProcess = async (file) => {
  const blob = await resizeToBlob(file, MAX_SIZE);
  return await blobToBase64(blob);
};

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
  if (!data.base64) throw new Error('Empty response');
  // Convert base64 PNG back to blob
  const parts = data.base64.split(',');
  const byteString = atob(parts[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: 'image/png' });
};

export const prepareImageForUpload = async (file, options = {}) => {
  if (!looksLikeImage(file)) throw new Error('Please choose a valid image.');

  // Try background removal via server proxy
  try {
    const resized = await resizeToBlob(file, options.maxWidth || MAX_SIZE);
    const bgRemoved = await removeBackgroundViaProxy(resized);
    const base64 = await addWhiteBackground(bgRemoved);
    console.log('✅ Background removed');
    return { base64, previewUrl: base64 };
  } catch (err) {
    console.warn('⚠️ Background removal unavailable:', err.message);
  }

  // Fallback: white background only
  const base64 = await fallbackProcess(file);
  return { base64, previewUrl: base64 };
};

export const imageToBase64 = (file, options = {}) =>
  prepareImageForUpload(file, options).then((r) => r.base64);
