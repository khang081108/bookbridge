import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { createInitialState } from '../data/mockData';
import { MAX_RENEWALS, STATE_VERSION, STORAGE_KEY } from './constants';
import { canBorrow, coverageComplete, getBook, reducer, sweepExpired } from './logic';
import { useToast } from './toast';
import type { AppState, LearningPack, LoanKind, Role } from '../types';

/**
 * Kho dữ liệu của bản DEMO: toàn bộ trạng thái nằm trong trình duyệt (localStorage).
 * Khi nối Supabase, thay phần `dispatch` bằng các lời gọi trong lib/api.ts.
 */

function load(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed.version === STATE_VERSION && Array.isArray(parsed.students) && Array.isArray(parsed.books)) {
        return sweepExpired(parsed);
      }
    }
  } catch {
    /* localStorage bị chặn hoặc dữ liệu hỏng: dùng dữ liệu mẫu */
  }
  return createInitialState();
}

export interface Actions {
  setRole(role: Role): void;
  setStudent(id: string): void;
  setClass(id: string): void;
  borrow(studentId: string, bookId: string, kind: LoanKind): boolean;
  giveBack(borrowId: string): void;
  renew(borrowId: string): void;
  setOwned(studentId: string, bookId: string, owned: boolean): void;
  addShipment(bookId: string, qty: number): void;
  receive(shipmentId: string): void;
  supplyAll(): void;
  setTemporary(on: boolean): void;
  savePack(pack: LearningPack): void;
  setPackStatus(packId: string, status: 'published' | 'draft'): void;
  resetDemo(): void;
}

interface Ctx {
  state: AppState;
  actions: Actions;
}

const AppCtx = createContext<Ctx | null>(null);

export function useApp(): Ctx {
  const v = useContext(AppCtx);
  if (!v) throw new Error('useApp phải nằm trong <AppProvider>');
  return v;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const toast = useToast();

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* bỏ qua: vẫn chạy được trong bộ nhớ */
    }
  }, [state]);

  const actions = useMemo<Actions>(
    () => ({
      setRole: (role) => dispatch({ type: 'setRole', role }),
      setStudent: (studentId) => dispatch({ type: 'setStudent', studentId }),
      setClass: (classId) => dispatch({ type: 'setClass', classId }),

      borrow(studentId, bookId, kind) {
        const check = canBorrow(state, studentId, bookId, kind);
        if (!check.ok) {
          toast(check.reason ?? 'Không thể mượn.', 'error');
          return false;
        }
        const book = getBook(state, bookId);
        dispatch({ type: 'borrow', studentId, bookId, kind });
        toast(
          kind === 'physical'
            ? `Đã đăng ký mượn bản giấy ${book?.title ?? ''}. Nhận sách tại thư viện trong 7 ngày.`
            : `Đã mượn bản điện tử ${book?.title ?? ''}. Quyền đọc có hạn 14 ngày.`,
          'ok',
        );
        return true;
      },

      giveBack(borrowId) {
        dispatch({ type: 'return', borrowId });
        toast('Đã trả sách. Suất mượn được trả lại cho bạn khác.', 'ok');
      },

      renew(borrowId) {
        const b = state.borrows.find((x) => x.id === borrowId);
        if (!b || b.kind !== 'physical' || b.renewals >= MAX_RENEWALS) {
          toast('Đã gia hạn tối đa. Hãy trả sách để bạn khác được mượn.', 'error');
          return;
        }
        dispatch({ type: 'renew', borrowId });
        toast('Đã gia hạn thêm 7 ngày.', 'ok');
      },

      setOwned(studentId, bookId, owned) {
        dispatch({ type: 'setOwned', studentId, bookId, owned });
        toast(owned ? 'Đã ghi nhận học sinh có SGK. Bản mượn tạm được thu hồi.' : 'Đã đánh dấu chưa có SGK.', 'ok');
      },

      addShipment(bookId, qty) {
        if (!Number.isFinite(qty) || qty < 1) {
          toast('Số lượng phải từ 1 trở lên.', 'error');
          return;
        }
        dispatch({ type: 'addShipment', bookId, qty });
        toast('Đã tạo lô hàng đang vận chuyển.', 'ok');
      },

      receive(shipmentId) {
        dispatch({ type: 'receive', shipmentId });
        toast('Đã nhập kho và phân bổ theo mức độ thiếu.', 'ok');
      },

      supplyAll() {
        dispatch({ type: 'supplyAll' });
        toast('Mô phỏng: SGK chính thức về đủ và đã phân bổ cho mọi học sinh.', 'ok');
      },

      setTemporary(on) {
        if (!on && !coverageComplete(state)) {
          toast('Chưa thể tắt: vẫn còn học sinh chưa có SGK.', 'error');
          return;
        }
        dispatch({ type: 'setTemporary', on });
        toast(on ? 'Đã bật lại Chế độ hỗ trợ tạm thời.' : 'Đã tắt Chế độ hỗ trợ tạm thời.', 'ok');
      },

      savePack(pack) {
        dispatch({ type: 'savePack', pack });
        toast(pack.status === 'published' ? 'Đã xuất bản Learning Pack.' : 'Đã lưu nháp.', 'ok');
      },

      setPackStatus(packId, status) {
        dispatch({ type: 'setPackStatus', packId, status });
        toast(status === 'published' ? 'Đã xuất bản.' : 'Đã gỡ về bản nháp.', 'ok');
      },

      resetDemo() {
        const fresh = createInitialState();
        dispatch({ type: 'replace', state: { ...fresh, role: state.role } });
        toast('Đã khôi phục dữ liệu demo ban đầu.', 'info');
      },
    }),
    [state, toast],
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
