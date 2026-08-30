import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { OrderSuccessModal } from '../components/order/OrderSuccessModal.js';
import { OrderSummary } from '../components/order/OrderSummary.js';
import { TrashIcon } from '../components/ui/Icons.js';
import { showToast } from '../components/ui/toastController.js';
import { useSettings } from '../context/settings-context.js';
import {
  type OrderCartEntry,
  orderService,
  persistOrder,
  productService,
  type ProductVM,
  useCartStore,
} from '../services/index.js';

export function OrderPage() {
  const cart = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeAll = useCartStore((s) => s.removeAll);
  const clear = useCartStore((s) => s.clear);
  const navigate = useNavigate();
  const settings = useSettings();

  const [products, setProducts] = useState<ProductVM[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locStatus, setLocStatus] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string; total: number } | null>(
    null,
  );

  useEffect(() => {
    productService.getAll().then(setProducts);
  }, []);

  const cartEntries = useMemo(() => Object.entries(cart).filter(([, q]) => q > 0), [cart]);

  const entries = useMemo(() => {
    return cartEntries.flatMap(([id, qty]): OrderCartEntry[] => {
      const p = products.find((x) => x.id === id);
      return p ? [{ product: p, quantity: qty }] : [];
    });
  }, [cartEntries, products]);

  const pricing = useMemo(
    () => orderService.calculatePricing(entries, settings.freeDeliveryAbove, settings.deliveryFee),
    [entries, settings.freeDeliveryAbove, settings.deliveryFee],
  );

  const subtotal = pricing.subtotal;
  const deliveryAmt = pricing.deliveryCharge;
  const total = pricing.total;

  async function getLocation() {
    if (!navigator.geolocation) {
      setLocStatus('Geolocation not supported.');
      return;
    }
    setLocStatus('Locating\u2026');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocation({ lat, lng });
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        setLocStatus(
          `Location captured &middot; <a href="${url}" target="_blank" style="color:var(--aqua);font-weight:600;">Open in Maps &rarr;</a>`,
        );
      },
      () => {
        setLocStatus('Unable to access location. Please allow permission.');
      },
    );
  }

  async function placeOrder() {
    const entries = cartEntries.flatMap(([id, qty]): OrderCartEntry[] => {
      const p = products.find((x) => x.id === id);
      return p ? [{ product: p, quantity: qty }] : [];
    });

    const err = orderService.validateForm({ name, phone, address }, entries);
    if (err) {
      showToast(err);
      return;
    }

    const orderPricing = orderService.calculatePricing(
      entries,
      settings.freeDeliveryAbove,
      settings.deliveryFee,
    );

    try {
      const result = await persistOrder({ name, phone, address }, entries, orderPricing, location);
      const msg = orderService.buildWhatsAppMessage(
        { name, phone, address },
        entries,
        orderPricing,
        location ?? undefined,
      );
      orderService.sendViaWhatsApp(msg, settings.orderWhatsApp);

      setOrderSuccess({ orderNumber: result.orderNumber, total: result.total });
      return;
    } catch (err) {
      console.error('Order could not be saved to the database.', err);
      showToast('Order failed to save. Please try again.');
      return;
    }
  }

  function handleOrderSuccessClose() {
    clear();
    navigate('/');
    setOrderSuccess(null);
  }

  return (
    <div id="page-order" className="page active">
      <div className="order-header-inner">Your Order</div>
      <div className="divider"></div>

      <div className="order-wrap">
        {cartEntries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{'\u{1F6D2}'}</div>
            <div className="empty-title">Your cart is empty</div>
            <div className="empty-sub">Browse our fresh catch and add something delicious.</div>
            <button className="btn btn-dark" onClick={() => navigate('/products')}>
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <div className="order-section-label">
              Order Items &middot; {cartEntries.length} item{cartEntries.length > 1 ? 's' : ''}
            </div>

            {cartEntries.map(([id, qty]) => {
              const p = products.find((x) => x.id === id);
              if (!p) return null;
              const sub = p.price * qty;
              const hasPhoto = p.image && !p.image.startsWith('data:image/svg');
              return (
                <article className="order-card" key={id} aria-label={`${p.name} — ${qty} kg`}>
                  <div className="order-card__main">
                    {hasPhoto ? (
                      <img src={p.image ?? ''} alt={p.name} className="order-card__media" />
                    ) : (
                      <div className="order-card__media--fallback" role="img" aria-label={p.name}>
                        {p.emoji}
                      </div>
                    )}
                    <div className="order-card__body">
                      <h3 className="order-card__name">{p.name}</h3>
                      <div className="order-card__meta">
                        {qty} kg · ₹{p.price} / kg
                      </div>
                      <div className="order-card__price">₹{sub}</div>
                    </div>
                  </div>
                  <div className="order-card__actions">
                    <div
                      className="order-card__qty"
                      role="group"
                      aria-label={`Quantity for ${p.name}`}
                    >
                      <button
                        type="button"
                        className="order-card__qty-btn"
                        aria-label={`Decrease ${p.name}`}
                        onClick={() => updateQty(id, -1)}
                      >
                        −
                      </button>
                      <span className="order-card__qty-val" aria-live="polite">
                        {qty}
                      </span>
                      <button
                        type="button"
                        className="order-card__qty-btn"
                        aria-label={`Increase ${p.name}`}
                        onClick={() => updateQty(id, 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="order-card__delete"
                      aria-label={`Remove ${p.name}`}
                      onClick={() => removeAll(id)}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </article>
              );
            })}

            <div id="cart-total-section" style={{ display: 'block' }}>
              <div className="order-section-label">Your Details</div>
              <div style={{ paddingTop: '16px' }}>
                <div className="form-field">
                  <label className="form-label" htmlFor="order-name">
                    Full Name
                  </label>
                  <input
                    id="order-name"
                    type="text"
                    className="form-control"
                    placeholder="Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="order-phone">
                    Phone Number
                  </label>
                  <input
                    id="order-phone"
                    type="tel"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="order-address">
                    Delivery Address
                  </label>
                  <textarea
                    id="order-address"
                    className="form-control"
                    rows={3}
                    placeholder="Flat / Building / Street / Area / City"
                    style={{ resize: 'none' }}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    autoComplete="street-address"
                  />
                </div>
              </div>

              <div className="order-section-label">Location</div>
              <div style={{ paddingTop: '16px', marginBottom: '20px' }}>
                <button className="location-btn" onClick={getLocation} type="button">
                  📍 Use My Current Location
                </button>
                <div id="location-status" dangerouslySetInnerHTML={{ __html: locStatus }} />
              </div>

              <div className="order-section-label">Place Order</div>
              <div style={{ paddingTop: '16px', marginBottom: '20px' }}>
                <button className="btn-wa-full" onClick={placeOrder} type="button">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Send Order via WhatsApp
                </button>
                <div className="order-wa-microcopy">
                  Your order is sent securely to our shop WhatsApp
                </div>
              </div>

              <OrderSummary
                subtotal={subtotal}
                deliveryAmt={deliveryAmt}
                total={total}
                freeDeliveryAbove={settings.freeDeliveryAbove}
              />
            </div>
          </>
        )}
      </div>

      {orderSuccess && (
        <OrderSuccessModal
          orderNumber={orderSuccess.orderNumber}
          total={orderSuccess.total}
          onClose={handleOrderSuccessClose}
        />
      )}
    </div>
  );
}
