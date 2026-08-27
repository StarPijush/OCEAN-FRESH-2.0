import type { SVGProps } from 'react';

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

function BaseIcon({ size = 20, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function CartIcon({ size = 20, ...props }: IconProps) {
  return (
    <BaseIcon size={size} {...props}>
      <circle cx={8} cy={21} r={1.5} />
      <circle cx={19} cy={21} r={1.5} />
      <path d="M2.5 3h2l2.2 11.2a2 2 0 002 1.6h9.8a2 2 0 002-1.6L22 8H6.2" />
    </BaseIcon>
  );
}

export function ChevronRightIcon({ size = 20, ...props }: IconProps) {
  return (
    <BaseIcon size={size} {...props}>
      <path d="M9 6l6 6-6 6" />
    </BaseIcon>
  );
}

export function TrashIcon({ size = 20, ...props }: IconProps) {
  return (
    <BaseIcon size={size} {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" />
      <path d="M19 6l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </BaseIcon>
  );
}

export function SearchIcon({ size = 20, ...props }: IconProps) {
  return (
    <BaseIcon size={size} {...props}>
      <circle cx={11} cy={11} r={6} />
      <path d="M16.5 16.5l4 4" />
    </BaseIcon>
  );
}

export function CloseIcon({ size = 20, ...props }: IconProps) {
  return (
    <BaseIcon size={size} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </BaseIcon>
  );
}
