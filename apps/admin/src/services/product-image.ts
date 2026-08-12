import { storageService } from '@oceanfresh/supabase/storage';

export interface PickedImage {
  /** Object URL of the compressed image (webp) for preview. */
  localUri: string;
}

/**
 * Opens the browser file picker and returns a compressed webp image as an
 * object URL. Resolves `null` when the user cancels the picker.
 */
export async function pickAndCompressImage(): Promise<PickedImage | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    let settled = false;

    const cleanup = () => {
      window.removeEventListener('focus', onWindowFocus);
      input.remove();
    };

    const settle = (value: PickedImage | null) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(value);
    };

    const onWindowFocus = () => {
      // File pickers hide the window; regaining focus without a `change`
      // means the user cancelled the dialog.
      settle(null);
    };

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        settle(null);
        return;
      }
      void (async () => {
        try {
          const blob = await compressToWebp(file);
          if (!blob) {
            settle(null);
            return;
          }
          settle({ localUri: URL.createObjectURL(blob) });
        } catch (err) {
          settled = true;
          cleanup();
          reject(err);
        }
      })();
    };

    window.addEventListener('focus', onWindowFocus);
    document.body.appendChild(input);
    input.click();
  });
}

/** Resizes to max 600px wide and re-encodes as webp (quality 0.7). */
async function compressToWebp(file: File, maxWidth = 600, quality = 0.7): Promise<Blob | null> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxWidth / bitmap.width);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, width, height);

    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality),
    );
  } finally {
    bitmap.close();
  }
}

export interface UploadedImage {
  /** Public storage URL. */
  url: string;
}

/**
 * Uploads the compressed image to Supabase Storage under `products/{id}/thumbnail.webp`
 * and returns the public URL. Mirrors the previous admin's storage-first pipeline.
 */
export async function uploadProductImage(
  productId: string,
  localUri: string,
): Promise<UploadedImage> {
  const blob = await (await fetch(localUri)).blob();
  const file = new File([blob], 'thumbnail.webp', { type: 'image/webp' });
  const url = await storageService.upload(`products/${productId}/thumbnail.webp`, file);
  return { url };
}

/** Removes the stored thumbnail object for a product (best-effort, never throws). */
export async function removeStoredProductImage(path: string): Promise<void> {
  try {
    await storageService.remove(path);
  } catch {
    // Non-fatal — orphans are cleaned up by the storage lifecycle.
  }
}
