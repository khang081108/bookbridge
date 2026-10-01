import { useRef, useState } from 'react';
import { Meter, RotationPlan, StatusBadge } from '../components/shared';
import { Button, ButtonLink, Card, Chip, EmptyState, PageHeader, SectionTitle, StatTile } from '../components/ui';
import { SUBJECTS } from '../lib/constants';
import { bookStats, statusOf } from '../lib/logic';
import { useApp } from '../lib/store';

export default function TeacherDashboard() {
  const { state, actions } = useApp();
  const [bookId, setBookId] = useState(state.books[0]?.id ?? '');
  const tableRef = useRef<HTMLDivElement>(null);

  const cls = state.classes.find((c) => c.id === state.classId) ?? state.classes[0];
  const students = state.students.filter((s) => s.classId === cls.id);
  const stats = bookStats(state, cls.id);
  const current = stats.find((s) => s.book.id === bookId) ?? stats[0];
  const book = current.book;

  const missingStudents = students.filter((s) => !s.owned.includes(book.id));
  const groupMissing = (g: 'A' | 'B') => missingStudents.filter((s) => s.group === g).length;
  const groupSize = (g: 'A' | 'B') => students.filter((s) => s.group === g).length;

  return (
    <div>
      <PageHeader
        eyebrow="Bảng điều khiển giáo viên"
        title={cls.name}
        desc={`${students.length} học sinh. Chọn môn để xem ai đang thiếu SGK và đã được hỗ trợ bằng cách nào.`}
        actions={
          <ButtonLink to={`/teacher/packs?subject=${book.subjectId}`} variant="sun">
            Tạo Learning Pack
          </ButtonLink>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Chọn lớp">
        {state.classes.map((c) => (
          <Chip key={c.id} active={c.id === cls.id} onClick={() => actions.setClass(c.id)}>
            {c.name}
          </Chip>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Chọn môn">
        {state.books.map((b) => (
          <Chip key={b.id} active={b.id === book.id} onClick={() => setBookId(b.id)}>
            {SUBJECTS.find((s) => s.id === b.subjectId)?.name}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile label="Sĩ số" value={current.students} />
        <StatTile label="Có sách" value={current.owned} tone="ok" hint="đã có SGK chính thức" />
        <StatTile label="Chưa có" value={current.missing} tone="danger" hint={`${book.title}`} />
        <StatTile label="Đang mượn" value={current.physical + current.ebook} tone="brand" hint={`${current.physical} giấy · ${current.ebook} điện tử`} />
        <StatTile label="Chỉ dùng Learning Pack" value={current.uncovered} tone="warn" hint="chưa có bản mượn nào" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
          Xem học sinh thiếu sách
        </Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <Card className="p-5" id="thieu-sach">
          <div ref={tableRef} className="scroll-mt-28">
            <SectionTitle icon="alert">Học sinh chưa có {book.title}</SectionTitle>
            {missingStudents.length === 0 ? (
              <EmptyState title="Cả lớp đã có sách môn này" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-muted">
                      <th scope="col" className="py-2 pr-3 font-semibold">Học sinh</th>
                      <th scope="col" className="py-2 pr-3 font-semibold">Nhóm</th>
                      <th scope="col" className="py-2 pr-3 font-semibold">Hỗ trợ hiện tại</th>
                      <th scope="col" className="py-2 font-semibold">
                        <span className="sr-only">Thao tác</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {missingStudents.map((s) => {
                      const st = statusOf(state, s, book.id);
                      return (
                        <tr key={s.id} className="border-b border-line/70 last:border-0">
                          <th scope="row" className="py-2 pr-3 font-medium">{s.name}</th>
                          <td className="py-2 pr-3">{s.group}</td>
                          <td className="py-2 pr-3">
                            <StatusBadge status={st} />
                          </td>
                          <td className="py-2 text-right">
                            <Button size="sm" variant="secondary" onClick={() => actions.setOwned(s.id, book.id, true)}>
                              Đã nhận SGK
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <SectionTitle icon="chart">Các môn của {cls.name}</SectionTitle>
            <div className="space-y-3">
              {stats.map((s) => (
                <Meter
                  key={s.book.id}
                  label={SUBJECTS.find((x) => x.id === s.book.subjectId)?.name ?? ''}
                  value={s.owned}
                  total={s.students}
                  tone={s.owned / s.students >= 0.85 ? 'ok' : s.owned / s.students >= 0.7 ? 'warn' : 'danger'}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">Thanh thể hiện số học sinh đã có SGK chính thức.</p>
          </Card>

          <Card className="p-5">
            <SectionTitle icon="swap">Luân phiên cho {book.title}</SectionTitle>
            <p className="mb-3 text-sm text-muted">
              Nhóm A: {groupSize('A')} học sinh ({groupMissing('A')} chưa có sách). Nhóm B: {groupSize('B')} học sinh ({groupMissing('B')} chưa có sách).
            </p>
            <RotationPlan />
          </Card>
        </div>
      </div>
    </div>
  );
}
