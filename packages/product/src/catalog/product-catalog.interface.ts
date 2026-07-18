import type { ProductUnit, Money } from '@oceanfresh/shared';

export interface ProductSummary {
  id: string;
  name: string;
  sku: string | null;
  slug: string;
  thumbnail: string;
  image: string;
  price: Money;
  unit: ProductUnit;
  stock: number;
  isAvailable: boolean;
  variantSummary: string | null;
  categoryId: string | null;
  updatedAt: Date;
}

export interface IProductCatalog {
  getProduct(productId: string): Promise<ProductSummary | null>;
  getProducts(productIds: string[]): Promise<Map<string, ProductSummary>>;
  isAvailable(productId: string, quantity: number): Promise<boolean>;
  getPrice(productId: string): Promise<Money | null>;
}
