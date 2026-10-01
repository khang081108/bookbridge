-- =====================================================================
-- BookBridge – lược đồ PostgreSQL cho Supabase
-- Chạy toàn bộ tệp này trong Supabase → SQL Editor, sau đó chạy seed.sql.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Kiểu liệt kê ----------
create type user_role       as enum ('student', 'teacher', 'admin');
create type loan_kind       as enum ('physical', 'ebook');
create type loan_status     as enum ('active', 'returned');
create type license_kind    as enum ('self', 'cc', 'publisher', 'official-link', 'unknown', 'scan');
create type pack_status     as enum ('published', 'draft');
create type shipment_status as enum ('transit', 'received');
create type ebook_mode      as enum ('none', 'open', 'seats');

-- ---------- Bảng ----------
-- users (Supabase Auth) + hồ sơ vai trò
create table profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       user_role not null default 'student',
  full_name  text not null,
  created_at timestamptz not null default now()
);

create table classes (
  id    text primary key,              -- ví dụ '10A1'
  name  text not null,
  grade int  not null
);

create table students (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid unique references profiles (id) on delete set null,
  name       text not null,
  class_id   text not null references classes (id),
  grp        char(1) not null default 'A' check (grp in ('A', 'B'))   -- nhóm luân phiên
);

create table subjects (
  id   text primary key,               -- 'toan', 'van', ...
  name text not null
);

create table books (
  id           text primary key,       -- 'toan10', ...
  subject_id   text not null references subjects (id),
  grade        int  not null,
  title        text not null,
  publisher    text not null,
  ebook_mode   ebook_mode not null default 'none',
  ebook_seats  int  not null default 0 check (ebook_seats >= 0),
  ebook_source text,
  -- sách điện tử chỉ có ba dạng hợp pháp: không có, mở trực tiếp (liên kết chính thức), hoặc suất đọc có hạn
  check (ebook_mode = 'seats' or ebook_seats = 0)
);

-- Số bản giấy của thư viện trường
create table book_inventory (
  book_id text primary key references books (id) on delete cascade,
  total   int not null default 0 check (total >= 0)
);

-- Học sinh đã sở hữu SGK chính thức
create table student_books (
  student_id  uuid not null references students (id) on delete cascade,
  book_id     text not null references books (id) on delete cascade,
  acquired_at timestamptz not null default now(),
  primary key (student_id, book_id)
);

create table borrows (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students (id) on delete cascade,
  book_id     text not null references books (id) on delete cascade,
  kind        loan_kind not null,
  borrow_date date not null default current_date,
  due_date    date not null,
  return_date date,
  status      loan_status not null default 'active',
  renewals    int not null default 0 check (renewals between 0 and 2)
);
-- Một học sinh chỉ có một lượt mượn đang hoạt động cho mỗi cuốn
create unique index borrows_one_active on borrows (student_id, book_id) where status = 'active';
create index borrows_book_active on borrows (book_id, kind) where status = 'active';

create table learning_packs (
  id         uuid primary key default gen_random_uuid(),
  subject_id text not null references subjects (id),
  grade      int  not null,
  title      text not null,
  unit       text not null default '',
  author_id  uuid references profiles (id) on delete set null,
  status     pack_status not null default 'draft',
  -- objectives, core, examples, exercises, quiz: cùng cấu trúc với kiểu LearningPack trong src/types
  content    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Cổng bản quyền (License / Rights Gate) ở tầng cơ sở dữ liệu:
--  1) không nhận giấy phép "unknown" hoặc "scan";
--  2) giấy phép mở (cc) hoặc NXB cho phép (publisher) bắt buộc có ghi nguồn/văn bản.
create table resources (
  id      uuid primary key default gen_random_uuid(),
  pack_id uuid not null references learning_packs (id) on delete cascade,
  title   text not null,
  type    text not null check (type in ('video', 'doc', 'link')),
  license license_kind not null,
  proof   text,
  url     text,
  constraint rights_gate_allowed check (license not in ('unknown', 'scan')),
  constraint rights_gate_proof check (
    license not in ('cc', 'publisher') or length(btrim(coalesce(proof, ''))) > 0
  )
);

create table shipments (
  id          uuid primary key default gen_random_uuid(),
  book_id     text not null references books (id),
  qty         int  not null check (qty > 0),
  eta         date,
  status      shipment_status not null default 'transit',
  received_at timestamptz,
  allocated   int,
  to_stock    int
);

create table settings (
  key   text primary key,
  value jsonb not null
);

create table activity_log (
  id   bigint generated always as identity primary key,
  at   timestamptz not null default now(),
  text text not null
);

-- ---------- Khung nhìn ----------
create view book_availability with (security_invoker = true) as
select
  b.id as book_id,
  coalesce(i.total, 0) as total,
  (select count(*) from borrows w where w.book_id = b.id and w.kind = 'physical' and w.status = 'active')::int as out_count,
  greatest(coalesce(i.total, 0)
    - (select count(*) from borrows w where w.book_id = b.id and w.kind = 'physical' and w.status = 'active'), 0)::int as available,
  b.ebook_mode,
  b.ebook_seats,
  greatest(b.ebook_seats
    - (select count(*) from borrows w where w.book_id = b.id and w.kind = 'ebook' and w.status = 'active'), 0)::int as seats_left
from books b
left join book_inventory i on i.book_id = b.id;

-- Số liệu cho dashboard nhà trường: học sinh thiếu sách theo lớp và môn
create view missing_by_class with (security_invoker = true) as
select s.class_id, b.id as book_id, count(*)::int as missing
from students s
cross join books b
where not exists (select 1 from student_books sb where sb.student_id = s.id and sb.book_id = b.id)
group by s.class_id, b.id;

-- ---------- Hàm hỗ trợ ----------
create or replace function app_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

-- ---------- Mượn sách (kiểm tra luật và khóa dòng để tránh mượn trùng) ----------
create or replace function borrow_book(p_student uuid, p_book text, p_kind loan_kind)
returns borrows
language plpgsql security definer set search_path = public as $$
declare
  v_book  books%rowtype;
  v_total int;
  v_out   int;
  v_mine  int;
  v_used  int;
  v_row   borrows%rowtype;
begin
  if app_role() = 'student'
     and not exists (select 1 from students where id = p_student and profile_id = auth.uid()) then
    raise exception 'Học sinh chỉ được mượn sách cho chính mình';
  end if;

  select * into v_book from books where id = p_book;
  if not found then raise exception 'Không tìm thấy sách'; end if;

  perform 1 from book_inventory where book_id = p_book for update;   -- khóa để các lượt mượn đồng thời xếp hàng

  if exists (select 1 from student_books where student_id = p_student and book_id = p_book) then
    raise exception 'Học sinh đã có SGK này';
  end if;
  if exists (select 1 from borrows where student_id = p_student and book_id = p_book and status = 'active') then
    raise exception 'Học sinh đang mượn sách này';
  end if;

  if p_kind = 'physical' then
    select total into v_total from book_inventory where book_id = p_book;
    select count(*) into v_out from borrows where book_id = p_book and kind = 'physical' and status = 'active';
    if coalesce(v_total, 0) - v_out <= 0 then raise exception 'Thư viện đã hết bản giấy'; end if;

    select count(*) into v_mine from borrows
      where student_id = p_student and kind = 'physical' and status = 'active';
    if v_mine >= 3 then raise exception 'Mỗi học sinh mượn tối đa 3 cuốn giấy cùng lúc'; end if;

    insert into borrows (student_id, book_id, kind, due_date)
    values (p_student, p_book, 'physical', current_date + 7)
    returning * into v_row;
  else
    if v_book.ebook_mode <> 'seats' then
      raise exception 'Sách này không dùng suất đọc điện tử';
    end if;
    select count(*) into v_used from borrows where book_id = p_book and kind = 'ebook' and status = 'active';
    if v_used >= v_book.ebook_seats then raise exception 'Đã hết suất đọc bản điện tử'; end if;

    insert into borrows (student_id, book_id, kind, due_date)
    values (p_student, p_book, 'ebook', current_date + 14)
    returning * into v_row;
  end if;

  return v_row;
end $$;

create or replace function return_book(p_borrow uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if app_role() = 'student' and not exists (
       select 1 from borrows w join students s on s.id = w.student_id
       where w.id = p_borrow and s.profile_id = auth.uid()) then
    raise exception 'Không có quyền trả lượt mượn này';
  end if;
  update borrows set status = 'returned', return_date = current_date
   where id = p_borrow and status = 'active';
end $$;

create or replace function renew_borrow(p_borrow uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if app_role() = 'student' and not exists (
       select 1 from borrows w join students s on s.id = w.student_id
       where w.id = p_borrow and s.profile_id = auth.uid()) then
    raise exception 'Không có quyền gia hạn lượt mượn này';
  end if;
  update borrows set due_date = due_date + 7, renewals = renewals + 1
   where id = p_borrow and status = 'active' and kind = 'physical' and renewals < 2;
  if not found then raise exception 'Không thể gia hạn (đã đủ 2 lần hoặc không phải bản giấy)'; end if;
end $$;

-- ---------- Nhập kho và phân bổ ----------
-- Ưu tiên lớp thiếu nhiều nhất; trong lớp, học sinh chưa có bản mượn đi trước.
-- Học sinh được cấp SGK thì bản mượn tạm tự thu hồi; phần dư nhập vào kho thư viện.
create or replace function receive_shipment(p_shipment uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  sh          shipments%rowtype;
  v_allocated int := 0;
  v_surplus   int := 0;
begin
  if app_role() is distinct from 'admin' then
    raise exception 'Chỉ nhà trường được nhập kho';
  end if;

  select * into sh from shipments where id = p_shipment for update;
  if not found or sh.status <> 'transit' then
    raise exception 'Lô hàng không tồn tại hoặc đã nhập kho';
  end if;

  with lacking as (
    select s.id, s.name, s.class_id
    from students s
    where not exists (select 1 from student_books sb where sb.student_id = s.id and sb.book_id = sh.book_id)
  ),
  per_class as (
    select class_id, count(*) as n from lacking group by class_id
  ),
  ranked as (
    select l.id,
           row_number() over (
             order by c.n desc, l.class_id,
                      exists (select 1 from borrows b
                              where b.student_id = l.id and b.book_id = sh.book_id and b.status = 'active'),
                      l.name
           ) as rn
    from lacking l join per_class c on c.class_id = l.class_id
  ),
  chosen as (
    select id from ranked where rn <= sh.qty
  ),
  ins as (
    insert into student_books (student_id, book_id)
    select id, sh.book_id from chosen
    returning student_id
  ),
  ret as (
    update borrows
       set status = 'returned', return_date = current_date
     where book_id = sh.book_id and status = 'active'
       and student_id in (select id from chosen)
    returning 1
  )
  select count(*) into v_allocated from ins;

  v_surplus := greatest(sh.qty - v_allocated, 0);

  if v_surplus > 0 then
    insert into book_inventory (book_id, total) values (sh.book_id, v_surplus)
    on conflict (book_id) do update set total = book_inventory.total + excluded.total;
  end if;

  update shipments
     set status = 'received', received_at = now(), allocated = v_allocated, to_stock = v_surplus
   where id = p_shipment;

  insert into activity_log (text)
  values (format('Nhập kho %s cuốn %s: phân bổ cho %s học sinh, %s cuốn vào kho.',
                 sh.qty, sh.book_id, v_allocated, v_surplus));
end $$;

-- Tắt Temporary Mode chỉ được khi 100% học sinh có đủ SGK
create or replace function set_temporary_mode(p_on boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if app_role() is distinct from 'admin' then raise exception 'Chỉ nhà trường được đổi chế độ'; end if;
  if not p_on and exists (
       select 1 from students s cross join books b
       where not exists (select 1 from student_books sb where sb.student_id = s.id and sb.book_id = b.id)) then
    raise exception 'Chưa thể tắt: vẫn còn học sinh chưa có SGK';
  end if;
  insert into settings (key, value) values ('temporary_mode', to_jsonb(p_on))
  on conflict (key) do update set value = excluded.value;
  insert into activity_log (text)
  values (case when p_on then 'Bật Chế độ hỗ trợ tạm thời.' else 'Tắt Chế độ hỗ trợ tạm thời: 100% học sinh đã có SGK.' end);
end $$;

-- Xuất bản Learning Pack: kiểm tra lại điều kiện ở máy chủ (giấy phép đã bị chặn bởi ràng buộc của bảng resources)
create or replace function publish_pack(p_pack uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_content jsonb;
begin
  if app_role() is null or app_role() not in ('teacher', 'admin') then
    raise exception 'Chỉ giáo viên được xuất bản';
  end if;
  select content into v_content from learning_packs where id = p_pack;
  if not found then raise exception 'Không tìm thấy Learning Pack'; end if;
  if jsonb_array_length(coalesce(v_content -> 'objectives', '[]'::jsonb)) < 2 then
    raise exception 'Cần ít nhất 2 mục tiêu cần đạt';
  end if;
  update learning_packs set status = 'published', updated_at = now() where id = p_pack;
end $$;

-- ---------- Bảo mật theo dòng (RLS) ----------
alter table profiles       enable row level security;
alter table classes        enable row level security;
alter table students       enable row level security;
alter table subjects       enable row level security;
alter table books          enable row level security;
alter table book_inventory enable row level security;
alter table student_books  enable row level security;
alter table borrows        enable row level security;
alter table learning_packs enable row level security;
alter table resources      enable row level security;
alter table shipments      enable row level security;
alter table settings       enable row level security;
alter table activity_log   enable row level security;

-- Danh mục dùng chung: ai đăng nhập cũng đọc được; chỉ nhà trường ghi
create policy read_classes   on classes        for select to authenticated using (true);
create policy read_subjects  on subjects       for select to authenticated using (true);
create policy read_books     on books          for select to authenticated using (true);
create policy read_inventory on book_inventory for select to authenticated using (true);
create policy read_settings  on settings       for select to authenticated using (true);
create policy admin_books    on books          for all to authenticated using (app_role() = 'admin') with check (app_role() = 'admin');
create policy admin_inv      on book_inventory for all to authenticated using (app_role() = 'admin') with check (app_role() = 'admin');
create policy admin_classes  on classes        for all to authenticated using (app_role() = 'admin') with check (app_role() = 'admin');

create policy own_profile on profiles for select to authenticated
  using (id = auth.uid() or app_role() in ('teacher', 'admin'));

create policy read_students on students for select to authenticated
  using (profile_id = auth.uid() or app_role() in ('teacher', 'admin'));
create policy write_students on students for all to authenticated
  using (app_role() in ('teacher', 'admin')) with check (app_role() in ('teacher', 'admin'));

create policy read_owned on student_books for select to authenticated
  using (app_role() in ('teacher', 'admin')
         or exists (select 1 from students s where s.id = student_id and s.profile_id = auth.uid()));
create policy write_owned on student_books for all to authenticated
  using (app_role() in ('teacher', 'admin')) with check (app_role() in ('teacher', 'admin'));

-- Lượt mượn: chỉ đọc trực tiếp; thay đổi đi qua borrow_book / return_book / renew_borrow
create policy read_borrows on borrows for select to authenticated
  using (app_role() in ('teacher', 'admin')
         or exists (select 1 from students s where s.id = student_id and s.profile_id = auth.uid()));

create policy read_packs on learning_packs for select to authenticated
  using (status = 'published' or app_role() in ('teacher', 'admin'));
create policy write_packs on learning_packs for all to authenticated
  using (app_role() in ('teacher', 'admin')) with check (app_role() in ('teacher', 'admin'));

create policy read_resources on resources for select to authenticated
  using (exists (select 1 from learning_packs p
                 where p.id = pack_id and (p.status = 'published' or app_role() in ('teacher', 'admin'))));
create policy write_resources on resources for all to authenticated
  using (app_role() in ('teacher', 'admin')) with check (app_role() in ('teacher', 'admin'));

create policy read_shipments on shipments for select to authenticated using (app_role() in ('teacher', 'admin'));
create policy write_shipments on shipments for all to authenticated
  using (app_role() = 'admin') with check (app_role() = 'admin');

create policy admin_settings on settings for all to authenticated
  using (app_role() = 'admin') with check (app_role() = 'admin');

create policy read_log on activity_log for select to authenticated using (app_role() in ('teacher', 'admin'));
