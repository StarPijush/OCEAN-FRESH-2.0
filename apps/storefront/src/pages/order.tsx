import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { showToast } from '../components/ui/Toast.js';
import { getProducts } from '../services/products.js';
import { useCartStore } from '../stores/cart.js';

export function OrderPage() {
  const cart = useCartStore((s) => s.items);
  const removeAll = useCartStore((s) => s.removeAll);
  const clear = useCartStore((s) => s.clear);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locStatus, setLocStatus] = useState('');
  const [mapHtml, setMapHtml] = useState('');

  const products = getProducts();

  const cartEntries = useMemo(() => Object.entries(cart).filter(([, q]) => q > 0), [cart]);

  const subtotal = useMemo(
    () =>
      cartEntries.reduce((sum, [id, qty]) => {
        const p = products.find((x) => x.id === id);
        return sum + (p?.price ?? 0) * qty;
      }, 0),
    [cartEntries, products],
  );

  const deliveryAmt = subtotal >= 500 ? 0 : 40;
  const total = subtotal + deliveryAmt;

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
        setMapHtml(`
          <a href="${url}" target="_blank" class="map-card" style="text-decoration:none;">
            <span style="font-size:1.6rem;">\u{1F4CD}</span>
            <div class="map-card-text">
              <div class="name">Location Confirmed</div>
              <div class="coord">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
              <div class="hint">Tap to open in Google Maps</div>
            </div>
          </a>
        `);
      },
      () => {
        setLocStatus('Unable to access location. Please allow permission.');
      },
    );
  }

  async function placeOrder() {
    if (!name.trim()) {
      showToast('Enter your name');
      return;
    }
    if (!phone.trim()) {
      showToast('Enter phone number');
      return;
    }
    if (!address.trim()) {
      showToast('Enter delivery address');
      return;
    }
    if (!cartEntries.length) {
      showToast('Cart is empty');
      return;
    }

    const lines = cartEntries
      .map(([id, qty]) => {
        const p = products.find((x) => x.id === id);
        const s = (p?.price ?? 0) * qty;
        return `\u2022 ${p?.name} \u2014 ${qty}kg \u2014 \u20B9${s}`;
      })
      .join('\n');

    const deliveryLine =
      deliveryAmt > 0 ? `\u{1F69A} *Delivery: \u20B9${deliveryAmt}*` : '\u{1F69A} *Delivery: Free*';

    const locLine = location
      ? `\u{1F4CD} Location:\nhttps://www.google.com/maps?q=${location.lat},${location.lng}`
      : '\u{1F4CD} Location: not shared';

    const msg = [
      '\u{1F41F} *New Order \u2014 OceanFresh*',
      '',
      `\u{1F464} *Name:* ${name}`,
      `\u{1F4F1} *Phone:* ${phone}`,
      '',
      '*Order:*',
      lines,
      '',
      `\u{1F4B0} *Subtotal: \u20B9${subtotal}*`,
      deliveryLine,
      `\u{1F4B0} *Total: \u20B9${total}*`,
      '',
      `\u{1F3E0} *Address:*\n${address}`,
      '',
      locLine,
      '',
      '_via OceanFresh_',
    ].join('\n');

    const waNum = '919876543210';
    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');

    clear();
    navigate('/');
    showToast('Order sent!');
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
                <div className="order-item-row" key={id}>
                  <div className="order-item-thumb-wrap">
                    {hasPhoto ? (
                      <img src={p.image ?? ''} alt={p.name} className="order-item-thumb" />
                    ) : (
                      <div className="order-item-emoji">{p.emoji}</div>
                    )}
                  </div>
                  <div className="order-item-info">
                    <div className="order-item-name">{p.name}</div>
                    <div className="order-item-meta">
                      {qty} kg &middot; \u20B9{p.price} / kg
                    </div>
                  </div>
                  <div className="order-item-price">
                    {'\u20B9'}
                    {sub}
                  </div>
                  <button className="order-item-remove" onClick={() => removeAll(id)}>
                    {'\u2715'}
                  </button>
                </div>
              );
            })}

            <div id="cart-total-section" style={{ display: 'block' }}>
              <div className="price-summary">
                <div className="price-row">
                  <span>Subtotal</span>
                  <span id="subtotal-val">
                    {'\u20B9'}
                    {subtotal}
                  </span>
                </div>
                <div className="price-row">
                  <span>Delivery</span>
                  <span id="delivery-val" className="free">
                    {deliveryAmt > 0 ? `\u20B9${deliveryAmt}` : 'Free'}
                    {deliveryAmt > 0 && subtotal < 500 ? (
                      <span style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>
                        {' '}
                        (free above \u20B9500)
                      </span>
                    ) : null}
                  </span>
                </div>
                <div className="price-row total">
                  <span>Total</span>
                  <span id="total-val">
                    {'\u20B9'}
                    {total}
                  </span>
                </div>
              </div>

              <div className="order-section-label">Your Details</div>
              <div style={{ paddingTop: '16px' }}>
                <div className="form-field">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Delivery Address</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Flat / Building / Street / Area / City"
                    style={{ resize: 'none' }}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="order-section-label">Location</div>
              <div style={{ paddingTop: '16px', marginBottom: '20px' }}>
                <button className="location-btn" onClick={getLocation}>
                  {'\u{1F4CD}'} &nbsp;Use My Current Location
                </button>
                <div id="location-status" dangerouslySetInnerHTML={{ __html: locStatus }} />
                {mapHtml && (
                  <div id="map-preview" style={{ display: 'block' }}>
                    <div className="map-card">
                      <span style={{ fontSize: '1.6rem' }}>{'\u{1F4CD}'}</span>
                      <div className="map-card-text">
                        <div className="name">Location Confirmed</div>
                        <div className="coord">
                          {location?.lat.toFixed(5)}, {location?.lng.toFixed(5)}
                        </div>
                        <div className="hint">Tap to open in Google Maps</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="order-section-label">Place Order</div>
              <div style={{ paddingTop: '16px', marginBottom: '8px' }}>
                <button className="btn-wa-full" onClick={placeOrder}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Send Order via WhatsApp
                </button>
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: '0.65rem',
                    color: 'var(--muted)',
                    marginTop: '8px',
                    letterSpacing: '0.06em',
                  }}
                >
                  Your order is sent securely to our shop WhatsApp
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
