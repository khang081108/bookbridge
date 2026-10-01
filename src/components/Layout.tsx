import type { ReactNode } from 'react';
import { Link, navigate, useRoute } from '../lib/router';
import { useApp } from '../lib/store';
import type { Role } from '../types';
import { Icon } from './ui';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#0d5c63" />
        <path d="M6 27 Q20 7 34 27" fill="none" stroke="#f5f1e8" strokeWidth="3.2" strokeLinecap="round" />
        <rect x="6" y="26" width="6" height="7" rx="1.2" fill="#e8a33d" />
        <rect x="28" y="26" width="6" height="7" rx="1.2" fill="#e8a33d" />
      </svg>
      <span className="font-display text-xl font-semibold tracking-tight">BookBridge</span>
    </span>
  );
}

const ROLES: { id: Role; label: string; home: string; icon: 'user' | 'users' | 'school' }[] = [
  { id: 'student', label: 'Học sinh', home: '/student', icon: 'user' },
  { id: 'teacher', label: 'Giáo viên', home: '/teacher', icon: 'users' },
  { id: 'admin', label: 'Nhà trường', home: '/admin', icon: 'school' },
];

const ROLE_NAV: Record<Role, { to: string; label: string; exact?: boolean }[]> = {
  student: [
    { to: '/student', label: 'Tổng quan', exact: true },
    { to: '/student/learn', label: 'Học liệu' },
    { to: '/student/books', label: 'Thư viện sách' },
  ],
  teacher: [
    { to: '/teacher', label: 'Lớp học', exact: true },
    { to: '/teacher/packs', label: 'Learning Pack' },
  ],
  admin: [{ to: '/admin', label: 'Tổng quan trường', exact: true }],
};

function TemporaryBanner() {
  const { state } = useApp();
  if (state.temporaryMode) {
    return (
      <div className="border-b border-sun/40 bg-sun-soft text-sun-ink">
        <p className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-sm font-medium">
          <Icon name="clock" className="h-4 w-4 shrink-0" />
          <span>
            <strong>Chế độ hỗ trợ tạm thời đang bật.</strong> Khi SGK chính thức về đủ, hệ thống sẽ chuyển thành thư viện
            và kho học liệu.
          </span>
        </p>
      </div>
    );
  }
  return (
    <div className="border-b border-ok/30 bg-ok-soft text-ok-ink">
      <p className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-sm font-medium">
        <Icon name="check" className="h-4 w-4 shrink-0" />
        <span>
          <strong>100% học sinh đã có SGK.</strong> Chế độ hỗ trợ tạm thời đã tắt, BookBridge đang là thư viện và kho học
          liệu.
        </span>
      </p>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { state, actions } = useApp();
  const { path } = useRoute();

  const nav = [
    { to: '/', label: 'Trang chủ', exact: true },
    { to: '/about', label: 'Mô hình & bản quyền' },
    ...ROLE_NAV[state.role],
  ];

  const isActive = (to: string, exact?: boolean) => (exact ? path === to : path === to || path.startsWith(`${to}/`));

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-white"
      >
        Bỏ qua điều hướng
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2.5">
          <Link to="/" aria-label="BookBridge – về trang chủ">
            <Logo />
          </Link>

          <div className="flex items-center gap-2" role="group" aria-label="Chọn vai trò xem thử">
            <span className="hidden text-xs font-semibold uppercase tracking-wide text-muted sm:inline">Xem với vai trò</span>
            <div className="flex rounded-xl border border-line bg-card p-1">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={state.role === r.id}
                  onClick={() => navigate(r.home)}
                  className={`flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold transition-colors sm:px-3 ${
                    state.role === r.id ? 'bg-brand text-white' : 'text-ink hover:bg-brand-soft'
                  }`}
                >
                  <Icon name={r.icon} className="h-4 w-4" />
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <nav aria-label="Điều hướng chính" className="-mx-1 order-3 flex w-full gap-1 overflow-x-auto pb-1 md:order-none md:mx-0 md:w-auto md:pb-0">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                aria-current={isActive(n.to, n.exact) ? 'page' : undefined}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive(n.to, n.exact) ? 'bg-brand-soft text-brand-ink' : 'text-ink/80 hover:bg-ink/5'
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <TemporaryBanner />
      </header>

      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 outline-none">
        {children}
      </main>

      <footer className="border-t border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-muted">
          <p>
            <strong className="text-ink">BookBridge</strong> – Thiếu sách không có nghĩa là thiếu cơ hội học tập. Bản demo dùng dữ
            liệu giả lập, không phân phối nội dung SGK có bản quyền.
          </p>
          <button
            type="button"
            onClick={actions.resetDemo}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 font-semibold text-ink hover:bg-brand-soft"
          >
            <Icon name="refresh" className="h-4 w-4" />
            Khôi phục dữ liệu demo
          </button>
        </div>
      </footer>
    </div>
  );
}
