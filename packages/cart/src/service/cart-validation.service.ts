import { createLogger, type Cart, type CartItem, type CartValidationResult, type CartValidationError, Quantity } from '@oceanfresh/shared';
import type { IProductCatalog } from '@oceanfresh/product';

const logger = createLogger('cart:validation');

export class CartValidationService {
  constructor(private readonly catalog: IProductCatalog) {}

  async validateCart(cart: Cart): Promise<CartValidationResult> {
    const errors: CartValidationError[] = [];

    if (!cart.items || cart.items.length === 0) {
      return { valid: true, errors: [] };
    }

    const productIds = cart.items.map((item) => item.productId);
    const productMap = await this.catalog.getProducts(productIds);

    for (const item of cart.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        errors.push({
          code: 'PRODUCT_NOT_FOUND',
          message: `Product ${item.productId} no longer exists`,
          itemId: item.id,
          productId: item.productId,
        });
        continue;
      }

      if (!product.isAvailable) {
        errors.push({
          code: 'PRODUCT_UNAVAILABLE',
          message: `Product "${product.name}" is no longer available`,
          itemId: item.id,
          productId: item.productId,
        });
        continue;
      }

      if (product.stock < item.quantity.value) {
        errors.push({
          code: 'INSUFFICIENT_STOCK',
          message: `Insufficient stock for "${product.name}": ${product.stock} available, ${item.quantity.value} requested`,
          itemId: item.id,
          productId: item.productId,
        });
        continue;
      }

      if (item.snapshot.price.amount !== product.price.amount) {
        errors.push({
          code: 'PRICE_CHANGED',
          message: `Price changed for "${product.name}": was ${item.snapshot.price.amount}, now ${product.price.amount}`,
          itemId: item.id,
          productId: item.productId,
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  async validateItem(productId: string, quantity: number): Promise<CartValidationError | null> {
    if (!Quantity.isValid(quantity)) {
      return { code: 'INVALID_QUANTITY', message: 'Quantity must be between 1 and 999', productId };
    }

    const product = await this.catalog.getProduct(productId);
    if (!product) {
      return { code: 'PRODUCT_NOT_FOUND', message: 'Product not found', productId };
    }

    if (!product.isAvailable) {
      return { code: 'PRODUCT_UNAVAILABLE', message: 'Product is not available', productId };
    }

    if (product.stock < quantity) {
      return {
        code: 'INSUFFICIENT_STOCK',
        message: `Only ${product.stock} units available`,
        productId,
      };
    }

    return null;
  }
}
