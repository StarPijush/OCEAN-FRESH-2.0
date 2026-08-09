import { getProductRepository } from '@oceanfresh/product/repository';
import { type Product, ProductStatus } from '@oceanfresh/shared';
import { storageService } from '@oceanfresh/supabase/storage';

import type { ProductData, ProductInput } from '../types.js';
import { imageUtils } from '../utils/image.js';

export interface SaveProductResult {
  success: boolean;
  error?: string;
  product?: ProductData;
}

function validateProductData(data: Partial<ProductInput>): string | null {
  if (!data.name?.trim()) return 'Product name is required';
  if (data.price !== undefined && (isNaN(data.price) || data.price <= 0))
    return 'Enter a valid price';
  return null;
}

function toProductData(p: Product): ProductData {
  return {
    id: p.id,
    name: p.name,
    sub: p.description,
    price: p.price,
    category: p.categoryId,
    available: p.stock > 0 && p.status === ProductStatus.ACTIVE,
    featured: p.featured,
    image: p.thumbnail || undefined,
    emoji: undefined,
    updated_at:
      typeof p.updatedAt === 'object' && 'toMillis' in p.updatedAt
        ? p.updatedAt.toMillis()
        : Date.now(),
  };
}

async function getAllProducts(): Promise<ProductData[]> {
  const repo = getProductRepository();
  const result = await repo.findAll({ limit: 200 });
  return result.items.map(toProductData);
}

async function getProductById(id: string): Promise<ProductData | null> {
  const repo = getProductRepository();
  const p = await repo.findById(id);
  return p ? toProductData(p) : null;
}

/**
 * Compresses an image data URL and uploads it to Supabase Storage under
 * `products/{id}/thumbnail.webp`. Returns the public URL, or throws on failure.
 */
async function uploadThumbnail(id: string, dataUrl: string): Promise<string> {
  const blob = await imageUtils.compressImageToBlob(dataUrl, 600, 0.7);
  if (!blob) throw new Error('Could not process the selected image');
  return storageService.upload(`products/${id}/thumbnail.webp`, blob);
}

/** Best-effort removal of a previously stored thumbnail object (never throws). */
async function removeThumbnailIfStored(url: string): Promise<void> {
  const path = imageUtils.storagePathFromUrl(url);
  if (!path) return;
  try {
    await storageService.remove(path);
  } catch {
    // orphans are cleaned by migration 016's bucket lifecycle; not fatal
  }
}

function availabilityPayload(input: Partial<ProductInput>) {
  if (input.available === undefined) return {};
  return {
    status: input.available ? ProductStatus.ACTIVE : ProductStatus.OUT_OF_STOCK,
    stock: input.available ? 10 : 0,
  };
}

export const productService = {
  async getAll(): Promise<ProductData[]> {
    return getAllProducts();
  },

  async getById(id: string): Promise<ProductData | null> {
    return getProductById(id);
  },

  async create(input: ProductInput, imageFile?: File): Promise<SaveProductResult> {
    const validationError = validateProductData(input);
    if (validationError) return { success: false, error: validationError };

    const repo = getProductRepository();
    const id = crypto.randomUUID();

    try {
      let thumbnail = '';
      if (imageFile && input.image) {
        thumbnail = await uploadThumbnail(id, input.image);
      }

      const product = await repo.create({
        id,
        name: input.name,
        description: input.sub ?? '',
        price: input.price,
        categoryId: input.category ?? '',
        featured: input.featured ?? false,
        thumbnail,
        createdBy: 'admin',
        ...availabilityPayload(input),
      });

      const mapped = await getProductById(product.id);
      return { success: true, product: mapped ?? undefined };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Save failed' };
    }
  },

  async update(
    id: string,
    input: Partial<ProductInput>,
    imageFile?: File,
  ): Promise<SaveProductResult> {
    const validationError = validateProductData(input);
    if (validationError) return { success: false, error: validationError };

    const repo = getProductRepository();
    const existing = await repo.findById(id);

    try {
      let thumbnail: string | undefined;
      const incoming = input.image;

      if (imageFile && incoming) {
        thumbnail = await uploadThumbnail(id, incoming);
      } else if (incoming) {
        thumbnail = incoming;
      } else if (existing?.thumbnail) {
        thumbnail = '';
        await removeThumbnailIfStored(existing.thumbnail);
      }

      const updated = await repo.update(id, {
        name: input.name,
        description: input.sub,
        price: input.price,
        categoryId: input.category,
        featured: input.featured,
        thumbnail,
        updatedBy: 'admin',
        ...availabilityPayload(input as ProductInput),
      });

      const mapped = await getProductById(updated.id);
      return { success: true, product: mapped ?? undefined };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Save failed' };
    }
  },

  async remove(id: string): Promise<void> {
    const repo = getProductRepository();
    await repo.softDelete(id);
  },

  async toggleAvailable(id: string): Promise<ProductData | null> {
    const repo = getProductRepository();
    const existing = await repo.findById(id);
    if (!existing) return null;
    const newStatus: ProductStatus =
      existing.status === ProductStatus.ACTIVE ? ProductStatus.OUT_OF_STOCK : ProductStatus.ACTIVE;
    await repo.update(id, { status: newStatus, updatedBy: 'admin' });
    return getProductById(id);
  },

  async toggleFeatured(id: string): Promise<ProductData | null> {
    const repo = getProductRepository();
    const existing = await repo.findById(id);
    if (!existing) return null;
    await repo.update(id, { featured: !existing.featured, updatedBy: 'admin' });
    return getProductById(id);
  },
};
