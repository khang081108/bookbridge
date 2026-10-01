# BookBridge – Cầu nối tri thức

> **Thiếu sách không có nghĩa là thiếu cơ hội học tập.**

BookBridge là bản MVP của một hệ thống **hỗ trợ học tập tạm thời** cho giai đoạn học sinh chưa có sách giáo khoa (SGK) chính thức. Hệ thống **không scan hay phân phối SGK có bản quyền**. Thay vào đó, nó kết hợp:

| Tầng | Nội dung | Có trong MVP |
|---|---|---|
| 1 | **Learning Pack**: học liệu do giáo viên tự biên soạn (mục tiêu, kiến thức cốt lõi, ví dụ, bài tập, quiz) | Có, 5 gói mẫu + trình soạn |
| 2 | **Thư viện SGK luân phiên**: mượn, gia hạn, trả, lịch đổi sách theo nhóm A/B; khi hết bản giấy thì mượn **bản điện tử** có suất đọc | Có |
| 3 | **Kho tài nguyên hợp pháp**: cổng bản quyền chặn học liệu không rõ phép | Có |
| 4 | **"Ai đang có sách?"**: dashboard cho nhà trường, nhập kho và phân bổ SGK mới theo mức thiếu | Có |
| ∞ | **Temporary Mode**: khi 100% học sinh có SGK thì tắt, hệ thống thành thư viện và kho học liệu | Có |

## Màn hình (8)

| Đường dẫn | Màn hình |
|---|---|
| `#/` | Landing page |
| `#/about` | Mô hình và bản quyền (cổng bản quyền, sách điện tử, giới hạn MVP) |
| `#/student` | Student Dashboard |
| `#/student/learn` và `#/student/learn/<id>` | Learning Hub và từng Learning Pack |
| `#/student/books` | Book Hub: mượn, gia hạn, trả, lịch luân phiên |
| `#/teacher` | Teacher Dashboard: học sinh thiếu sách theo lớp và môn |
| `#/teacher/packs` | Learning Pack Studio và cổng bản quyền |
| `#/admin` | School Admin Dashboard: kho, lô hàng, phân bổ, Temporary Mode |

Vai trò được đổi bằng nút **Học sinh / Giáo viên / Nhà trường** ở đầu trang (bản demo chưa có đăng nhập).

## Chạy thử

Cần Node.js 20.19 trở lên.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit và vite build → thư mục dist/
npm run preview
```

Bản demo **không cần Supabase**: dữ liệu mẫu nằm trong `src/data/` (114 học sinh, 5 đầu sách, phiếu mượn, 3 lô hàng đang vận chuyển) và trạng thái được lưu trong `localStorage`. Nút **"Khôi phục dữ liệu demo"** ở chân trang đưa mọi thứ về ban đầu.

## Kịch bản demo 5 phút

1. **Học sinh** (Khang, lớp 10A1): thấy cảnh báo "Chưa có SGK Vật lí".
2. Mở **Learning Pack** "Chuyển động thẳng đều", đọc, làm bài tập, làm quiz.
3. Vào **Thư viện sách**: mượn bản giấy Vật lí. Thử mượn thêm để thấy luật (tối đa 3 cuốn giấy, không mượn trùng). Ngữ văn đã hết bản giấy nên chuyển sang **bản điện tử**.
4. **Giáo viên**: xem lớp 10A1 thiếu môn nào, bấm "Đã nhận SGK" cho một học sinh. Vào **Learning Pack**, bấm "Điền bài mẫu", tick cam kết rồi xuất bản. Thêm một học liệu và chọn "Bản scan/chụp SGK không có phép" để thấy **cổng bản quyền khóa nút xuất bản**.
5. **Nhà trường**: xem môn thiếu nhiều nhất, bấm **"Nhập kho và phân bổ"** cho một lô SGK (xem kế hoạch phân bổ theo lớp trước khi bấm).
6. Bấm **"Mô phỏng: nhập đủ SGK"** rồi **"Tắt Temporary Mode"**. Banner đổi sang "100% học sinh đã có SGK".

## Cấu trúc

```
bookbridge/
├── index.html
├── src/
│   ├── main.tsx, App.tsx, index.css
│   ├── components/    Layout, ui (nút, thẻ, icon…), shared (lịch luân phiên…)
│   ├── pages/         8 màn hình
│   ├── data/          mockData.ts (học sinh, sách, phiếu mượn), packs.ts (Learning Pack mẫu)
│   ├── lib/
│   │   ├── logic.ts       luật mượn sách, thống kê, phân bổ SGK mới, reducer
│   │   ├── store.tsx      kho dữ liệu demo (localStorage) + hành động
│   │   ├── packForm.ts    phân tích biểu mẫu Learning Pack và cổng bản quyền
│   │   ├── router.tsx     bộ định tuyến băm (#/…) không phụ thuộc thư viện
│   │   ├── supabase.ts    Supabase client (chỉ tạo khi có .env.local)
│   │   └── constants.ts, format.ts, toast.tsx, useReader.ts
│   └── types/index.ts
├── supabase/
│   ├── schema.sql     bảng, ràng buộc cổng bản quyền, hàm mượn/trả/nhập kho, RLS
│   └── seed.sql       dữ liệu mẫu
├── .env.example
└── package.json
```

## Luật nghiệp vụ đã cài

- **Mượn bản giấy:** 7 ngày, gia hạn tối đa 2 lần (mỗi lần 7 ngày), tối đa 3 cuốn giấy cùng lúc, không mượn trùng, không mượn khi đã có SGK, không mượn khi kho hết.
- **Bản điện tử:** ba dạng: không có / mở trực tiếp qua liên kết chính thức của NXB / **suất đọc** (14 ngày, tự hết hạn và trả suất). Không có chức năng tải về.
- **Phân bổ SGK mới:** ưu tiên lớp thiếu nhiều nhất; trong lớp, ưu tiên học sinh **chưa có bản mượn nào**; bản mượn tạm của học sinh được cấp sách tự thu hồi về kho; phần dư nhập vào kho thư viện.
- **Cổng bản quyền:** học liệu phải khai giấy phép. "Chưa rõ" và "bản scan SGK không có phép" bị chặn. Giấy phép mở và "NXB cho phép" bắt buộc ghi nguồn/văn bản. Giáo viên phải cam kết không sao chép nguyên văn SGK. Cùng các ràng buộc này có ở tầng cơ sở dữ liệu (`resources` trong `schema.sql`).
- **Temporary Mode:** chỉ tắt được khi mọi học sinh có đủ SGK.

## Nối Supabase (khi muốn dùng dữ liệu thật)

1. Tạo dự án tại supabase.com, mở **SQL Editor**, chạy `supabase/schema.sql` rồi `supabase/seed.sql`.
2. Sao chép `.env.example` thành `.env.local`, điền `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.
3. Tạo người dùng trong **Authentication**, thêm dòng tương ứng vào bảng `profiles` (`role` là `student`, `teacher` hoặc `admin`) và gắn `students.profile_id`.
4. Thay các hành động trong `src/lib/store.tsx` bằng lời gọi Supabase. Các hàm phía máy chủ đã sẵn: `borrow_book`, `return_book`, `renew_borrow`, `receive_shipment`, `set_temporary_mode`, `publish_pack`, ví dụ `supabase.rpc('borrow_book', { p_student, p_book, p_kind: 'physical' })`.

Lược đồ SQL đã được chạy thử trên PostgreSQL 16 (nạp schema và seed, thử mượn/trả/gia hạn, nhập kho phân bổ, ràng buộc cổng bản quyền, RLS cơ bản) với phần Supabase Auth được giả lập. Chưa thử trên một dự án Supabase thật.

## Giới hạn hiện tại

- Dữ liệu học sinh, sách, phiếu mượn là **giả lập**; chưa có đăng nhập thật (đang đổi vai trò bằng nút).
- Video, liên kết học liệu và nguồn sách điện tử là chỗ giữ chỗ; nhà trường gắn đường dẫn thật khi triển khai.
- Chưa làm: QR cho sách, trình đọc bản điện tử thật, cho mượn bản số từ sách giấy (controlled digital lending) vì còn tranh cãi pháp lý.
- Các quy định pháp lý về sách điện tử và cho mượn cần xác nhận với nhà xuất bản và cơ quan quản lý.

## Lộ trình gợi ý

1. Đăng nhập 3 vai trò bằng Supabase Auth, thay `localStorage` bằng cơ sở dữ liệu thật.
2. Mã QR cho từng đầu sách (quét để mượn/trả nhanh).
3. Trình đọc bản điện tử có hạn, gắn mã học sinh.
4. Triển khai lên Vercel hoặc GitHub Pages (bộ định tuyến băm nên không cần cấu hình thêm).
5. Slide thuyết trình và video demo.
