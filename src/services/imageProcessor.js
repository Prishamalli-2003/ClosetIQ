/**
 * Image processor for ClosetIQ.
 *
 * Background removal strategy (in order):
 *  1. @imgly/background-removal — runs IN THE BROWSER, no API key needed, free & unlimited
 *  2. Server proxy (/api/remove-bg) — remove.bg or Photoroom if API keys are set
 *  3. Fallback — white background only
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
const addWhiteBackground = (blobOrUrl, padding = 0.05) =>
  new Promise((resolve, reject) => {
    const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
    const isObjectUrl = typeof blobOrUrl !== 'string';
    const img = new Image();
    img.onerror = () => { if (isObjectUrl) URL.revokeObjectURL(url); reject(new Error('Load failed')); };
    img.onload = () => {
      if (isObjectUrl) URL.revokeObjectURL(url);
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

/** Fallback: resize + white background only */
const fallbackProcess = async (file) => {
  const blob = await resizeToBlob(file, MAX_SIZE);
  return await blobToBase64(blob);
};

/**
 * Strategy 1: Use @imgly/background-removal loaded from CDN (no npm install needed).
 * Downloads ~10MB of ML model on first use, then cached by browser.
 * Runs entirely in the browser — no API key, free, unlimited.
 */
let _bgRemoval = null;
const removeBackgroundInBrowser = async (file) => {
  // Load the library from CDN if not already loaded
  if (!_bgRemoval) {
    // Use the UMD build from jsDelivr
    await new Promise((resolve, reject) => {
      if (window.BackgroundRemoval) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/background-removal.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    _bgRemoval = window.BackgroundRemoval || window.imglyBackgroundRemoval;
  }

  if (!_bgRemoval?.removeBackground) {
    throw new Error('Background removal library not available');
  }

  const resultBlob = await _bgRemoval.removeBackground(file, {
    publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/',
    output: { format: 'image/png', quality: 0.9 },
  });

  return resultBlob;
};

/**
 * Strategy 2: Server proxy (remove.bg or Photoroom via /api/remove-bg).
 */
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
  const parts = data.base64.split(',');
  const byteString = atob(parts[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: 'image/png' });
};

/**
 * Main entry point.
 *
 * Tries in-browser ML first (free, unlimited), then server proxy, then fallback.
 */
export const prepareImageForUpload = async (file, options = {}) => {
  if (!looksLikeImage(file)) throw new Error('Please choose a valid image.');

  // Strategy 1: In-browser ML (no API key, free, unlimited)
  try {
    console.log('🤖 Removing background in browser (ML model)...');
    const resized = await resizeToBlob(file, options.maxWidth || MAX_SIZE);
    const bgRemovedBlob = await removeBackgroundInBrowser(resized);
    const base64 = await addWhiteBackground(bgRemovedBlob);
    console.log('✅ Background removed in browser!');
    return { base64, previewUrl: base64, method: 'browser-ml' };
  } catch (err) {
    console.warn('⚠️ Browser ML failed:', err.message);
  }

  // Strategy 2: Server proxy
  try {
    console.log('🌐 Trying server proxy...');
    const resized = await resizeToBlob(file, options.maxWidth || MAX_SIZE);
    const bgRemovedBlob = await removeBackgroundViaProxy(resized);
    const base64 = await addWhiteBackground(bgRemovedBlob);
    console.log('✅ Background removed via proxy!');
    return { base64, previewUrl: base64, method: 'proxy' };
  } catch (err) {
    console.warn('⚠️ Proxy failed:', err.message);
  }

  // Strategy 3: Fallback
  console.log('📷 Using original photo with white background');
  const base64 = await fallbackProcess(file);
  return { base64, previewUrl: base64, method: 'fallback' };
};

export const imageToBase64 = (file, options = {}) =>
  prepareImageForUpload(file, options).then((r) => r.base64);
