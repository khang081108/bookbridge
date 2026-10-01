import { useMemo, useSyncExternalStore, type AnchorHTMLAttributes, type ReactNode } from 'react';

/**
 * Bộ định tuyến băm (#/đường-dẫn) rất gọn. Không cần máy chủ cấu hình lại URL,
 * chạy được trên GitHub Pages, Vercel hay mở trực tiếp thư mục dist.
 */

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

function snapshot() {
  return window.location.hash || '#/';
}

export interface Route {
  path: string;
  query: URLSearchParams;
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, snapshot, () => '#/');
  return useMemo(() => {
    const raw = hash.replace(/^#/, '') || '/';
    const [p, q = ''] = raw.split('?');
    const path = p.length > 1 ? p.replace(/\/+$/, '') : p || '/';
    return { path: path.startsWith('/') ? path : `/${path}`, query: new URLSearchParams(q) };
  }, [hash]);
}

export function navigate(to: string) {
  window.location.hash = to.startsWith('#') ? to : `#${to}`;
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  children: ReactNode;
}

export function Link({ to, children, ...rest }: LinkProps) {
  return (
    <a href={`#${to}`} {...rest}>
      {children}
    </a>
  );
}
