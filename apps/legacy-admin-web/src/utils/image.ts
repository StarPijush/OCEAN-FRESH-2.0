export const imageUtils = {
  extractEmoji(dataUrl: string): string {
    if (!dataUrl) return '\u{1F41F}';
    try {
      const decoded = decodeURIComponent(dataUrl);
      const m = decoded.match(/<text[^>]*>([^<]+)<\/text>/);
      if (m && m[1]) return m[1];
    } catch {
      /* ignore */
    }
    return '\u{1F41F}';
  },

  generateEmojiImage(emoji: string): string {
    return (
      'data:image/svg+xml,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect width="400" height="300" fill="#1c2030"/>
        <text x="200" y="155" font-family="serif" font-size="64" text-anchor="middle" fill="rgba(74,184,193,0.3)">${emoji}</text>
        <text x="200" y="195" font-family="sans-serif" font-size="13" text-anchor="middle" fill="rgba(255,255,255,0.2)" letter-spacing="2">NO IMAGE</text>
      </svg>`,
      )
    );
  },

  compressImage(dataUrl: string, maxWidth = 600, quality = 0.7): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/webp', quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  },

  /**
   * Compresses a data-URL and returns a WebP Blob ready for Supabase Storage
   * upload. Resolves with null on decode failure (caller keeps previous image).
   */
  compressImageToBlob(dataUrl: string, maxWidth = 600, quality = 0.7): Promise<Blob | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => resolve(blob ?? null), 'image/webp', quality);
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
  },

  /**
   * Extracts the storage object path (e.g. "products/abc/thumbnail.webp") from
   * a public storage URL so stale objects can be removed.
   */
  storagePathFromUrl(url: string): string | null {
    const marker = '/storage/v1/object/public/';
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    const path = url.slice(idx + marker.length);
    return path.includes('/') ? path : null;
  },

  PLACEHOLDER:
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#1c2030"/>
      <text x="200" y="155" font-family="serif" font-size="64" text-anchor="middle" fill="rgba(74,184,193,0.3)">\u{1F41F}</text>
      <text x="200" y="195" font-family="sans-serif" font-size="13" text-anchor="middle" fill="rgba(255,255,255,0.2)" letter-spacing="2">NO IMAGE</text>
    </svg>`,
    ),
};
