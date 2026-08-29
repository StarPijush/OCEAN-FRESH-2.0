import { useEffect } from 'react';

import { Checkbox } from '../ui/Checkbox.js';

interface FilterOption {
  key: string;
  label: string;
}

interface ProductFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  options: FilterOption[];
  selected: string[];
  onSelectedChange: (next: string[]) => void;
  resultCount: number;
}

export function ProductFilterDrawer({
  open,
  onClose,
  options,
  selected,
  onSelectedChange,
  resultCount,
}: ProductFilterDrawerProps) {
  const isAllChecked = selected.length === 0;

  function handleToggle(key: string, nextChecked: boolean) {
    if (key === 'all') {
      if (nextChecked) onSelectedChange([]);
      return;
    }
    if (nextChecked) {
      onSelectedChange([...selected, key]);
    } else {
      const next = selected.filter((k) => k !== key);
      onSelectedChange(next);
    }
  }

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="filter-drawer-overlay" onClick={onClose} aria-hidden={!open}>
      <div
        className="filter-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="filter-drawer-handle" aria-hidden="true" />
        <div className="filter-drawer-header">
          <h2 className="filter-drawer-title">Filters</h2>
          <button
            type="button"
            className="filter-drawer-close"
            onClick={onClose}
            aria-label="Close filters"
          >
            ×
          </button>
        </div>

        <div className="filter-drawer-body">
          <div className="filter-group">
            <div className="filter-group-header">
              <span className="filter-group-title">Category</span>
              <span className="filter-group-chevron" aria-hidden="true">
                ⌄
              </span>
            </div>
            <div className="filter-group-content">
              {options.map((opt) => {
                const checked = opt.key === 'all' ? isAllChecked : selected.includes(opt.key);
                return (
                  <Checkbox
                    key={opt.key}
                    label={opt.label}
                    checked={checked}
                    onChange={(next) => handleToggle(opt.key, next)}
                    id={`filter-cat-${opt.key}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="filter-drawer-footer">
          <button type="button" className="btn btn-navy filter-drawer-cta" onClick={onClose}>
            Show {resultCount} Result{resultCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
