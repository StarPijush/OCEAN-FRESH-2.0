import { useCallback, useEffect, useState } from 'react';

import { setShowToastFn } from './toast.js';

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
    setShowToastFn(show);
    return () => {
      setShowToastFn(null);
    };
  }, [show]);

  return (
    <div id="toast" className={visible ? 'show' : ''}>
      {message}
    </div>
  );
}
