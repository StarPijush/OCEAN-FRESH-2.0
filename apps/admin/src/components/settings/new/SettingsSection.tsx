import type { ReactNode } from 'react';

export interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-cream)' }}>{title}</div>
      {children}
    </div>
  );
}
