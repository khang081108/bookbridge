import { useState } from 'react';
import { Meter } from '../components/shared';
import { Badge, Button, Card, EmptyState, Icon, PageHeader, ProgressBar, SectionTitle, StatTile } from '../components/ui';
import { SUBJECTS } from '../lib/constants';
import { fmtDate, fmtDateTime, pct } from '../lib/format';
import { bookStats, coverageComplete, getBook, planAllocation, schoolTotals } from '../lib/logic';
import { useApp } from '../lib/store';

export default function AdminDashboard() {
  const { state, actions } = useApp();
  const t = schoolTotals(state);
  const stats = bookStats(state);
  const complete = coverageComplete(state);
  const coverage = pct(t.have, t.need);
  const transit = state.shipments.filter((s) => s.status === 'transit');
  const received = state.shipments.filter((s) => s.status === 'received');
  const [newBook, setNewBook] = useState(state.books[0]?.id ?? '');
  const [newQty, setNewQty] = useState('50');

  const worst = stats.slice().sort((a, b) => b.missing - a.missing);
  const classRows = state.classes.map((c) => {
    const list = state.students.filter((s) => s.classId === c.id);
    const short = list.filter((s) => state.books.some((b) => !s.owned.includes(b.id))).length;
    const missingTotal = bookStats(state, c.id).reduce((n, s) => n + s.missing, 0);
    return { c, size: list.length, short, missingTotal, need: list.length * state.books.length };
  });
  const subjectName = (id: string) => SUBJECTS.find((s) => s.id === id)?.name ?? id;

  return (
    <div>
      <PageHeader
        eyebrow="Bảng điều khiển nhà trường"
        title="Điều phối sách toàn khối 10"
        desc="Biết chính xác học sinh nào chưa có sách, lô SGK nào đang về và nên phân bổ cho ai trước."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="SGK cần cung ứng" value={t.need.toLocaleString('vi-VN')} hint={`${t.students} học sinh × ${state.books.length} môn`} icon="box" />
        <StatTile label="Đã có" value={t.have.toLocaleString('vi-VN')} tone="ok" hint={`${coverage}% nhu cầu`} icon="check" />
        <StatTile label="Còn thiếu" value={t.missing.toLocaleString('vi-VN')} tone="danger" icon="alert" />
        <StatTile label="Học sinh chưa đủ sách" value={t.studentsMissingAny} tone="danger" hint={`${t.uncovered} suất chỉ dựa vào Learning Pack`} icon="users" />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Kho thư viện" value={t.stockAvailable} hint={`còn lại trên ${t.stockTotal} cuốn`} tone="brand" icon="shelf" />
        <StatTile label="Đang cho mượn" value={t.stockTotal - t.stockAvailable} hint="bản giấy ngoài kho" tone="brand" icon="book" />
        <StatTile label="Đang vận chuyển" value={t.inTransit} hint={`${transit.length} lô hàng`} tone="warn" icon="truck" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {/* Thiếu theo môn */}
          <Card className="p-5">
            <SectionTitle icon="chart">Môn đang thiếu nhiều nhất</SectionTitle>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-muted">
                    <th scope="col" className="py-2 pr-3 font-semibold">Môn</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Đã có</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Thiếu</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Mượn giấy</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Điện tử</th>
                    <th scope="col" className="py-2 text-right font-semibold">Chỉ Learning Pack</th>
                  </tr>
                </thead>
                <tbody>
                  {worst.map((s, i) => (
                    <tr key={s.book.id} className="border-b border-line/70 last:border-0">
                      <th scope="row" className="py-2.5 pr-3 font-semibold">
                        {i === 0 && <Icon name="alert" className="mr-1 inline h-4 w-4 text-danger" />}
                        {s.book.title}
                      </th>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{s.owned}</td>
                      <td className="py-2.5 pr-3 text-right font-semibold tabular-nums text-danger">{s.missing}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{s.physical}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{s.ebook}</td>
                      <td className="py-2.5 text-right tabular-nums">{s.uncovered}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Theo lớp */}
          <Card className="p-5">
            <SectionTitle icon="school">Theo lớp</SectionTitle>
            <div className="space-y-3">
              {classRows.map((r) => (
                <div key={r.c.id}>
                  <Meter label={r.c.name} value={r.need - r.missingTotal} total={r.need} tone={r.missingTotal / r.need > 0.25 ? 'danger' : 'warn'} />
                  <p className="ml-27 pl-0.5 text-xs text-muted">{r.short} học sinh chưa đủ sách</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Lô hàng */}
          <Card className="p-5">
            <SectionTitle icon="truck">Lô SGK</SectionTitle>
            {transit.length === 0 ? (
              <EmptyState title="Không có lô hàng nào đang vận chuyển" desc="Tạo lô mới bên dưới để thử luồng nhập kho." />
            ) : (
              <ul className="space-y-4">
                {transit.map((sh) => {
                  const book = getBook(state, sh.bookId);
                  const plan = planAllocation(state, sh.bookId, sh.qty);
                  return (
                    <li key={sh.id} className="rounded-xl border border-line p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">
                          {sh.qty} cuốn {book?.title}
                        </p>
                        <Badge tone="warn" icon="truck">Dự kiến {fmtDate(sh.eta)}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted">
                        <strong className="text-ink">Kế hoạch phân bổ:</strong>{' '}
                        {Object.entries(plan.byClass).map(([c, n]) => `${c}: ${n}`).join(' · ') || 'không ai thiếu'}
                        {plan.surplus > 0 && ` · ${plan.surplus} cuốn dư vào kho`}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Ưu tiên lớp thiếu nhiều nhất, trong lớp ưu tiên em chưa có bản mượn. Bản mượn của em được nhận sách sẽ thu hồi về kho.
                      </p>
                      <div className="mt-3">
                        <Button size="sm" onClick={() => actions.receive(sh.id)}>
                          <Icon name="box" className="h-4 w-4" /> Nhập kho và phân bổ
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <form
              className="mt-5 flex flex-wrap items-end gap-3 border-t border-line pt-4"
              onSubmit={(e) => {
                e.preventDefault();
                actions.addShipment(newBook, Number(newQty));
              }}
            >
              <label className="text-xs font-semibold text-muted">
                Môn
                <select value={newBook} onChange={(e) => setNewBook(e.target.value)} className="mt-1 block min-h-10 rounded-xl border border-line bg-card px-3 text-sm font-medium text-ink">
                  {state.books.map((b) => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-muted">
                Số lượng
                <input
                  type="number"
                  min={1}
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  className="mt-1 block min-h-10 w-28 rounded-xl border border-line bg-card px-3 text-sm font-medium text-ink"
                />
              </label>
              <Button type="submit" variant="secondary">
                <Icon name="plus" className="h-4 w-4" /> Tạo lô hàng
              </Button>
            </form>

            {received.length > 0 && (
              <div className="mt-5 border-t border-line pt-4">
                <h3 className="mb-2 text-sm font-semibold text-muted">Đã nhập kho</h3>
                <ul className="space-y-1.5 text-sm">
                  {received.slice(0, 6).map((sh) => (
                    <li key={sh.id} className="flex flex-wrap items-center gap-2">
                      <Icon name="check" className="h-4 w-4 text-ok" />
                      {sh.qty} cuốn {getBook(state, sh.bookId)?.title}: phân bổ {sh.allocated ?? 0} học sinh
                      {sh.toStock ? `, ${sh.toStock} cuốn vào kho` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {/* Temporary Mode */}
          <Card className={`p-5 ${state.temporaryMode ? 'border-sun/60' : 'border-ok/50'}`}>
            <SectionTitle icon="clock">Temporary Mode</SectionTitle>
            <div className="flex items-center justify-between gap-3">
              <Badge tone={state.temporaryMode ? 'warn' : 'ok'}>{state.temporaryMode ? 'Đang bật' : 'Đã tắt'}</Badge>
              <span className="text-sm tabular-nums text-muted">{coverage}% học sinh có SGK</span>
            </div>
            <div className="mt-3">
              <ProgressBar value={coverage} tone={complete ? 'ok' : 'warn'} label="Tỉ lệ SGK chính thức đã có" />
            </div>
            <p className="mt-3 text-sm text-muted">
              {state.temporaryMode
                ? complete
                  ? '100% học sinh đã có SGK. Có thể tắt chế độ tạm thời.'
                  : `Còn thiếu ${t.missing} cuốn. Chỉ tắt được khi mọi học sinh có đủ SGK.`
                : 'Hệ thống đang là thư viện và kho học liệu. Bật lại nếu năm học có đợt thiếu sách mới.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {state.temporaryMode ? (
                <Button onClick={() => actions.setTemporary(false)} disabled={!complete}>
                  Tắt Temporary Mode
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => actions.setTemporary(true)}>
                  Bật lại
                </Button>
              )}
              {!complete && (
                <Button variant="sun" onClick={actions.supplyAll}>
                  Mô phỏng: nhập đủ SGK
                </Button>
              )}
            </div>
            {!complete && <p className="mt-2 text-xs text-muted">Nút mô phỏng dùng cho demo: tạo và nhập lô đủ số SGK còn thiếu.</p>}
          </Card>

          {/* Kho theo môn */}
          <Card className="p-5">
            <SectionTitle icon="shelf">Kho thư viện theo môn</SectionTitle>
            <div className="space-y-2.5">
              {state.books.map((b) => {
                const out = state.borrows.filter((x) => x.bookId === b.id && x.kind === 'physical' && x.status === 'active').length;
                return (
                  <Meter key={b.id} label={subjectName(b.subjectId)} value={b.libraryTotal - out} total={b.libraryTotal} tone={b.libraryTotal - out === 0 ? 'danger' : 'brand'} />
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted">Thanh là số cuốn còn trong kho trên tổng số cuốn của thư viện.</p>
          </Card>

          {/* Nhật ký */}
          <Card className="p-5">
            <SectionTitle icon="lines">Hoạt động gần đây</SectionTitle>
            <ul className="space-y-3">
              {state.log.slice(0, 8).map((l) => (
                <li key={l.id} className="text-sm">
                  <span className="block text-xs font-semibold text-muted">{fmtDateTime(l.at)}</span>
                  {l.text}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
