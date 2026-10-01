import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

export type ToastTone = 'ok' | 'error' | 'info';

interface ToastItem {
  id: number;
  text: string;
  tone: ToastTone;
}

type ToastFn = (text: string, tone?: ToastTone) => void;

const ToastCtx = createContext<ToastFn>(() => {});

export function useToast(): ToastFn {
  return useContext(ToastCtx);
}

const toneClass: Record<ToastTone, string> = {
  ok: 'border-ok/40 bg-ok-soft text-ok-ink',
  error: 'border-danger/40 bg-danger-soft text-danger-ink',
  info: 'border-brand/30 bg-brand-soft text-brand-ink',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const push = useCallback<ToastFn>((text, tone = 'info') => {
    const id = ++seq.current;
    setItems((cur) => [...cur.slice(-2), { id, text, tone }]);
    window.setTimeout(() => setItems((cur) => cur.filter((t) => t.id !== id)), 4200);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto max-w-md rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${toneClass[t.tone]}`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
