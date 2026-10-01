import { RotationPlan, StatusBadge } from '../components/shared';
import { Button, ButtonLink, Card, Icon, PageHeader, SectionTitle } from '../components/ui';
import { SUBJECTS } from '../lib/constants';
import { daysBetween, firstName, fmtDate, todayISO } from '../lib/format';
import { getStudent, loansOf, statusOf } from '../lib/logic';
import { Link } from '../lib/router';
import { useApp } from '../lib/store';
import { useReader } from '../lib/useReader';

export default function StudentDashboard() {
  const { state, actions } = useApp();
  const read = useReader();
  const student = getStudent(state, state.studentId) ?? state.students[0];
  const subjectName = (id: string) => SUBJECTS.find((s) => s.id === id)?.name ?? id;

  const rows = state.books.map((book) => ({ book, status: statusOf(state, student, book.id) }));
  const missing = rows.filter((r) => r.status.kind === 'missing');
  const loans = loansOf(state, student.id);

  const publishedFor = (subjectId: string) => state.packs.filter((p) => p.status === 'published' && p.subjectId === subjectId);
  const focusSubject = missing[0]?.book.subjectId ?? rows[0]?.book.subjectId;
  const focusPack = focusSubject ? publishedFor(focusSubject)[0] : undefined;
  const today = todayISO();

  return (
    <div>
      <PageHeader
        eyebrow={`Lớp ${student.classId} · Nhóm ${student.group}`}
        title={`Xin chào, ${firstName(student.name)}`}
        desc="Đây là tình trạng SGK của bạn. Dù chưa có sách, bạn vẫn học đúng tiến độ nhờ Learning Pack."
        actions={
          <label className="flex flex-col text-xs font-semibold text-muted">
            Học sinh demo
            <select
              value={student.id}
              onChange={(e) => actions.setStudent(e.target.value)}
              className="mt-1 min-h-10 rounded-xl border border-line bg-card px-3 text-sm font-medium text-ink"
            >
              {state.classes.map((c) => (
                <optgroup key={c.id} label={c.name}>
                  {state.students
                    .filter((s) => s.classId === c.id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
        }
      />

      {missing.length > 0 ? (
        <Card className="mb-6 border-danger/40 bg-danger-soft/60 p-5">
          <p className="flex items-center gap-2 font-semibold text-danger-ink">
            <Icon name="alert" /> Chưa có SGK {missing.map((m) => m.book.title.replace(/ 10$/, '')).join(', ')}
          </p>
          <p className="mt-1 text-sm text-danger-ink/90">
            Bạn có thể học ngay bằng Learning Pack, mượn bản giấy khi thư viện còn, hoặc mượn bản điện tử.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ButtonLink to={`/student/learn?subject=${missing[0].book.subjectId}`} size="sm">
              Mở Learning Pack
            </ButtonLink>
            <ButtonLink to="/student/books" variant="secondary" size="sm">
              Mượn sách thư viện
            </ButtonLink>
          </div>
        </Card>
      ) : (
        <Card className="mb-6 border-ok/40 bg-ok-soft/60 p-5">
          <p className="flex items-center gap-2 font-semibold text-ok-ink">
            <Icon name="check" /> Bạn đã có đủ SGK
          </p>
          <p className="mt-1 text-sm text-ok-ink/90">Learning Pack vẫn dùng được để ôn tập và luyện thêm.</p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <SectionTitle icon="book">Sách của tôi</SectionTitle>
            <ul className="divide-y divide-line">
              {rows.map(({ book, status }) => {
                const loan = status.borrow;
                const overdue = loan && loan.dueDate < today;
                const left = loan ? daysBetween(today, loan.dueDate) : 0;
                return (
                  <li key={book.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-semibold">{book.title}</p>
                      <p className="text-sm text-muted">{subjectName(book.subjectId)} · {book.publisher}</p>
                      {loan && (
                        <p className={`mt-1 text-sm ${overdue ? 'font-semibold text-danger' : 'text-muted'}`}>
                          {loan.kind === 'physical' ? 'Hạn trả' : 'Quyền đọc hết hạn'} {fmtDate(loan.dueDate)}
                          {overdue ? ' (quá hạn)' : left <= 2 ? ` (còn ${left} ngày)` : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={status} />
                      {status.kind === 'ebook' && (
                        <Button size="sm" variant="secondary" onClick={() => read(book, student)}>
                          <Icon name="tablet" className="h-4 w-4" /> Đọc
                        </Button>
                      )}
                      {status.kind === 'missing' && (
                        <ButtonLink to="/student/books" size="sm" variant="secondary">
                          Mượn
                        </ButtonLink>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            {loans.length > 0 && (
              <p className="mt-3 text-sm text-muted">
                Đang mượn {loans.length} cuốn. <Link to="/student/books" className="font-semibold text-brand underline">Quản lý mượn/trả</Link>
              </p>
            )}
          </Card>

          <Card className="p-5">
            <SectionTitle icon="swap">Lịch luân phiên của nhóm {student.group}</SectionTitle>
            <RotationPlan group={student.group} />
            <p className="mt-3 text-sm text-muted">
              Khi lớp có số sách bằng một nửa sĩ số, hai nhóm đổi sách theo lịch. Ngày nào chưa có sách, bạn học bằng Learning Pack.
            </p>
          </Card>
        </div>

        <div className="space-y-6">
          {focusPack && (
            <Card className="p-5">
              <SectionTitle icon="target">Bài đang học</SectionTitle>
              <p className="text-sm font-medium text-brand">{subjectName(focusPack.subjectId)} · {focusPack.unit}</p>
              <h3 className="font-display text-2xl font-semibold">{focusPack.title}</h3>
              <ul className="mt-3 space-y-1.5 text-sm">
                {focusPack.objectives.slice(0, 3).map((o) => (
                  <li key={o} className="flex gap-2">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                    {o}
                  </li>
                ))}
              </ul>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <ButtonLink to={`/student/learn/${focusPack.id}`} size="sm">
                  Learning Pack
                </ButtonLink>
                <ButtonLink to={`/student/learn/${focusPack.id}`} size="sm" variant="secondary">
                  Bài tập
                </ButtonLink>
                <ButtonLink to={`/student/learn/${focusPack.id}`} size="sm" variant="secondary">
                  Video
                </ButtonLink>
                <ButtonLink to={`/student/learn/${focusPack.id}`} size="sm" variant="secondary">
                  Tự kiểm tra
                </ButtonLink>
              </div>
            </Card>
          )}

          <Card className="p-5">
            <SectionTitle icon="shelf">Mượn sách thư viện</SectionTitle>
            <p className="text-sm text-muted">Chọn bản giấy hoặc bản điện tử. Mỗi bạn mượn tối đa 3 cuốn giấy cùng lúc.</p>
            <div className="mt-3">
              <ButtonLink to="/student/books" variant="sun">
                Đăng ký mượn <Icon name="arrow" className="h-4 w-4" />
              </ButtonLink>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
