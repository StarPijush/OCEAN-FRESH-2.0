import { useCookieConsent } from '../../context/CookieConsentContext.js';

export function CookieSettingsButton(props: {
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}) {
  const { openPreferences } = useCookieConsent();
  return (
    <button
      type="button"
      onClick={openPreferences}
      aria-label="Open cookie preferences"
      className={props.className}
      style={props.style}
    >
      {props.label ?? 'Cookie Settings'}
    </button>
  );
}
