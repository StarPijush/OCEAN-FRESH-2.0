import { useRef, useState } from 'react';

import { useSettings } from '../../context/settings-context.js';
import { pincodeService } from '../../services/pincode.service.js';

export function DeliveryChecker() {
  const settings = useSettings();
  const [result, setResult] = useState<{ type: string; msg: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function checkDelivery() {
    const pin = inputRef.current?.value.trim() ?? '';
    const check = pincodeService.validate(pin, settings.pincodes);
    if (!check.isValid || !check.isServiceable) {
      setResult({ type: check.isValid ? 'err' : 'warn', msg: check.message });
      return;
    }
    setResult({ type: 'ok', msg: check.message });
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
          color: 'var(--color-text-secondary)',
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
