import { storageService } from '@oceanfresh/supabase/storage';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export interface PickedImage {
  /** Local URI of the compressed image (webp). */
  localUri: string;
}

/** Opens the system photo library and returns a compressed webp image. */
export async function pickAndCompressImage(): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library permission is required to upload a product image.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]) return null;

  const sourceUri = result.assets[0].uri;
  const context = ImageManipulator.ImageManipulator.manipulate(sourceUri);
  context.resize({ width: 600 });
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({
    format: ImageManipulator.SaveFormat.WEBP,
    compress: 0.7,
  });
  return { localUri: saved.uri };
}

export interface UploadedImage {
  /** Public storage URL. */
  url: string;
}

/**
 * Uploads the compressed image to Supabase Storage under `products/{id}/thumbnail.webp`
 * and returns the public URL. Mirrors the web admin's storage-first pipeline.
 */
export async function uploadProductImage(
  productId: string,
  localUri: string,
): Promise<UploadedImage> {
  const url = await storageService.upload(`products/${productId}/thumbnail.webp`, {
    uri: localUri,
    name: 'thumbnail.webp',
    type: 'image/webp',
  });
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
