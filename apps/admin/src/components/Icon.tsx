import type { ReactNode } from 'react';

/**
 * Typed inline SVG icon set — replaces the Ionicons font the app used under
 * React Native. Stroke style mirrors the storefront icon system; each glyph
 * is a 24×24 viewBox drawn with `currentColor`.
 */
export type IconName =
  | 'grid'
  | 'grid-outline'
  | 'fish'
  | 'fish-outline'
  | 'receipt'
  | 'receipt-outline'
  | 'settings'
  | 'settings-outline'
  | 'open'
  | 'open-outline'
  | 'log-out-outline'
  | 'menu'
  | 'alert-circle'
  | 'checkmark-circle'
  | 'close'
  | 'close-circle'
  | 'search'
  | 'image-outline'
  | 'star'
  | 'star-outline'
  | 'pencil-outline'
  | 'trash-outline'
  | 'add'
  | 'ellipse-outline'
  | 'chevron-up'
  | 'chevron-down'
  | 'calendar-outline'
  | 'cart-outline'
  | 'cash-outline'
  | 'refresh-outline'
  | 'trending-up-outline'
  | 'time-outline'
  | 'wallet-outline'
  | 'person-outline'
  | 'lock-closed-outline'
  | 'storefront-outline'
  | 'link-outline'
  | 'folder-outline'
  | 'layers-outline'
  | 'cube-outline'
  | 'more-vertical';

interface IconProps {
  name?: IconName;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
  className?: string;
}

function SvgIcon({
  size = 20,
  color = 'var(--color-muted2)',
  accessibilityLabel,
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      color={color}
      className={className}
      aria-hidden={accessibilityLabel ? undefined : true}
      role={accessibilityLabel ? 'img' : undefined}
      aria-label={accessibilityLabel}
    >
      {children}
    </svg>
  );
}

function GridPaths() {
  return (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.2" />
      <rect x="13" y="4" width="7" height="7" rx="1.2" />
      <rect x="4" y="13" width="7" height="7" rx="1.2" />
      <rect x="13" y="13" width="7" height="7" rx="1.2" />
    </>
  );
}

function FishPaths() {
  return (
    <>
      <path d="M2.5 17.5C8 20 14.5 20 21 14" />
      <path d="M21 14c-3-1.5-5-3.5-6.5-8.5-1.7 2.2-3 4.9-3.4 7.3" />
      <path d="M21 14c-4.5-2.5-8-2.5-12 0l-1.2-2.6c1.4-.7 3-1.3 4.7-1.6" />
      <circle cx="16.6" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </>
  );
}

function ReceiptPaths() {
  return (
    <>
      <path d="M6 3.5h12V20.5l-2.4-1.6L13.5 20l-1.5-1.1L10.5 20 9 18.9 6.6 20.5 6 3.5z" />
      <path d="M9.5 8.5h5" />
      <path d="M9.5 12h5" />
      <path d="M9.5 15.5h3" />
    </>
  );
}

function SettingsPaths() {
  return (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19 12a7 7 0 00-.15-1.4l2-1.55-2-3.46-2.35.95a7 7 0 00-2.4-1.4L13.7 2.5h-3.4l-.4 2.64a7 7 0 00-2.4 1.4l-2.35-.95-2 3.46 2 1.55a7 7 0 000 2.8l-2 1.55 2 3.46 2.35-.95a7 7 0 002.4 1.4l.4 2.64h3.4l.4-2.64a7 7 0 002.4-1.4l2.35.95 2-3.46-2-1.55c.1-.46.15-.92.15-1.4z" />
    </>
  );
}

function OpenPaths() {
  return (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9.5 9.5h5v5" />
      <path d="M14.5 9.5L9 15" />
    </>
  );
}

function LogOutPaths() {
  return (
    <>
      <path d="M14 4h4.5A1.5 1.5 0 0120 5.5v13a1.5 1.5 0 01-1.5 1.5H14" />
      <path d="M10 8.5L6.5 12l3.5 3.5" />
      <path d="M6.5 12H16" />
    </>
  );
}

function ChevronPaths({ up }: { up: boolean }) {
  return up ? <path d="M6 15l6-6 6 6" /> : <path d="M6 9l6 6 6-6" />;
}

export function OceanFreshIcon({ name, ...rest }: IconProps) {
  switch (name) {
    case 'grid':
      return (
        <SvgIcon {...rest}>
          <GridPaths />
        </SvgIcon>
      );
    case 'grid-outline':
      return (
        <SvgIcon {...rest}>
          <GridPaths />
        </SvgIcon>
      );
    case 'fish':
      return (
        <SvgIcon {...rest}>
          <FishPaths />
        </SvgIcon>
      );
    case 'fish-outline':
      return (
        <SvgIcon {...rest}>
          <FishPaths />
        </SvgIcon>
      );
    case 'receipt':
      return (
        <SvgIcon {...rest}>
          <ReceiptPaths />
        </SvgIcon>
      );
    case 'receipt-outline':
      return (
        <SvgIcon {...rest}>
          <ReceiptPaths />
        </SvgIcon>
      );
    case 'settings':
      return (
        <SvgIcon {...rest}>
          <SettingsPaths />
        </SvgIcon>
      );
    case 'settings-outline':
      return (
        <SvgIcon {...rest}>
          <SettingsPaths />
        </SvgIcon>
      );
    case 'open':
      return (
        <SvgIcon {...rest}>
          <OpenPaths />
        </SvgIcon>
      );
    case 'open-outline':
      return (
        <SvgIcon {...rest}>
          <OpenPaths />
        </SvgIcon>
      );
    case 'log-out-outline':
      return (
        <SvgIcon {...rest}>
          <LogOutPaths />
        </SvgIcon>
      );
    case 'menu':
      return (
        <SvgIcon {...rest}>
          <path d="M4 6.5h16" />
          <path d="M4 12h16" />
          <path d="M4 17.5h16" />
        </SvgIcon>
      );
    case 'alert-circle':
      return (
        <SvgIcon {...rest}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5v5" />
          <path d="M12 16.2v.1" />
        </SvgIcon>
      );
    case 'checkmark-circle':
      return (
        <SvgIcon {...rest}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M8 12.5l2.8 2.8L16 9.5" />
        </SvgIcon>
      );
    case 'close':
      return (
        <SvgIcon {...rest}>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </SvgIcon>
      );
    case 'close-circle':
      return (
        <SvgIcon {...rest}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M9.5 9.5l5 5" />
          <path d="M14.5 9.5l-5 5" />
        </SvgIcon>
      );
    case 'search':
      return (
        <SvgIcon {...rest}>
          <circle cx="11" cy="11" r="7" />
          <path d="M20.5 20.5L16 16" />
        </SvgIcon>
      );
    case 'image-outline':
      return (
        <SvgIcon {...rest}>
          <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
          <circle cx="9" cy="9.5" r="1.6" />
          <path d="M4.5 17.5l5-4.5 3.5 3 3-2.5 3.5 4" />
        </SvgIcon>
      );
    case 'star':
      return (
        <SvgIcon {...rest}>
          <path
            d="M12 3.5l2.5 5.2 5.7.7-4.2 3.9 1.1 5.6L12 16l-5.1 2.9 1.1-5.6-4.2-3.9 5.7-.7L12 3.5z"
            fill="currentColor"
            stroke="none"
          />
        </SvgIcon>
      );
    case 'star-outline':
      return (
        <SvgIcon {...rest}>
          <path d="M12 3.5l2.5 5.2 5.7.7-4.2 3.9 1.1 5.6L12 16l-5.1 2.9 1.1-5.6-4.2-3.9 5.7-.7L12 3.5z" />
        </SvgIcon>
      );
    case 'pencil-outline':
      return (
        <SvgIcon {...rest}>
          <path d="M4.5 19.5l.8-3.6L16.6 4.6a1.6 1.6 0 012.3 0l.5.5a1.6 1.6 0 010 2.3L8.1 18.7l-3.6.8z" />
          <path d="M14.5 6.7l2.8 2.8" />
        </SvgIcon>
      );
    case 'trash-outline':
      return (
        <SvgIcon {...rest}>
          <path d="M4.5 7h15" />
          <path d="M9.5 7V4.5h5V7" />
          <path d="M6.5 7l.8 13h9.4l.8-13" />
          <path d="M10 11v5.5" />
          <path d="M14 11v5.5" />
        </SvgIcon>
      );
    case 'add':
      return (
        <SvgIcon {...rest}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </SvgIcon>
      );
    case 'ellipse-outline':
      return (
        <SvgIcon {...rest}>
          <circle cx="12" cy="12" r="8" />
        </SvgIcon>
      );
    case 'chevron-up':
      return (
        <SvgIcon {...rest}>
          <ChevronPaths up />
        </SvgIcon>
      );
    case 'chevron-down':
      return (
        <SvgIcon {...rest}>
          <ChevronPaths up={false} />
        </SvgIcon>
      );
    case 'calendar-outline':
      return (
        <SvgIcon {...rest}>
          <rect x="4" y="5.5" width="16" height="15" rx="2" />
          <path d="M4 10h16" />
          <path d="M8 3.5V7" />
          <path d="M16 3.5V7" />
        </SvgIcon>
      );
    case 'cart-outline':
      return (
        <SvgIcon {...rest}>
          <path d="M3 4h2.2l2.4 12.2a1.6 1.6 0 001.57 1.3h8.56a1.6 1.6 0 001.57-1.28L21 8.5H6.1" />
          <circle cx="10" cy="21" r="1.2" />
          <circle cx="17.5" cy="21" r="1.2" />
        </SvgIcon>
      );
    case 'cash-outline':
      return (
        <SvgIcon {...rest}>
          <rect x="2.5" y="6.5" width="19" height="11" rx="2" />
          <circle cx="12" cy="12" r="2.6" />
          <path d="M5.5 9.5v.01" />
          <path d="M18.5 14.5v.01" />
        </SvgIcon>
      );
    case 'trending-up-outline':
      return (
        <SvgIcon {...rest}>
          <path d="M3.5 17.5l6-6 3.5 3.5 7.5-7.5" />
          <path d="M15 7.5h5.5V13" />
        </SvgIcon>
      );
    case 'time-outline':
      return (
        <SvgIcon {...rest}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </SvgIcon>
      );
    case 'wallet-outline':
      return (
        <SvgIcon {...rest}>
          <rect x="3" y="6" width="18" height="13" rx="2.5" />
          <path d="M16 12h5v3h-5a1.5 1.5 0 010-3z" />
        </SvgIcon>
      );
    case 'refresh-outline':
      return (
        <SvgIcon {...rest}>
          <path d="M20 12a8 8 0 11-2.34-5.66" />
          <path d="M20 4v4h-4" />
        </SvgIcon>
      );
    case 'person-outline':
      return (
        <SvgIcon {...rest}>
          <circle cx="12" cy="8" r="3.8" />
          <path d="M4.5 20c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5" />
        </SvgIcon>
      );
    case 'lock-closed-outline':
      return (
        <SvgIcon {...rest}>
          <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" />
          <path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" />
          <path d="M12 14.5v2" />
        </SvgIcon>
      );
    case 'storefront-outline':
      return (
        <SvgIcon {...rest}>
          <path d="M4.5 10.5v8a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5v-8" />
          <path d="M4 10.5h16" />
          <path d="M4 10.5l1.2-5A1.5 1.5 0 016.7 4.5h10.6a1.5 1.5 0 011.5 1l1.2 5" />
          <path d="M9 15.5h6" />
        </SvgIcon>
      );
    case 'link-outline':
      return (
        <SvgIcon {...rest}>
          <path d="M10 14a4.5 4.5 0 006.4.4l3-3a4.5 4.5 0 00-6.4-6.4l-1.5 1.5" />
          <path d="M14 10a4.5 4.5 0 00-6.4-.4l-3 3a4.5 4.5 0 006.4 6.4l1.5-1.5" />
        </SvgIcon>
      );
    case 'folder-outline':
      return (
        <SvgIcon {...rest}>
          <path d="M3 7.5A1.5 1.5 0 014.5 6h5.2l2 2H19.5A1.5 1.5 0 0121 9.5v8A1.5 1.5 0 0119.5 19h-15A1.5 1.5 0 013 17.5v-10z" />
        </SvgIcon>
      );
    case 'layers-outline':
      return (
        <SvgIcon {...rest}>
          <path d="M12 3.5l8 4.5-8 4.5-8-4.5 8-4.5z" />
          <path d="M4 12l8 4.5 8-4.5" />
          <path d="M4 16l8 4.5 8-4.5" />
        </SvgIcon>
      );
    case 'cube-outline':
      return (
        <SvgIcon {...rest}>
          <path d="M12 4l7 3.5v7L12 18l-7-3.5v-7L12 4z" />
          <path d="M12 11.5V18" />
          <path d="M5 7.5l7 4 7-4" />
        </SvgIcon>
      );
    case 'more-vertical':
      return (
        <SvgIcon {...rest}>
          <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" />
        </SvgIcon>
      );
    default:
      return (
        <SvgIcon {...rest}>
          <circle cx="12" cy="12" r="8" />
        </SvgIcon>
      );
  }
}

export function Icon({ name, ...rest }: IconProps) {
  return <OceanFreshIcon name={name} {...rest} />;
}
