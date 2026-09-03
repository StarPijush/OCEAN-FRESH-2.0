import { type ReactNode, useEffect, useRef } from 'react';

export type TabsVariant = 'default' | 'segmented';

export interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
  count?: number;
  icon?: ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  variant?: TabsVariant;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  value,
  onChange,
  variant = 'default',
  className = '',
  style,
  ariaLabel,
}) => {
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeTab = tabsRef.current?.querySelector('[data-active="true"]');
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [value]);

  const baseStyles: React.CSSProperties = {
    display: 'flex',
    gap: variant === 'segmented' ? 0 : '8px',
    ...style,
  };

  const variantContainerStyles: Record<TabsVariant, React.CSSProperties> = {
    default: {},
    segmented: {
      background: 'var(--color-surface2)',
      border: '1px solid var(--color-border2)',
      borderRadius: 'var(--radius-md)',
      padding: '2px',
    },
  };

  const tabBaseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--text-button-sm-size)',
    lineHeight: 'var(--text-button-sm-line)',
    fontWeight: 'var(--text-button-sm-weight)',
    letterSpacing: 'var(--text-button-sm-tracking)',
    textTransform: 'var(--text-button-sm-transform)',
    color: 'var(--color-muted)',
    background: 'transparent',
    border: variant === 'segmented' ? 'none' : '1px solid var(--color-border2)',
    borderRadius: variant === 'segmented' ? 'var(--radius-sm)' : 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 150ms var(--ease-out)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  };

  const tabActiveStyles: React.CSSProperties = {
    color: variant === 'segmented' ? '#FFFFFF' : '#0B130F',
    background: variant === 'segmented' ? '#0d2035' : 'rgba(74,184,193,0.10)',
    borderColor: variant === 'segmented' ? 'transparent' : 'rgba(74,184,193,0.18)',
  };

  const tabHoverStyles: React.CSSProperties = {
    color: '#0B130F',
    background: variant === 'segmented' ? 'transparent' : '#F8FAF9',
    borderColor: variant === 'segmented' ? 'transparent' : 'rgba(11,19,15,0.12)',
  };

  const tabDisabledStyles: React.CSSProperties = {
    opacity: 0.4,
    cursor: 'not-allowed',
  };

  return (
    <div
      ref={tabsRef}
      role="tablist"
      aria-label={ariaLabel}
      className={className}
      style={{ ...baseStyles, ...variantContainerStyles[variant] }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={value === tab.value}
          aria-disabled={tab.disabled}
          disabled={tab.disabled}
          id={`tab-${tab.value}`}
          aria-controls={`panel-${tab.value}`}
          tabIndex={value === tab.value ? 0 : -1}
          data-active={value === tab.value}
          style={{
            ...tabBaseStyles,
            ...(value === tab.value ? tabActiveStyles : {}),
            ...(tab.disabled ? tabDisabledStyles : {}),
          }}
          onClick={() => !tab.disabled && onChange(tab.value)}
          onKeyDown={(e) => {
            if (tab.disabled) return;
            const index = tabs.findIndex((t) => !t.disabled && t.value === value);
            let newIndex = index;
            if (e.key === 'ArrowRight')
              newIndex = (index + 1) % tabs.filter((t) => !t.disabled).length;
            if (e.key === 'ArrowLeft')
              newIndex =
                (index - 1 + tabs.filter((t) => !t.disabled).length) %
                tabs.filter((t) => !t.disabled).length;
            if (e.key === 'Home') newIndex = 0;
            if (e.key === 'End') newIndex = tabs.filter((t) => !t.disabled).length - 1;
            if (newIndex !== index) {
              e.preventDefault();
              const enabledTabs = tabs.filter((t) => !t.disabled);
              onChange(enabledTabs[newIndex].value);
            }
          }}
          onMouseEnter={(e) => {
            if (!tab.disabled && value !== tab.value) {
              Object.assign(e.currentTarget.style, tabHoverStyles);
            }
          }}
          onMouseLeave={(e) => {
            if (!tab.disabled && value !== tab.value) {
              Object.assign(e.currentTarget.style, tabBaseStyles);
            }
          }}
        >
          {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span
              style={{
                background: value === tab.value ? 'rgba(255,255,255,0.16)' : '#F8FAF9',
                color: value === tab.value ? '#FFFFFF' : '#6C7E75',
                border: '1px solid rgba(11,19,15,0.06)',
                padding: '1px 6px',
                borderRadius: 9999,
                fontSize: '10px',
                fontWeight: 700,
              }}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
