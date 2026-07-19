import { useRef, useState } from 'react';

import { servicePincodes } from '../../types/legacy.js';

export function DeliveryChecker() {
  const [result, setResult] = useState<{ type: string; msg: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function checkDelivery() {
    const pin = inputRef.current?.value.trim() ?? '';
    if (pin.length !== 6) {
      setResult({ type: 'warn', msg: 'Please enter a valid 6-digit PIN code.' });
      return;
    }
    if (servicePincodes.includes(pin)) {
      setResult({ type: 'ok', msg: '\u2713 Delivery available \u00B7 Expected 2\u20133 hours' });
    } else {
      setResult({
        type: 'err',
        msg: '\u2715 Not delivering to this area yet \u2014 expanding soon.',
      });
    }
  }

  return (
    <section className="section section-alt">
      <div className="section-eyebrow reveal">Service Area</div>
      <h2 className="section-title-lg reveal">
        Deliver
        <br />
        to You?
      </h2>
      <div className="section-rule reveal"></div>
      <p
        style={{
          fontSize: '0.8rem',
          color: 'rgba(245,240,232,0.5)',
          lineHeight: 1.7,
          marginBottom: '24px',
        }}
        className="reveal"
      >
        Enter your Jhargram PIN code to check if we deliver to your neighbourhood.
      </p>
      <div className="pin-wrap reveal">
        <input
          type="number"
          ref={inputRef}
          className="pin-input"
          placeholder="400 001"
          maxLength={6}
          onInput={(e) => {
            const el = e.target as HTMLInputElement;
            if (el.value.length > 6) el.value = el.value.slice(0, 6);
          }}
        />
        <button className="btn btn-dark" onClick={checkDelivery}>
          Check
        </button>
      </div>
      <div
        id="pincode-result"
        className={`pin-result${result ? ` ${result.type}` : ''}`}
        style={{ display: result ? 'block' : 'none' }}
      >
        {result?.msg}
      </div>
    </section>
  );
}
