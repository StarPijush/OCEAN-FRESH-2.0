import './OrderSuccessModal.css';

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { CheckIcon, ChevronRightIcon, CloseIcon } from '../ui/Icons.js';

interface OrderSuccessModalProps {
  orderNumber: string;
  total: number;
  onClose: () => void;
}

export function OrderSuccessModal({ orderNumber, total, onClose }: OrderSuccessModalProps) {
  const navigate = useNavigate();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const isDark =
    document.documentElement.getAttribute('data-theme') === 'home' ||
    document.documentElement.getAttribute('data-theme') === 'contact';

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Format price with Indian numbering system and 2 decimal places
  return (
    <div
      className={`order-success-overlay ${isDark ? 'dark' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-success-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="order-success-modal">
        <button
          ref={closeBtnRef}
          type="button"
          className="order-success-close"
          onClick={onClose}
          aria-label="Close order confirmation"
        >
          <CloseIcon size={20} />
        </button>

        <div className="order-success-icon">
          <CheckIcon size={24} />
        </div>

        <h2 id="order-success-title" className="order-success-title">
          Order validated
        </h2>

        <p className="order-success-message">
          Thank you for your purchase. Your package will be delivered within 2 days of your
          purchase.
        </p>

        <div className="order-success-divider" />

        <div className="order-success-info-card">
          <div className="order-success-info-grid">
            <div className="order-success-info-col">
              <span className="order-success-info-label">ORDER ID</span>
              <span className="order-success-info-value order-id">{orderNumber}</span>
            </div>
            <div className="order-success-info-divider" />
            <div className="order-success-info-col">
              <span className="order-success-info-label">TOTAL</span>
              <span className="order-success-info-value order-total">
                {'\u20B9'}
                {Number(total).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="order-success-actions">
          <button
            type="button"
            className="order-success-btn"
            onClick={() => {
              onClose();
              navigate('/products');
            }}
          >
            Continue Shopping
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
