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

export function HouseIcon({ size = 20, ...props }: IconProps) {
  return (
    <BaseIcon size={size} {...props}>
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4H9v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z" />
    </BaseIcon>
  );
}

export function FishIcon({ size = 20, ...props }: IconProps) {
  return (
    <BaseIcon size={size} {...props}>
      <path d="M6 13c1.5 2.2 4 3.8 8 3.8 3 0 5.5-1.6 7-4-1.5-2.4-4-4-7-4-4 0-6.5 1.6-8 3.8Z" />
      <path d="M18 12c-1 .8-1 1.2 0 2" />
      <path d="M6 13c-1.2-.6-2-1.5-2-1s.8 1 2 1Z" />
      <circle cx={12} cy={12} r={1} fill="currentColor" stroke="none" />
    </BaseIcon>
  );
}

export function PackageOpenIcon({ size = 20, ...props }: IconProps) {
  return (
    <BaseIcon size={size} {...props}>
      <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
      <path d="M3 7.5v9L12 21l9-4.5v-9" />
      <path d="M12 12v9" />
      <path d="M7.5 9 12 12l4.5-3" />
      <path d="M3 7.5c0 1.5 2 2.8 4.5 3L12 12" opacity={0.5} />
    </BaseIcon>
  );
}

export function MailIcon({ size = 20, ...props }: IconProps) {
  return (
    <BaseIcon size={size} {...props}>
      <rect x={3} y={5} width={18} height={14} rx={1.5} />
      <path d="M3.5 6 12 12.5 20.5 6" />
    </BaseIcon>
  );
}

export function PackageIcon({ size = 20, ...props }: IconProps) {
  return (
    <BaseIcon size={size} {...props}>
      <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
      <path d="M3 12 12 16.5 21 12" />
      <path d="M3 7.5v9L12 21l9-4.5v-9" />
    </BaseIcon>
  );
}

export function CheckIcon({ size = 20, ...props }: IconProps) {
  return (
    <BaseIcon size={size} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </BaseIcon>
  );
}
