import { EBOOK_LOAN_DAYS, MAX_PHYSICAL_LOANS, MAX_RENEWALS, PHYSICAL_LOAN_DAYS } from './constants';
import { addDays, todayISO, uid } from './format';
import type {
  AppState,
  Book,
  BookStatus,
  Borrow,
  LearningPack,
  LoanKind,
  LogEntry,
  Role,
  Shipment,
  Student,
} from '../types';

/* ------------------------------------------------------------------ */
/* Truy vấn                                                            */
/* ------------------------------------------------------------------ */

export function getBook(state: AppState, bookId: string): Book | undefined {
  return state.books.find((b) => b.id === bookId);
}

export function getStudent(state: AppState, studentId: string): Student | undefined {
  return state.students.find((s) => s.id === studentId);
}

export function bookBySubject(state: AppState, subjectId: string): Book | undefined {
  return state.books.find((b) => b.subjectId === subjectId);
}

export function activeBorrows(state: AppState): Borrow[] {
  return state.borrows.filter((b) => b.status === 'active');
}

export function loansOf(state: AppState, studentId: string): Borrow[] {
  return state.borrows.filter((b) => b.studentId === studentId && b.status === 'active');
}

/** Số bản giấy còn trong kho thư viện. */
export function availableCopies(state: AppState, book: Book): { total: number; out: number; available: number } {
  const out = state.borrows.filter((b) => b.bookId === book.id && b.kind === 'physical' && b.status === 'active').length;
  return { total: book.libraryTotal, out, available: Math.max(0, book.libraryTotal - out) };
}

/** Số suất đọc sách điện tử. Trả về null nếu sách không dùng suất. */
export function seatInfo(state: AppState, book: Book): { seats: number; used: number; left: number } | null {
  if (book.ebook.mode !== 'seats') return null;
  const used = state.borrows.filter((b) => b.bookId === book.id && b.kind === 'ebook' && b.status === 'active').length;
  return { seats: book.ebook.seats, used, left: Math.max(0, book.ebook.seats - used) };
}

export function statusOf(state: AppState, student: Student, bookId: string): BookStatus {
  if (student.owned.includes(bookId)) return { kind: 'owned' };
  const loan = state.borrows.find((b) => b.studentId === student.id && b.bookId === bookId && b.status === 'active');
  if (loan) return { kind: loan.kind === 'physical' ? 'physical' : 'ebook', borrow: loan };
  return { kind: 'missing' };
}

export interface BookStat {
  book: Book;
  students: number;
  owned: number;
  missing: number;
  physical: number;
  ebook: number;
  /** Thiếu sách và chưa có bản mượn nào: chỉ dựa vào Learning Pack. */
  uncovered: number;
}

export function bookStats(state: AppState, classId?: string): BookStat[] {
  const list = classId ? state.students.filter((s) => s.classId === classId) : state.students;
  const loanMap = new Map<string, Borrow>();
  for (const b of state.borrows) if (b.status === 'active') loanMap.set(`${b.studentId}:${b.bookId}`, b);
  return state.books.map((book) => {
    let owned = 0;
    let physical = 0;
    let ebook = 0;
    for (const s of list) {
      if (s.owned.includes(book.id)) owned++;
      else {
        const l = loanMap.get(`${s.id}:${book.id}`);
        if (l) (l.kind === 'physical' ? physical++ : ebook++);
      }
    }
    const missing = list.length - owned;
    return { book, students: list.length, owned, missing, physical, ebook, uncovered: missing - physical - ebook };
  });
}

export interface SchoolTotals {
  students: number;
  need: number;
  have: number;
  missing: number;
  studentsMissingAny: number;
  uncovered: number;
  stockTotal: number;
  stockAvailable: number;
  inTransit: number;
}

export function schoolTotals(state: AppState): SchoolTotals {
  const stats = bookStats(state);
  const need = state.students.length * state.books.length;
  const have = stats.reduce((n, s) => n + s.owned, 0);
  const studentsMissingAny = state.students.filter((s) => state.books.some((b) => !s.owned.includes(b.id))).length;
  let stockTotal = 0;
  let stockAvailable = 0;
  for (const b of state.books) {
    const a = availableCopies(state, b);
    stockTotal += a.total;
    stockAvailable += a.available;
  }
  return {
    students: state.students.length,
    need,
    have,
    missing: need - have,
    studentsMissingAny,
    uncovered: stats.reduce((n, s) => n + s.uncovered, 0),
    stockTotal,
    stockAvailable,
    inTransit: state.shipments.filter((s) => s.status === 'transit').reduce((n, s) => n + s.qty, 0),
  };
}

export function coverageComplete(state: AppState): boolean {
  return state.students.every((s) => state.books.every((b) => s.owned.includes(b.id)));
}

/* ------------------------------------------------------------------ */
/* Luật mượn sách                                                      */
/* ------------------------------------------------------------------ */

export function canBorrow(
  state: AppState,
  studentId: string,
  bookId: string,
  kind: LoanKind,
): { ok: boolean; reason?: string } {
  const student = getStudent(state, studentId);
  const book = getBook(state, bookId);
  if (!student || !book) return { ok: false, reason: 'Không tìm thấy học sinh hoặc sách.' };
  if (student.owned.includes(bookId)) return { ok: false, reason: 'Bạn đã có SGK này.' };
  if (state.borrows.some((b) => b.studentId === studentId && b.bookId === bookId && b.status === 'active')) {
    return { ok: false, reason: 'Bạn đang mượn sách này rồi.' };
  }
  if (kind === 'physical') {
    if (availableCopies(state, book).available <= 0) return { ok: false, reason: 'Thư viện đã hết bản giấy.' };
    const mine = loansOf(state, studentId).filter((b) => b.kind === 'physical').length;
    if (mine >= MAX_PHYSICAL_LOANS) return { ok: false, reason: `Mỗi học sinh mượn tối đa ${MAX_PHYSICAL_LOANS} cuốn giấy cùng lúc.` };
    return { ok: true };
  }
  if (book.ebook.mode === 'none') return { ok: false, reason: 'Sách này chưa có bản điện tử hợp pháp.' };
  if (book.ebook.mode === 'open') return { ok: false, reason: 'Bản điện tử này mở trực tiếp, không cần mượn.' };
  const seats = seatInfo(state, book);
  if (!seats || seats.left <= 0) return { ok: false, reason: 'Đã hết suất đọc bản điện tử.' };
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Phân bổ sách mới về                                                 */
/* ------------------------------------------------------------------ */

export interface AllocationPlan {
  studentIds: string[];
  byClass: Record<string, number>;
  surplus: number;
}

/**
 * Ưu tiên: lớp thiếu nhiều nhất trước; trong lớp, học sinh chưa có bản mượn nào
 * (chỉ dựa vào Learning Pack) trước, rồi tới học sinh đang mượn (để thu hồi bản mượn).
 */
export function planAllocation(state: AppState, bookId: string, qty: number): AllocationPlan {
  const candidates = state.students.filter((s) => !s.owned.includes(bookId));
  const missingByClass = new Map<string, number>();
  for (const s of candidates) missingByClass.set(s.classId, (missingByClass.get(s.classId) ?? 0) + 1);
  const loaned = new Set(
    state.borrows.filter((b) => b.bookId === bookId && b.status === 'active').map((b) => b.studentId),
  );
  const sorted = candidates.slice().sort((a, b) => {
    const dc = (missingByClass.get(b.classId) ?? 0) - (missingByClass.get(a.classId) ?? 0);
    if (dc !== 0) return dc;
    if (a.classId !== b.classId) return a.classId < b.classId ? -1 : 1;
    const la = loaned.has(a.id) ? 1 : 0;
    const lb = loaned.has(b.id) ? 1 : 0;
    if (la !== lb) return la - lb;
    return a.name.localeCompare(b.name, 'vi');
  });
  const chosen = sorted.slice(0, Math.max(0, qty));
  const byClass: Record<string, number> = {};
  for (const s of chosen) byClass[s.classId] = (byClass[s.classId] ?? 0) + 1;
  return { studentIds: chosen.map((s) => s.id), byClass, surplus: Math.max(0, qty - chosen.length) };
}

/* ------------------------------------------------------------------ */
/* Reducer                                                             */
/* ------------------------------------------------------------------ */

export type Action =
  | { type: 'setRole'; role: Role }
  | { type: 'setStudent'; studentId: string }
  | { type: 'setClass'; classId: string }
  | { type: 'borrow'; studentId: string; bookId: string; kind: LoanKind }
  | { type: 'return'; borrowId: string }
  | { type: 'renew'; borrowId: string }
  | { type: 'setOwned'; studentId: string; bookId: string; owned: boolean }
  | { type: 'addShipment'; bookId: string; qty: number }
  | { type: 'receive'; shipmentId: string }
  | { type: 'supplyAll' }
  | { type: 'setTemporary'; on: boolean }
  | { type: 'savePack'; pack: LearningPack }
  | { type: 'setPackStatus'; packId: string; status: 'published' | 'draft' }
  | { type: 'replace'; state: AppState };

function withLog(state: AppState, text: string): AppState {
  const entry: LogEntry = { id: uid('lg'), at: new Date().toISOString(), text };
  return { ...state, log: [entry, ...state.log].slice(0, 40) };
}

/** Quyền đọc bản điện tử có hạn tự hết hiệu lực. */
export function sweepExpired(state: AppState): AppState {
  const today = todayISO();
  let changed = false;
  const borrows = state.borrows.map((b) => {
    if (b.status === 'active' && b.kind === 'ebook' && b.dueDate < today) {
      changed = true;
      return { ...b, status: 'returned' as const, returnDate: b.dueDate };
    }
    return b;
  });
  return changed ? { ...state, borrows } : state;
}

function receiveShipment(state: AppState, shipmentId: string): AppState {
  const sh = state.shipments.find((s) => s.id === shipmentId);
  if (!sh || sh.status === 'received') return state;
  const book = getBook(state, sh.bookId);
  if (!book) return state;
  const plan = planAllocation(state, sh.bookId, sh.qty);
  const ids = new Set(plan.studentIds);
  const today = todayISO();
  const students = state.students.map((s) => (ids.has(s.id) ? { ...s, owned: [...s.owned, sh.bookId] } : s));
  const borrows = state.borrows.map((b) =>
    b.status === 'active' && b.bookId === sh.bookId && ids.has(b.studentId)
      ? { ...b, status: 'returned' as const, returnDate: today }
      : b,
  );
  const books = state.books.map((b) => (b.id === sh.bookId ? { ...b, libraryTotal: b.libraryTotal + plan.surplus } : b));
  const shipments: Shipment[] = state.shipments.map((s) =>
    s.id === shipmentId
      ? { ...s, status: 'received', receivedAt: today, allocated: plan.studentIds.length, toStock: plan.surplus }
      : s,
  );
  const parts = Object.entries(plan.byClass)
    .map(([c, n]) => `${c}: ${n}`)
    .join(', ');
  const tail = plan.surplus > 0 ? ` ${plan.surplus} cuốn dư được nhập vào kho thư viện.` : '';
  return withLog(
    { ...state, students, borrows, books, shipments },
    `Nhập kho ${sh.qty} cuốn ${book.title}. Phân bổ cho ${plan.studentIds.length} học sinh chưa có sách (${parts || 'không ai thiếu'}); bản mượn tương ứng được thu hồi.${tail}`,
  );
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'replace':
      return action.state;
    case 'setRole':
      return { ...state, role: action.role };
    case 'setStudent':
      return { ...state, studentId: action.studentId };
    case 'setClass':
      return { ...state, classId: action.classId };

    case 'borrow': {
      const check = canBorrow(state, action.studentId, action.bookId, action.kind);
      if (!check.ok) return state;
      const book = getBook(state, action.bookId);
      const student = getStudent(state, action.studentId);
      if (!book || !student) return state;
      const today = todayISO();
      const days = action.kind === 'physical' ? PHYSICAL_LOAN_DAYS : EBOOK_LOAN_DAYS;
      const borrow: Borrow = {
        id: uid('bw'),
        studentId: action.studentId,
        bookId: action.bookId,
        kind: action.kind,
        borrowDate: today,
        dueDate: addDays(today, days),
        status: 'active',
        renewals: 0,
      };
      return withLog(
        { ...state, borrows: [borrow, ...state.borrows] },
        `${student.name} (${student.classId}) mượn ${book.title} – ${action.kind === 'physical' ? 'bản giấy' : 'bản điện tử'}.`,
      );
    }

    case 'return': {
      const b = state.borrows.find((x) => x.id === action.borrowId);
      if (!b || b.status !== 'active') return state;
      const book = getBook(state, b.bookId);
      const student = getStudent(state, b.studentId);
      const next = state.borrows.map((x) =>
        x.id === b.id ? { ...x, status: 'returned' as const, returnDate: todayISO() } : x,
      );
      return withLog(
        { ...state, borrows: next },
        `${student?.name ?? 'Học sinh'} trả ${book?.title ?? 'sách'} – ${b.kind === 'physical' ? 'bản giấy' : 'bản điện tử'}.`,
      );
    }

    case 'renew': {
      const b = state.borrows.find((x) => x.id === action.borrowId);
      if (!b || b.status !== 'active' || b.kind !== 'physical' || b.renewals >= MAX_RENEWALS) return state;
      const next = state.borrows.map((x) =>
        x.id === b.id ? { ...x, dueDate: addDays(x.dueDate, PHYSICAL_LOAN_DAYS), renewals: x.renewals + 1 } : x,
      );
      return { ...state, borrows: next };
    }

    case 'setOwned': {
      const student = getStudent(state, action.studentId);
      const book = getBook(state, action.bookId);
      if (!student || !book) return state;
      const has = student.owned.includes(action.bookId);
      if (has === action.owned) return state;
      const students = state.students.map((s) =>
        s.id === student.id
          ? { ...s, owned: action.owned ? [...s.owned, action.bookId] : s.owned.filter((x) => x !== action.bookId) }
          : s,
      );
      // Khi học sinh đã có SGK thật, bản mượn tạm tự được thu hồi.
      const today = todayISO();
      const borrows = action.owned
        ? state.borrows.map((b) =>
            b.status === 'active' && b.studentId === student.id && b.bookId === action.bookId
              ? { ...b, status: 'returned' as const, returnDate: today }
              : b,
          )
        : state.borrows;
      return withLog(
        { ...state, students, borrows },
        action.owned
          ? `${student.name} (${student.classId}) đã nhận SGK ${book.title}.`
          : `${student.name} (${student.classId}) được đánh dấu chưa có SGK ${book.title}.`,
      );
    }

    case 'addShipment': {
      const book = getBook(state, action.bookId);
      if (!book || action.qty < 1) return state;
      const sh: Shipment = {
        id: uid('sh'),
        bookId: action.bookId,
        qty: Math.floor(action.qty),
        eta: addDays(todayISO(), 3),
        status: 'transit',
      };
      return withLog({ ...state, shipments: [sh, ...state.shipments] }, `Tạo lô hàng ${sh.qty} cuốn ${book.title} đang vận chuyển.`);
    }

    case 'receive':
      return receiveShipment(state, action.shipmentId);

    case 'supplyAll': {
      let s = state;
      for (const book of state.books) {
        const missing = s.students.filter((st) => !st.owned.includes(book.id)).length;
        if (missing === 0) continue;
        const sh: Shipment = { id: uid('sh'), bookId: book.id, qty: missing, eta: todayISO(), status: 'transit' };
        s = receiveShipment({ ...s, shipments: [sh, ...s.shipments] }, sh.id);
      }
      return s;
    }

    case 'setTemporary': {
      if (!action.on && !coverageComplete(state)) return state;
      if (state.temporaryMode === action.on) return state;
      return withLog(
        { ...state, temporaryMode: action.on },
        action.on
          ? 'Bật lại Chế độ hỗ trợ tạm thời.'
          : '100% học sinh đã có SGK. Tắt Chế độ hỗ trợ tạm thời, hệ thống trở thành thư viện và kho học liệu.',
      );
    }

    case 'savePack': {
      const exists = state.packs.some((p) => p.id === action.pack.id);
      const packs = exists
        ? state.packs.map((p) => (p.id === action.pack.id ? action.pack : p))
        : [action.pack, ...state.packs];
      return withLog(
        { ...state, packs },
        `${action.pack.status === 'published' ? 'Xuất bản' : 'Lưu nháp'} Learning Pack "${action.pack.title}".`,
      );
    }

    case 'setPackStatus': {
      const packs = state.packs.map((p) => (p.id === action.packId ? { ...p, status: action.status } : p));
      return { ...state, packs };
    }
  }
}
