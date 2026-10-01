export type Role = 'student' | 'teacher' | 'admin';
export type Group = 'A' | 'B';

export interface Subject {
  id: string;
  name: string;
}

/** Sách điện tử: chỉ nhận ba dạng hợp pháp, không có dạng "bản scan". */
export type EbookInfo =
  | { mode: 'none' }
  | { mode: 'open'; source: string }
  | { mode: 'seats'; seats: number; source: string };

export interface Book {
  id: string;
  subjectId: string;
  grade: number;
  title: string;
  publisher: string;
  /** Số cuốn sách giấy thuộc kho thư viện trường. */
  libraryTotal: number;
  ebook: EbookInfo;
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: number;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  /** Nhóm luân phiên (A/B) trong lớp. */
  group: Group;
  /** Danh sách mã sách học sinh đã sở hữu bản chính thức. */
  owned: string[];
}

export type LoanKind = 'physical' | 'ebook';

export interface Borrow {
  id: string;
  studentId: string;
  bookId: string;
  kind: LoanKind;
  borrowDate: string; // YYYY-MM-DD
  dueDate: string;
  returnDate?: string;
  status: 'active' | 'returned';
  renewals: number;
}

export interface Shipment {
  id: string;
  bookId: string;
  qty: number;
  eta: string;
  status: 'transit' | 'received';
  receivedAt?: string;
  allocated?: number;
  toStock?: number;
}

export type LicenseKind = 'self' | 'cc' | 'publisher' | 'official-link' | 'unknown' | 'scan';

export interface Resource {
  id: string;
  title: string;
  type: 'video' | 'doc' | 'link';
  license: LicenseKind;
  /** Ghi nguồn (CC) hoặc số văn bản/URL chứng minh được phép (NXB). */
  proof?: string;
  url?: string;
}

export interface CoreBlock {
  heading: string;
  points: string[];
}

export interface WorkedExample {
  problem: string;
  solution: string;
}

export interface Exercise {
  q: string;
  answer: string;
}

export interface QuizItem {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface LearningPack {
  id: string;
  subjectId: string;
  grade: number;
  title: string;
  unit: string;
  author: string;
  status: 'published' | 'draft';
  updatedAt: string;
  objectives: string[];
  core: CoreBlock[];
  examples: WorkedExample[];
  exercises: Exercise[];
  quiz: QuizItem[];
  resources: Resource[];
}

export interface LogEntry {
  id: string;
  at: string; // ISO datetime
  text: string;
}

export interface AppState {
  version: number;
  role: Role;
  studentId: string;
  classId: string;
  temporaryMode: boolean;
  classes: ClassRoom[];
  students: Student[];
  books: Book[];
  borrows: Borrow[];
  shipments: Shipment[];
  packs: LearningPack[];
  log: LogEntry[];
}

export type BookStatusKind = 'owned' | 'physical' | 'ebook' | 'missing';

export interface BookStatus {
  kind: BookStatusKind;
  borrow?: Borrow;
}
