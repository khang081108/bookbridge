-- =====================================================================
-- BookBridge – dữ liệu mẫu (chạy sau schema.sql)
-- Học sinh trong seed là dữ liệu giả, chưa gắn với tài khoản đăng nhập nào.
-- Để đăng nhập thật: tạo người dùng trong Supabase Auth, rồi thêm một dòng vào profiles
-- (id = id của người dùng, role = 'student' | 'teacher' | 'admin') và gắn students.profile_id.
-- =====================================================================

insert into subjects (id, name) values
  ('toan', 'Toán'), ('van', 'Ngữ văn'), ('anh', 'Tiếng Anh'), ('ly', 'Vật lí'), ('hoa', 'Hóa học');

insert into classes (id, name, grade) values
  ('10A1', 'Lớp 10A1', 10), ('10A2', 'Lớp 10A2', 10), ('10A3', 'Lớp 10A3', 10);

insert into books (id, subject_id, grade, title, publisher, ebook_mode, ebook_seats, ebook_source) values
  ('toan10', 'toan', 10, 'Toán 10',       'Kết nối tri thức với cuộc sống', 'open',  0,  'Trang học liệu chính thức của NXB (nhà trường cấu hình liên kết)'),
  ('van10',  'van',  10, 'Ngữ văn 10',    'Kết nối tri thức với cuộc sống', 'seats', 18, 'Suất đọc trường mua theo thỏa thuận với NXB'),
  ('anh10',  'anh',  10, 'Tiếng Anh 10',  'Kết nối tri thức với cuộc sống', 'none',  0,  null),
  ('ly10',   'ly',   10, 'Vật lí 10',     'Kết nối tri thức với cuộc sống', 'seats', 12, 'Suất đọc trường mua theo thỏa thuận với NXB'),
  ('hoa10',  'hoa',  10, 'Hóa học 10',    'Kết nối tri thức với cuộc sống', 'seats', 8,  'Suất đọc trường mua theo thỏa thuận với NXB');

insert into book_inventory (book_id, total) values
  ('toan10', 22), ('van10', 14), ('anh10', 16), ('ly10', 18), ('hoa10', 20);

-- 114 học sinh giả: 40 + 38 + 36
insert into students (name, class_id, grp)
select format('Học sinh %s-%s', c.id, lpad(n::text, 2, '0')),
       c.id,
       case when n % 2 = 1 then 'A' else 'B' end
from (values ('10A1', 40), ('10A2', 38), ('10A3', 36)) as c(id, size)
cross join lateral generate_series(1, c.size) as n;

-- Khoảng 70–85% học sinh đã có SGK chính thức, tùy môn.
-- (b là truy vấn "lateral" phụ thuộc s để random() được tính riêng cho từng cặp học sinh – sách.)
insert into student_books (student_id, book_id)
select s.id, b.id
from students s
cross join lateral (
  select v.id, v.rate, random() as r, s.id as owner_id
  from (values ('toan10', 0.74), ('van10', 0.70), ('anh10', 0.85), ('ly10', 0.68), ('hoa10', 0.74)) as v(id, rate)
) b
where b.r < b.rate;

insert into shipments (book_id, qty, eta) values
  ('van10', 30, current_date + 2),
  ('ly10',  40, current_date + 4),
  ('toan10', 25, current_date + 6);

insert into settings (key, value) values ('temporary_mode', 'true'::jsonb);

-- Một Learning Pack mẫu (nội dung do người soạn tự viết)
with p as (
  insert into learning_packs (subject_id, grade, title, unit, status, content)
  values (
    'toan', 10, 'Hàm số và đồ thị', 'Chủ đề: Hàm số', 'published',
    jsonb_build_object(
      'objectives', jsonb_build_array(
        'Nhận biết một quy tắc có phải là hàm số hay không.',
        'Tìm tập xác định của hàm số cho bởi công thức đơn giản.',
        'Tính giá trị của hàm số tại một điểm.'
      ),
      'core', jsonb_build_array(
        jsonb_build_object('heading', 'Tìm tập xác định', 'points', jsonb_build_array(
          'Với f(x) = 1 / g(x): cần g(x) ≠ 0.',
          'Với f(x) = √g(x): cần g(x) ≥ 0.'
        ))
      ),
      'examples', jsonb_build_array(
        jsonb_build_object('problem', 'Cho f(x) = 2x² − 3x + 1. Tính f(2).', 'solution', 'f(2) = 2·4 − 6 + 1 = 3.')
      ),
      'exercises', jsonb_build_array(
        jsonb_build_object('q', 'Tìm tập xác định của y = 3 / (x + 4).', 'answer', 'D = ℝ \ {−4}.')
      ),
      'quiz', jsonb_build_array()
    )
  ) returning id
)
insert into resources (pack_id, title, type, license, proof)
select id, 'Video bài giảng: Cách tìm tập xác định (8 phút)', 'video', 'self'::license_kind, null from p
union all
select id, 'Mục lục chương Hàm số trên trang chính thức của NXB', 'link', 'official-link'::license_kind, null from p;
