let showToastFn: ((msg: string) => void) | null = null;

export function showToast(msg: string) {
  showToastFn?.(msg);
}

export function setShowToastFn(fn: ((msg: string) => void) | null): void {
  showToastFn = fn;
}
