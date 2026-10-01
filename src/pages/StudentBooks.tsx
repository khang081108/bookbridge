import { RotationPlan, StatusBadge } from '../components/shared';
import { Badge, Button, Card, EmptyState, Icon, PageHeader, SectionTitle } from '../components/ui';
import { EBOOK_LOAN_DAYS, MAX_PHYSICAL_LOANS, MAX_RENEWALS, SUBJECTS } from '../lib/constants';
import { daysBetween, firstName, fmtDate, todayISO } from '../lib/format';
import { availableCopies, canBorrow, getBook, getStudent, loansOf, seatInfo, statusOf } from '../lib/logic';
import { useApp } from '../lib/store';
import { useReader } from '../lib/useReader';

export default function StudentBooks() {
  const { state, actions } = useApp();
  const read = useReader();
  const student = getStudent(state, state.studentId) ?? state.students[0];
  const loans = loansOf(state, student.id);
  const today = todayISO();
  const physicalLoans = loans.filter((l) => l.kind === 'physical').length;
  const subjectName = (id: string) => SUBJECTS.find((s) => s.id === id)?.name ?? id;

  return (
    <div>
      <PageHeader
        eyebrow="Book Hub"
        title="Thư viện sách"
        desc={`${firstName(student.name)} đang mượn ${physicalLoans}/${MAX_PHYSICAL_LOANS} cuốn giấy. Bản giấy mượn 7 ngày, gia hạn tối đa ${MAX_RENEWALS} lần; bản điện tử có hạn ${EBOOK_LOAN_DAYS} ngày.`}
      />

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <SectionTitle icon="shelf">Danh mục SGK khối 10</SectionTitle>
            <ul className="divide-y divide-line">
              {state.books.map((book) => {
                const status = statusOf(state, student, book.id);
                const copies = availableCopies(state, book);
                const seats = seatInfo(state, book);
                const physCheck = canBorrow(state, student.id, book.id, 'physical');
                const ebookCheck = canBorrow(state, student.id, book.id, 'ebook');
                const owned = status.kind === 'owned';
                const hasLoan = status.kind === 'physical' || status.kind === 'ebook';

                return (
                  <li key={book.id} className="py-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-lg font-semibold">{book.title}</p>
                        <p className="text-sm text-muted">
                          {subjectName(book.subjectId)} · {book.publisher}
                        </p>
                      </div>
                      <StatusBadge status={status} />
                    </div>

                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-ink/[0.03] p-3">
                        <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                          <Icon name="book" className="h-4 w-4" /> Bản giấy
                        </dt>
                        <dd className="mt-1 text-sm">
                          <span className={`font-semibold ${copies.available === 0 ? 'text-danger' : ''}`}>
                            {copies.available === 0 ? 'Đã hết' : `Còn ${copies.available}/${copies.total}`}
                          </span>{' '}
                          <span className="text-muted">cuốn trong kho</span>
                        </dd>
                      </div>
                      <div className="rounded-xl bg-ink/[0.03] p-3">
                        <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                          <Icon name="tablet" className="h-4 w-4" /> Bản điện tử
                        </dt>
                        <dd className="mt-1 text-sm">
                          {book.ebook.mode === 'open' && <span className="font-semibold text-ok">Miễn phí, mở trực tiếp</span>}
                          {book.ebook.mode === 'none' && <span className="text-muted">Chưa có bản hợp pháp</span>}
                          {seats && (
                            <>
                              <span className={`font-semibold ${seats.left === 0 ? 'text-danger' : ''}`}>
                                {seats.left === 0 ? 'Đã hết suất' : `Còn ${seats.left}/${seats.seats} suất`}
                              </span>{' '}
                              <span className="text-muted">đọc có hạn</span>
                            </>
                          )}
                        </dd>
                      </div>
                    </dl>

                    {!owned && !hasLoan && (
                      <div className="mt-3 flex flex-wrap items-start gap-3">
                        <div>
                          <Button size="sm" disabled={!physCheck.ok} onClick={() => actions.borrow(student.id, book.id, 'physical')}>
                            <Icon name="book" className="h-4 w-4" /> {copies.available === 0 ? 'Hết bản giấy' : 'Mượn bản giấy'}
                          </Button>
                          {!physCheck.ok && <p className="mt-1 max-w-[16rem] text-xs text-muted">{physCheck.reason}</p>}
                        </div>
                        <div>
                          {book.ebook.mode === 'open' ? (
                            <Button size="sm" variant="secondary" onClick={() => read(book, student)}>
                              <Icon name="link" className="h-4 w-4" /> Đọc bản điện tử
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={!ebookCheck.ok}
                              onClick={() => actions.borrow(student.id, book.id, 'ebook')}
                            >
                              <Icon name="tablet" className="h-4 w-4" /> Mượn bản điện tử
                            </Button>
                          )}
                          {book.ebook.mode !== 'open' && !ebookCheck.ok && (
                            <p className="mt-1 max-w-[16rem] text-xs text-muted">{ebookCheck.reason}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {owned && <p className="mt-3 text-sm text-muted">Bạn đã có SGK này nên không cần mượn.</p>}
                    {hasLoan && <p className="mt-3 text-sm text-muted">Bạn đang mượn sách này. Xem mục "Đang mượn" để gia hạn hoặc trả.</p>}
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5" id="dang-muon">
            <SectionTitle icon="clock">Đang mượn</SectionTitle>
            {loans.length === 0 ? (
              <EmptyState title="Bạn chưa mượn cuốn nào" desc="Chọn sách ở danh mục bên cạnh." />
            ) : (
              <ul className="space-y-3">
                {loans.map((l) => {
                  const book = getBook(state, l.bookId);
                  const overdue = l.dueDate < today;
                  const left = daysBetween(today, l.dueDate);
                  return (
                    <li key={l.id} className="rounded-xl border border-line p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{book?.title}</p>
                        <Badge tone={l.kind === 'physical' ? 'brand' : 'neutral'} icon={l.kind === 'physical' ? 'book' : 'tablet'}>
                          {l.kind === 'physical' ? 'Bản giấy' : 'Bản điện tử'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        Nhận {fmtDate(l.borrowDate)} · {l.kind === 'physical' ? 'Hạn trả' : 'Hết hạn'}{' '}
                        <span className={overdue ? 'font-semibold text-danger' : left <= 2 ? 'font-semibold text-sun-ink' : ''}>
                          {fmtDate(l.dueDate)}
                          {overdue ? ' (quá hạn)' : ''}
                        </span>
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {l.kind === 'ebook' && book && (
                          <Button size="sm" variant="secondary" onClick={() => read(book, student)}>
                            Đọc
                          </Button>
                        )}
                        {l.kind === 'physical' && (
                          <Button size="sm" variant="secondary" disabled={l.renewals >= MAX_RENEWALS} onClick={() => actions.renew(l.id)}>
                            Gia hạn{l.renewals > 0 ? ` (${l.renewals}/${MAX_RENEWALS})` : ''}
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => actions.giveBack(l.id)}>
                          Trả sách
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <SectionTitle icon="swap">Lịch luân phiên nhóm {student.group}</SectionTitle>
            <RotationPlan group={student.group} />
          </Card>

          <Card className="p-5">
            <SectionTitle icon="lock">Quy tắc đọc bản điện tử</SectionTitle>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
              <li>Chỉ đọc trong trình duyệt, không cho tải về.</li>
              <li>Quyền đọc tự hết hạn sau {EBOOK_LOAN_DAYS} ngày và trả suất cho bạn khác.</li>
              <li>Trang đọc hiển thị mã học sinh để hạn chế chia sẻ.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
