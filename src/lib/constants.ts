import type { LicenseKind, Subject } from '../types';

export const SUBJECTS: Subject[] = [
  { id: 'toan', name: 'Toán' },
  { id: 'van', name: 'Ngữ văn' },
  { id: 'anh', name: 'Tiếng Anh' },
  { id: 'ly', name: 'Vật lí' },
  { id: 'hoa', name: 'Hóa học' },
];

export const MAX_PHYSICAL_LOANS = 3;
export const PHYSICAL_LOAN_DAYS = 7;
export const EBOOK_LOAN_DAYS = 14;
export const MAX_RENEWALS = 2;

export const STATE_VERSION = 1;
export const STORAGE_KEY = 'bookbridge:v1';

export interface LicenseInfo {
  label: string;
  allowed: boolean;
  /** Cần ghi nguồn / văn bản chứng minh. */
  needsProof: boolean;
  proofLabel?: string;
  hint: string;
}

/** "Cổng bản quyền": mọi học liệu phải khai một loại giấy phép hợp lệ trước khi xuất bản. */
export const LICENSES: Record<LicenseKind, LicenseInfo> = {
  self: {
    label: 'Giáo viên tự biên soạn',
    allowed: true,
    needsProof: false,
    hint: 'Nội dung do chính giáo viên/tổ chuyên môn viết, quay, thiết kế.',
  },
  cc: {
    label: 'Giấy phép mở (Creative Commons)',
    allowed: true,
    needsProof: true,
    proofLabel: 'Tác giả, nguồn, loại giấy phép (ví dụ CC BY 4.0)',
    hint: 'Được dùng lại theo điều kiện của giấy phép, phải ghi nguồn.',
  },
  publisher: {
    label: 'Nhà xuất bản cho phép',
    allowed: true,
    needsProof: true,
    proofLabel: 'Số văn bản hoặc đường dẫn chứng minh NXB đồng ý',
    hint: 'Có văn bản/thỏa thuận của nhà xuất bản cho phép sử dụng.',
  },
  'official-link': {
    label: 'Liên kết nguồn chính thức',
    allowed: true,
    needsProof: false,
    hint: 'Chỉ dẫn link tới trang chính thức, hệ thống không lưu nội dung.',
  },
  unknown: {
    label: 'Chưa rõ giấy phép',
    allowed: false,
    needsProof: false,
    hint: 'Chưa xác minh được quyền sử dụng. Không được xuất bản.',
  },
  scan: {
    label: 'Bản scan/chụp SGK không có phép',
    allowed: false,
    needsProof: false,
    hint: 'Sao chép SGK khi chưa được phép. Hệ thống từ chối.',
  },
};
