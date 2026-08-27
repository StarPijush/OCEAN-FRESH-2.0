import { colors } from '../theme';

/**
 * Minimal singleton toast, matching the reference: bottom-centered, compact,
 * colored status edge. Imperative API — no React state, no dependencies.
 */

type ToastType = 'default' | 'success' | 'error';

let toastEl: HTMLDivElement | null = null;
let toastTimer: number | undefined;

function ensureToastEl(): HTMLDivElement {
  if (toastEl) return toastEl;
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(12px);
    background: ${colors.surfaceAlive};
    color: ${colors.cream};
    padding: 11px 20px;
    border-radius: 3px;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    z-index: 500;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s cubic-bezier(0.16,1,0.3,1), transform 0.3s cubic-bezier(0.16,1,0.3,1);
    white-space: nowrap;
    border-left: 3px solid ${colors.aqua};
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 90vw;
    overflow: hidden;
    text-overflow: ellipsis;
  `;
  document.body.appendChild(el);
  toastEl = el;
  return el;
}

export function toast(message: string, type: ToastType = 'default') {
  const el = ensureToastEl();
  el.textContent = message;
  el.style.borderLeftColor =
    type === 'success' ? colors.green : type === 'error' ? colors.warn : colors.aqua;
  clearTimeout(toastTimer);
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
  });
  toastTimer = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(12px)';
  }, 2800) as unknown as number;
}
