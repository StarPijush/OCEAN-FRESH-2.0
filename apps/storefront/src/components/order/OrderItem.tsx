import { type ProductVM, useCartStore } from '../../services/index.js';
import { TrashIcon } from '../ui/Icons.js';

interface OrderItemProps {
  product: ProductVM;
  quantity: number;
  onRemove: () => void;
}

export function OrderItem({ product: p, quantity, onRemove }: OrderItemProps) {
  const updateQty = useCartStore((s) => s.updateQty);
  const hasPhoto = Boolean(p.image && !p.image.startsWith('data:image/svg'));

  return (
    <article className="order-item-premium" aria-label={`${p.name}, ${quantity} kg`}>
      <div className="order-item-premium__media-wrap">
        {hasPhoto ? (
          <img
            src={p.image ?? ''}
            alt={p.name}
            className="order-item-premium__media"
            loading="lazy"
            decoding="async"
            width={96}
            height={96}
          />
        ) : (
          <div
            className="order-item-premium__media order-item-premium__media--fallback"
            role="img"
            aria-label={p.name}
          >
            <span aria-hidden="true">{p.emoji}</span>
          </div>
        )}
      </div>

      <div className="order-item-premium__content">
        <div className="order-item-premium__info">
          <h3 className="order-item-premium__name">{p.name}</h3>
          <div className="order-item-premium__price">
            {'\u20B9'}
            {p.price}
          </div>
          {p.sub ? <p className="order-item-premium__desc">{p.sub}</p> : null}
          <div className="order-item-premium__actions">
            <div
              className="order-item-premium__qty"
              role="group"
              aria-label={`Quantity for ${p.name}`}
            >
              <button
                type="button"
                className="order-item-premium__qty-btn"
                onClick={() => updateQty(p.id, -1)}
                aria-label={`Decrease ${p.name} quantity`}
              >
                &minus;
              </button>
              <span className="order-item-premium__qty-val" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                className="order-item-premium__qty-btn"
                onClick={() => updateQty(p.id, 1)}
                aria-label={`Increase ${p.name} quantity`}
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="order-item-premium__remove"
              onClick={onRemove}
              aria-label={`Remove ${p.name} from order`}
            >
              <TrashIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
