import { useRef } from 'react';

import { CloseIcon, SearchIcon } from '../ui/Icons.js';

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

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
      <div className="search-wrap" style={{ paddingTop: 12, paddingBottom: 12 }}>
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <div className="search-box of-search-box">
          <SearchIcon size={16} className="search-box-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            id="product-search"
            type="search"
            className="search-input of-search-input"
            placeholder={placeholder}
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
