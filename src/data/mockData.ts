import { MAX_PHYSICAL_LOANS, EBOOK_LOAN_DAYS, PHYSICAL_LOAN_DAYS, STATE_VERSION } from '../lib/constants';
import { addDays, todayISO } from '../lib/format';
import type { AppState, Book, Borrow, ClassRoom, EbookInfo, Group, Shipment, Student } from '../types';
import { samplePacks } from './packs';

/** Mã học sinh dùng cho phần demo ("Xin chào, Khang"). */
export const DEMO_STUDENT_ID = 'hs-khang';

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SURNAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Ngô', 'Dương', 'Lý', 'Phan', 'Võ'];
const MALE_MID = ['Văn', 'Minh', 'Quang', 'Hữu', 'Gia', 'Đức', 'Anh', 'Tuấn'];
const FEMALE_MID = ['Thị', 'Ngọc', 'Thanh', 'Phương', 'Hồng', 'Bảo', 'Khánh', 'Diệu'];
const MALE_GIVEN = ['An', 'Bình', 'Dũng', 'Hiếu', 'Huy', 'Long', 'Nam', 'Phong', 'Phúc', 'Quân', 'Sơn', 'Khoa', 'Trí', 'Đạt', 'Hưng', 'Kiên', 'Thịnh', 'Vinh'];
const FEMALE_GIVEN = ['Châu', 'Hà', 'Lan', 'Linh', 'Mai', 'Nhi', 'Thảo', 'Trang', 'Vy', 'Yến', 'Hạnh', 'My', 'Ngân', 'Uyên', 'Quỳnh', 'Chi', 'Giang', 'Trâm'];

interface BookDef {
  id: string;
  subjectId: string;
  title: string;
  total: number;
  ownRate: number;
  spare: number;
  ebook: EbookInfo;
  seatSpare: number;
}

const BOOK_DEFS: BookDef[] = [
  {
    id: 'toan10',
    subjectId: 'toan',
    title: 'Toán 10',
    total: 22,
    ownRate: 0.74,
    spare: 6,
    ebook: { mode: 'open', source: 'Trang học liệu chính thức của NXB (nhà trường cấu hình liên kết)' },
    seatSpare: 0,
  },
  {
    id: 'van10',
    subjectId: 'van',
    title: 'Ngữ văn 10',
    total: 14,
    ownRate: 0.7,
    spare: 0,
    ebook: { mode: 'seats', seats: 18, source: 'Suất đọc trường mua theo thỏa thuận với NXB' },
    seatSpare: 2,
  },
  {
    id: 'anh10',
    subjectId: 'anh',
    title: 'Tiếng Anh 10',
    total: 16,
    ownRate: 0.85,
    spare: 5,
    ebook: { mode: 'none' },
    seatSpare: 0,
  },
  {
    id: 'ly10',
    subjectId: 'ly',
    title: 'Vật lí 10',
    total: 18,
    ownRate: 0.68,
    spare: 3,
    ebook: { mode: 'seats', seats: 12, source: 'Suất đọc trường mua theo thỏa thuận với NXB' },
    seatSpare: 3,
  },
  {
    id: 'hoa10',
    subjectId: 'hoa',
    title: 'Hóa học 10',
    total: 20,
    ownRate: 0.74,
    spare: 7,
    ebook: { mode: 'seats', seats: 8, source: 'Suất đọc trường mua theo thỏa thuận với NXB' },
    seatSpare: 0,
  },
];

const CLASS_SIZES: [string, number][] = [
  ['10A1', 40],
  ['10A2', 38],
  ['10A3', 36],
];

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createInitialState(): AppState {
  const rnd = mulberry32(2026);
  const today = todayISO();

  const classes: ClassRoom[] = CLASS_SIZES.map(([name]) => ({ id: name, name: `Lớp ${name}`, grade: 10 }));

  const books: Book[] = BOOK_DEFS.map((d) => ({
    id: d.id,
    subjectId: d.subjectId,
    grade: 10,
    title: d.title,
    publisher: 'Kết nối tri thức với cuộc sống',
    libraryTotal: d.total,
    ebook: d.ebook,
  }));

  const usedNames = new Set<string>(['Trần Minh Khang']);
  const students: Student[] = [];
  for (const [classId, size] of CLASS_SIZES) {
    for (let i = 0; i < size; i++) {
      const id = classId === '10A1' && i === 0 ? DEMO_STUDENT_ID : `s-${classId}-${String(i + 1).padStart(2, '0')}`;
      const group: Group = i % 2 === 0 ? 'A' : 'B';
      if (id === DEMO_STUDENT_ID) {
        students.push({
          id,
          name: 'Trần Minh Khang',
          classId,
          group,
          owned: ['toan10', 'anh10', 'hoa10'],
        });
        continue;
      }
      const male = rnd() < 0.5;
      let name = '';
      for (let tries = 0; tries < 50; tries++) {
        const s = SURNAMES[Math.floor(rnd() * SURNAMES.length)];
        const mid = (male ? MALE_MID : FEMALE_MID)[Math.floor(rnd() * 8)];
        const giv = (male ? MALE_GIVEN : FEMALE_GIVEN)[Math.floor(rnd() * 18)];
        name = `${s} ${mid} ${giv}`;
        if (!usedNames.has(name)) break;
      }
      usedNames.add(name);
      const owned = BOOK_DEFS.filter((d) => rnd() < d.ownRate).map((d) => d.id);
      students.push({ id, name, classId, group, owned });
    }
  }

  // ---- Phiếu mượn khởi tạo ----
  const borrows: Borrow[] = [];
  let seq = 1;
  const newBorrow = (studentId: string, bookId: string, kind: 'physical' | 'ebook', ago: number): Borrow => {
    const borrowDate = addDays(today, -ago);
    return {
      id: `bw-${String(seq++).padStart(3, '0')}`,
      studentId,
      bookId,
      kind,
      borrowDate,
      dueDate: addDays(borrowDate, kind === 'physical' ? PHYSICAL_LOAN_DAYS : EBOOK_LOAN_DAYS),
      status: 'active',
      renewals: 0,
    };
  };
  const physicalCount = (studentId: string) =>
    borrows.filter((b) => b.studentId === studentId && b.kind === 'physical' && b.status === 'active').length;

  // Khang đang mượn Ngữ văn 10 (bản giấy), còn thiếu Vật lí 10.
  borrows.push(newBorrow(DEMO_STUDENT_ID, 'van10', 'physical', 3));

  for (const d of BOOK_DEFS) {
    const missing = shuffle(
      students.filter((s) => s.id !== DEMO_STUDENT_ID && !s.owned.includes(d.id)),
      rnd,
    );
    const existing = borrows.filter((b) => b.bookId === d.id && b.kind === 'physical').length;
    const physTarget = d.total - d.spare - existing;
    let made = 0;
    const withPhysical = new Set<string>();
    for (const s of missing) {
      if (made >= physTarget) break;
      if (physicalCount(s.id) >= MAX_PHYSICAL_LOANS) continue;
      borrows.push(newBorrow(s.id, d.id, 'physical', Math.floor(rnd() * 6)));
      withPhysical.add(s.id);
      made++;
    }
    if (d.ebook.mode === 'seats') {
      const seatTarget = d.ebook.seats - d.seatSpare;
      let seats = 0;
      for (const s of missing) {
        if (seats >= seatTarget) break;
        if (withPhysical.has(s.id)) continue;
        borrows.push(newBorrow(s.id, d.id, 'ebook', Math.floor(rnd() * 8)));
        seats++;
      }
    }
  }

  const shipments: Shipment[] = [
    { id: 'sh-1', bookId: 'van10', qty: 30, eta: addDays(today, 2), status: 'transit' },
    { id: 'sh-2', bookId: 'ly10', qty: 40, eta: addDays(today, 4), status: 'transit' },
    { id: 'sh-3', bookId: 'toan10', qty: 25, eta: addDays(today, 6), status: 'transit' },
  ];

  const now = Date.now();
  return {
    version: STATE_VERSION,
    role: 'student',
    studentId: DEMO_STUDENT_ID,
    classId: '10A1',
    temporaryMode: true,
    classes,
    students,
    books,
    borrows,
    shipments,
    packs: samplePacks(today),
    log: [
      { id: 'lg-3', at: new Date(now - 3 * 3600_000).toISOString(), text: 'Nhà trường bật Chế độ hỗ trợ tạm thời cho khối 10.' },
      { id: 'lg-2', at: new Date(now - 2 * 3600_000).toISOString(), text: 'Tổ chuyên môn xuất bản 5 Learning Pack mẫu.' },
      { id: 'lg-1', at: new Date(now - 3600_000).toISOString(), text: 'Kho thư viện nhập danh mục SGK khối 10 để cho mượn luân phiên.' },
    ],
  };
}
