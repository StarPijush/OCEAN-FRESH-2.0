interface ProductFilterButtonProps {
  onClick?: () => void;
  label?: string;
}

/**
 * ProductFilterButton — light premium adaptation of provided dark filter snippet.
 *
 * Source dark (styled-components):
 *   .filter { width:50px; height:50px; border-radius:10px; border:1px solid rgba(0,0,0,0.192); box-shadow:0 10px 10px rgba(0,0,0,0.021) }
 *   .filter svg { height:16px; fill:rgb(77,77,77) }
 *   .filter:hover { background:rgb(59,59,59); fill:white }
 *
 * Adapted:
 *   canvas → var(--color-ivory-card), border → var(--color-ivory-border), shadow → var(--shadow-sm)-like,
 *   svg fill → var(--color-text-light-secondary), hover bg → var(--color-navy-deep), hover fill → var(--color-text-primary),
 *   size 50→44 to balance compact 40px search (still 44px tap target), flex:0 0 auto via parent.
 *   Scoped by #page-products .filter to avoid global SVG overrides; svg explicitly 16px flex:0 0 16px.
 */
export function ProductFilterButton({
  onClick,
  label = 'Filter and sort',
}: ProductFilterButtonProps) {
  return (
    <button type="button" title="filter" aria-label={label} className="filter" onClick={onClick}>
      <svg viewBox="0 0 512 512" aria-hidden="true" height="1em">
        <path d="M0 416c0 17.7 14.3 32 32 32l54.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-246.7 0c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48L32 384c-17.7 0-32 14.3-32 32zm128 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32-80c-32.8 0-61 19.7-73.3 48L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l246.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48l54.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-54.7 0c-12.3-28.3-40.5-48-73.3-48zM192 128a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm73.3-64C253 35.7 224.8 16 192 16s-61 19.7-73.3 48L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l86.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L265.3 64z" />
      </svg>
    </button>
  );
}
