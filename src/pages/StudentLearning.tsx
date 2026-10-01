import { useState } from 'react';
import { LicenseBadge, StatusBadge } from '../components/shared';
import { Badge, Button, ButtonLink, Card, Chip, EmptyState, Icon, PageHeader, SectionTitle } from '../components/ui';
import { SUBJECTS } from '../lib/constants';
import { fmtDate } from '../lib/format';
import { availableCopies, bookBySubject, getStudent, seatInfo, statusOf } from '../lib/logic';
import { Link, navigate } from '../lib/router';
import { useApp } from '../lib/store';
import { useToast } from '../lib/toast';
import { useReader } from '../lib/useReader';
import type { LearningPack } from '../types';

const subjectName = (id: string) => SUBJECTS.find((s) => s.id === id)?.name ?? id;

export default function StudentLearning({ packId, initialSubject }: { packId?: string; initialSubject?: string | null }) {
  const { state } = useApp();
  if (packId) {
    const pack = state.packs.find((p) => p.id === packId && p.status === 'published');
    if (!pack) {
      return (
        <div>
          <EmptyState title="Không tìm thấy Learning Pack" desc="Gói này có thể đã được gỡ hoặc chưa xuất bản." />
          <div className="mt-4 text-center">
            <ButtonLink to="/student/learn" variant="secondary">
              Về Learning Hub
            </ButtonLink>
          </div>
        </div>
      );
    }
    return <PackView pack={pack} />;
  }
  return <Hub initialSubject={initialSubject ?? 'all'} />;
}

/* ------------------------------ Learning Hub ------------------------------ */

function Hub({ initialSubject }: { initialSubject: string }) {
  const { state } = useApp();
  const [subject, setSubject] = useState(SUBJECTS.some((s) => s.id === initialSubject) ? initialSubject : 'all');
  const [grade, setGrade] = useState(10);

  const packs = state.packs.filter(
    (p) => p.status === 'published' && p.grade === grade && (subject === 'all' || p.subjectId === subject),
  );

  return (
    <div>
      <PageHeader
        eyebrow="Learning Hub"
        title="Học ngay, không cần chờ sách"
        desc="Mỗi gói gồm mục tiêu, kiến thức cốt lõi, ví dụ, bài tập và bài kiểm tra ngắn do giáo viên tự biên soạn."
      />

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <label className="flex flex-col text-xs font-semibold text-muted">
          Khối
          <select
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            className="mt-1 min-h-10 rounded-xl border border-line bg-card px-3 text-sm font-medium text-ink"
          >
            <option value={10}>Khối 10</option>
            <option value={11} disabled>
              Khối 11 (chưa có dữ liệu)
            </option>
            <option value={12} disabled>
              Khối 12 (chưa có dữ liệu)
            </option>
          </select>
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo môn">
          <Chip active={subject === 'all'} onClick={() => setSubject('all')}>
            Tất cả
          </Chip>
          {SUBJECTS.map((s) => (
            <Chip key={s.id} active={subject === s.id} onClick={() => setSubject(s.id)}>
              {s.name}
            </Chip>
          ))}
        </div>
      </div>

      {packs.length === 0 ? (
        <EmptyState title="Chưa có Learning Pack cho lựa chọn này" desc="Giáo viên có thể tạo và xuất bản trong mục Learning Pack." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {packs.map((p) => (
            <li key={p.id}>
              <Link
                to={`/student/learn/${p.id}`}
                className="flex h-full flex-col rounded-2xl border border-line bg-card p-5 transition-colors hover:border-brand/50"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-brand">
                  <Badge tone="brand">{subjectName(p.subjectId)}</Badge>
                  {p.unit}
                </span>
                <span className="mt-2 font-display text-2xl font-semibold">{p.title}</span>
                <span className="mt-2 flex-1 text-sm text-muted">{p.objectives[0]}</span>
                <span className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
                  <span className="inline-flex items-center gap-1"><Icon name="pencil" className="h-4 w-4" />{p.exercises.length} bài tập</span>
                  <span className="inline-flex items-center gap-1"><Icon name="target" className="h-4 w-4" />{p.quiz.length} câu kiểm tra</span>
                  <span className="inline-flex items-center gap-1"><Icon name="shield" className="h-4 w-4" />{p.resources.length} học liệu</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------ Một Learning Pack ------------------------------ */

function PackView({ pack }: { pack: LearningPack }) {
  const { state } = useApp();
  const toast = useToast();
  const read = useReader();
  const student = getStudent(state, state.studentId) ?? state.students[0];
  const book = bookBySubject(state, pack.subjectId);
  const status = book ? statusOf(state, student, book.id) : undefined;

  return (
    <div>
      <p className="mb-3">
        <Link to="/student/learn" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
          <Icon name="arrow" className="h-4 w-4 rotate-180" /> Learning Hub
        </Link>
      </p>
      <PageHeader eyebrow={`${subjectName(pack.subjectId)} · Khối ${pack.grade} · ${pack.unit}`} title={pack.title} desc={`Biên soạn: ${pack.author}. Cập nhật ${fmtDate(pack.updatedAt)}.`} />

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <SectionTitle icon="target">Mục tiêu bài học</SectionTitle>
            <p className="mb-2 text-sm text-muted">Sau bài học, bạn có thể:</p>
            <ul className="space-y-2">
              {pack.objectives.map((o) => (
                <li key={o} className="flex gap-2">
                  <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-ok" />
                  {o}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <SectionTitle icon="lines">Kiến thức cốt lõi</SectionTitle>
            <div className="space-y-4">
              {pack.core.map((c) => (
                <div key={c.heading}>
                  <h3 className="font-semibold">{c.heading}</h3>
                  <ul className="mt-1 list-disc space-y-1 pl-6">
                    {c.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          {pack.examples.length > 0 && (
            <Card className="p-5">
              <SectionTitle icon="book">Ví dụ minh họa</SectionTitle>
              <div className="space-y-4">
                {pack.examples.map((ex, i) => (
                  <div key={i} className="rounded-xl bg-brand-soft/50 p-4">
                    <p className="font-medium">{ex.problem}</p>
                    <p className="mt-2 text-sm text-brand-ink">
                      <strong>Lời giải: </strong>
                      {ex.solution}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {pack.exercises.length > 0 && (
            <Card className="p-5">
              <SectionTitle icon="pencil">Luyện tập</SectionTitle>
              <ol className="space-y-3">
                {pack.exercises.map((ex, i) => (
                  <li key={i} className="rounded-xl border border-line p-4">
                    <p className="font-medium">
                      Câu {i + 1}. {ex.q}
                    </p>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-semibold text-brand">Xem đáp án</summary>
                      <p className="mt-2 rounded-lg bg-ok-soft px-3 py-2 text-sm text-ok-ink">{ex.answer}</p>
                    </details>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {pack.quiz.length > 0 && <Quiz pack={pack} />}
        </div>

        <aside className="space-y-6">
          {book && status && (
            <Card className="border-brand/40 p-5">
              <SectionTitle icon="book">SGK {book.title}</SectionTitle>
              <StatusBadge status={status} />
              {status.kind === 'owned' && <p className="mt-3 text-sm text-muted">Bạn đã có sách. Dùng gói này để đối chiếu và luyện thêm.</p>}
              {status.kind === 'physical' && status.borrow && (
                <p className="mt-3 text-sm text-muted">Bạn đang mượn bản giấy, hạn trả {fmtDate(status.borrow.dueDate)}.</p>
              )}
              {status.kind === 'ebook' && status.borrow && (
                <>
                  <p className="mt-3 text-sm text-muted">Bạn đang dùng bản điện tử, hết hạn {fmtDate(status.borrow.dueDate)}.</p>
                  <div className="mt-3">
                    <Button size="sm" onClick={() => read(book, student)}>
                      <Icon name="tablet" className="h-4 w-4" /> Đọc bản điện tử
                    </Button>
                  </div>
                </>
              )}
              {status.kind === 'missing' && (
                <div className="mt-3 space-y-3 text-sm">
                  <p className="font-medium">Bạn chưa có sách?</p>
                  <ul className="space-y-1.5 text-muted">
                    <li>Bản giấy trong thư viện: còn {availableCopies(state, book).available}/{book.libraryTotal} cuốn.</li>
                    <li>
                      Bản điện tử:{' '}
                      {book.ebook.mode === 'open'
                        ? 'mở trực tiếp, miễn phí.'
                        : book.ebook.mode === 'seats'
                          ? `còn ${seatInfo(state, book)?.left ?? 0}/${book.ebook.seats} suất.`
                          : 'chưa có.'}
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    {book.ebook.mode === 'open' && (
                      <Button size="sm" variant="secondary" onClick={() => read(book, student)}>
                        <Icon name="link" className="h-4 w-4" /> Xem tài nguyên chính thức
                      </Button>
                    )}
                    <Button size="sm" onClick={() => navigate('/student/books')}>
                      Kiểm tra thư viện
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          <Card className="p-5">
            <SectionTitle icon="shield">Học liệu và giấy phép</SectionTitle>
            <ul className="space-y-3">
              {pack.resources.map((r) => (
                <li key={r.id} className="text-sm">
                  <div className="flex items-start gap-2">
                    <Icon name={r.type === 'video' ? 'play' : r.type === 'doc' ? 'lines' : 'link'} className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <div>
                      <p className="font-medium">{r.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <LicenseBadge license={r.license} />
                        <button
                          type="button"
                          onClick={() => toast('Demo: giáo viên gắn đường dẫn thật khi xuất bản học liệu.', 'info')}
                          className="text-xs font-semibold text-brand underline"
                        >
                          {r.type === 'video' ? 'Xem' : 'Mở'}
                        </button>
                      </div>
                      {r.proof && <p className="mt-1 text-xs text-muted">Nguồn: {r.proof}</p>}
                    </div>
                  </div>
                </li>
              ))}
              {pack.resources.length === 0 && <li className="text-sm text-muted">Gói này chưa có học liệu đi kèm.</li>}
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------ Quiz ------------------------------ */

function Quiz({ pack }: { pack: LearningPack }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const answered = Object.keys(picked).length;
  const correct = pack.quiz.reduce((n, q, i) => (picked[i] === q.answer ? n + 1 : n), 0);
  const done = answered === pack.quiz.length;

  return (
    <Card className="p-5">
      <SectionTitle
        icon="target"
        aside={
          <Button size="sm" variant="ghost" onClick={() => setPicked({})} disabled={answered === 0}>
            <Icon name="refresh" className="h-4 w-4" /> Làm lại
          </Button>
        }
      >
        Bài kiểm tra ngắn
      </SectionTitle>
      <ol className="space-y-5">
        {pack.quiz.map((q, i) => {
          const sel = picked[i];
          const has = sel !== undefined;
          return (
            <li key={i}>
              <p className="font-medium">
                Câu {i + 1}. {q.q}
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-label={`Đáp án câu ${i + 1}`}>
                {q.options.map((opt, j) => {
                  const isRight = has && j === q.answer;
                  const isWrong = has && j === sel && j !== q.answer;
                  return (
                    <button
                      key={j}
                      type="button"
                      disabled={has}
                      onClick={() => setPicked((cur) => ({ ...cur, [i]: j }))}
                      className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors ${
                        isRight
                          ? 'border-ok bg-ok-soft text-ok-ink'
                          : isWrong
                            ? 'border-danger bg-danger-soft text-danger-ink'
                            : 'border-line bg-card hover:border-brand/50 disabled:text-muted'
                      }`}
                    >
                      <span className="mr-1 font-bold">{String.fromCharCode(65 + j)}.</span>{' '}
                      {opt}
                      {isRight && <span className="sr-only"> (đúng)</span>}
                      {isWrong && <span className="sr-only"> (sai)</span>}
                    </button>
                  );
                })}
              </div>
              {has && (
                <p className={`mt-2 text-sm ${sel === q.answer ? 'text-ok-ink' : 'text-danger-ink'}`}>
                  <strong>{sel === q.answer ? 'Chính xác. ' : 'Chưa đúng. '}</strong>
                  {q.explain}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {done && (
        <p className="mt-5 rounded-xl bg-brand-soft px-4 py-3 font-semibold text-brand-ink" role="status">
          Kết quả: {correct}/{pack.quiz.length} câu đúng.
        </p>
      )}
    </Card>
  );
}
