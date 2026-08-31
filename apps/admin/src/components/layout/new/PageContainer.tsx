import type { ReactNode } from 'react';

export interface PageContainerProps {
  children: ReactNode;
  maxWidth?: number;
  padding?: string;
}

export function PageContainer({ children, maxWidth = 1120, padding = '24px' }: PageContainerProps) {
  return (
    <div
      style={{
        maxWidth,
        margin: '0 auto',
        width: '100%',
        padding,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {children}
    </div>
  );
}
