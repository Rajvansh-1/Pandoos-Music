import { useState, useEffect, useCallback } from 'react';

let toastIdCounter = 0;
let globalAddToast = null;

/** Call this anywhere: showToast('message', 'success') */
export function showToast(message, type = 'info', duration = 3000) {
  globalAddToast?.({ id: ++toastIdCounter, message, type, duration });
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    setToasts(prev => [...prev.slice(-4), toast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, toast.duration);
  }, []);

  useEffect(() => {
    globalAddToast = addToast;
    return () => { globalAddToast = null; };
  }, [addToast]);

  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{ICONS[t.type]}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

const ICONS = {
  success: '✅',
  error:   '❌',
  info:    'ℹ️',
  warning: '⚠️',
};
