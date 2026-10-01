import { useCallback } from 'react';
import { useToast } from './toast';
import type { Book, Student } from '../types';

/**
 * Mở bản điện tử. Bản demo chỉ báo kết quả; khi triển khai thật:
 *  - mode "open": mở liên kết chính thức của NXB do nhà trường cấu hình;
 *  - mode "seats": mở trình đọc trong trình duyệt, không cho tải về, hiện mã học sinh trên trang.
 */
export function useReader() {
  const toast = useToast();
  return useCallback(
    (book: Book, student: Student) => {
      if (book.ebook.mode === 'open') {
        toast(`Demo: mở liên kết chính thức của nhà xuất bản cho ${book.title}. Không lưu nội dung trên hệ thống.`, 'info');
      } else if (book.ebook.mode === 'seats') {
        toast(`Demo: mở trình đọc ${book.title} trong trình duyệt (không tải về), gắn mã ${student.id}.`, 'info');
      } else {
        toast('Sách này chưa có bản điện tử hợp pháp.', 'error');
      }
    },
    [toast],
  );
}
