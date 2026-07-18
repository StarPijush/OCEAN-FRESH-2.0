import type { IProductCatalog, ProductSummary } from './product-catalog.interface.js';
import type { IProductRepository } from '../repository/product.repository.js';
import { ProductStatus, type Money } from '@oceanfresh/shared';

export class ProductCatalogImpl implements IProductCatalog {
  constructor(private readonly repository: IProductRepository) {}

  async getProduct(productId: string): Promise<ProductSummary | null> {
    const product = await this.repository.findById(productId);
    if (!product) return null;
    return this.toSummary(product);
  }

  async getProducts(productIds: string[]): Promise<Map<string, ProductSummary>> {
    const products = await this.repository.findByIds(productIds);
    const map = new Map<string, ProductSummary>();
    for (const p of products) {
      map.set(p.id, this.toSummary(p));
    }
    return map;
  }

  async isAvailable(productId: string, quantity: number): Promise<boolean> {
    const product = await this.repository.findById(productId);
    if (!product) return false;
    if (product.status !== ProductStatus.ACTIVE) return false;
    if (product.stock < quantity) return false;
    return true;
  }

  async getPrice(productId: string): Promise<Money | null> {
    const product = await this.repository.findById(productId);
    if (!product) return null;
    return { amount: product.price, currency: 'USD' };
  }

  private toSummary(product: any): ProductSummary {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku ?? null,
      slug: product.slug,
      thumbnail: product.thumbnail ?? '',
      image: product.image ?? '',
      price: { amount: product.price, currency: 'USD' },
      unit: product.unit,
      stock: product.stock ?? 0,
      isAvailable: product.status === ProductStatus.ACTIVE && product.stock > 0,
      variantSummary: product.variantSummary ?? null,
      categoryId: product.categoryId ?? null,
      updatedAt: product.updatedAt ?? new Date(),
    };
  }
}
