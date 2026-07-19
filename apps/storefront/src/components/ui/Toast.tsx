import { useCallback, useEffect, useState } from 'react';

let showToastFn: ((msg: string) => void) | null = null;

export function showToast(msg: string) {
  showToastFn?.(msg);
}

export function Toast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (msg: string) => {
      setMessage(msg);
      setVisible(true);
      if (timer) clearTimeout(timer);
      const t = setTimeout(() => setVisible(false), 2200);
      setTimer(t);
    },
    [timer],
  );

  useEffect(() => {
    showToastFn = show;
    return () => {
      showToastFn = null;
    };
  }, [show]);

  return (
    <div id="toast" className={visible ? 'show' : ''}>
      {message}
    </div>
  );
}
