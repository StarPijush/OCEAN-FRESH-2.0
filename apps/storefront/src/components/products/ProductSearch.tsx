import { useRef } from 'react';

import { CloseIcon } from '../ui/Icons.js';

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * ProductSearch — light premium, compact 40px (was 45px) to sit beside 44px filter in one row.
 *
 * Reference snippet (dark 190px/45px/#16171d/#bdbecb) → OceanFresh ivory light premium:
 *   background → var(--color-ivory-card), border → var(--color-ivory-border),
 *   color → var(--color-text-light-primary), placeholder/fill → var(--color-text-light-secondary),
 *   focus/hover → var(--color-teal-border), shadow → var(--shadow-sm).
 *   Height 45→40 for compact toolbar, icon 1rem→18px explicit flex:0 0 18px to prevent huge magnifier.
 *   No styled-components — CSS in products-premium.css (#page-products .group). Wrapper flex handled by parent .product-controls.
 */
export function ProductSearch({
  value,
  onChange,
  placeholder = 'Search fish…',
}: ProductSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasQuery = value.trim().length > 0;

  function handleClear() {
    onChange('');
    inputRef.current?.focus();
  }

  return (
    <div className="of-search-root">
      <div className="search-wrap">
        <label htmlFor="query" className="sr-only">
          Search products
        </label>
        <div className="group" role="search">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="search-icon oceanfresh-search-icon"
          >
            <g>
              <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
            </g>
          </svg>
          <input
            ref={inputRef}
            id="query"
            className="input"
            type="search"
            placeholder={placeholder}
            name="searchbar"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Search products"
            autoComplete="off"
            enterKeyHint="search"
          />
          {hasQuery ? (
            <button
              type="button"
              className="of-search-clear"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <CloseIcon size={14} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
