import { useMemo, useState, type ReactNode } from 'react';
import { LicenseBadge } from '../components/shared';
import { Badge, Button, Card, Icon, PageHeader, SectionTitle } from '../components/ui';
import { LICENSES, SUBJECTS } from '../lib/constants';
import { fmtDate } from '../lib/format';
import {
  buildPack,
  emptyForm,
  gatePassed,
  newResource,
  packToForm,
  runGate,
  sampleForm,
  type PackForm,
  type ResourceDraft,
} from '../lib/packForm';
import { Link } from '../lib/router';
import { useApp } from '../lib/store';
import type { LicenseKind } from '../types';

const input = 'mt-1 w-full rounded-xl font-normal border border-line bg-card px-3 py-2 text-sm placeholder:text-muted/70';

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      {hint && <span className="ml-2 text-xs font-normal text-muted">{hint}</span>}
      {children}
    </label>
  );
}

const subjectName = (id: string) => SUBJECTS.find((s) => s.id === id)?.name ?? id;

export default function TeacherPacks({ initialSubject }: { initialSubject?: string | null }) {
  const { state, actions } = useApp();
  const startSubject = SUBJECTS.some((s) => s.id === initialSubject) ? (initialSubject as string) : 'toan';
  const [form, setForm] = useState<PackForm>(() => emptyForm(startSubject));
  const [editingId, setEditingId] = useState<string | undefined>();

  const checks = useMemo(() => runGate(form), [form]);
  const passed = gatePassed(checks);
  const set = <K extends keyof PackForm>(k: K, v: PackForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  const setResource = (id: string, patch: Partial<ResourceDraft>) =>
    setForm((f) => ({ ...f, resources: f.resources.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));

  const publish = () => {
    if (!passed) return;
    actions.savePack(buildPack(form, 'published', editingId));
    setEditingId(undefined);
    setForm(emptyForm(form.subjectId));
  };
  const saveDraft = () => {
    if (!form.title.trim()) return;
    actions.savePack(buildPack(form, 'draft', editingId));
    setEditingId(undefined);
    setForm(emptyForm(form.subjectId));
  };

  return (
    <div>
      <PageHeader
        eyebrow="Learning Pack Studio"
        title="Soạn Learning Pack"
        desc="Tự biên soạn nội dung theo yêu cầu cần đạt của chương trình. Mọi học liệu phải qua cổng bản quyền trước khi xuất bản."
        actions={
          <Button variant="secondary" onClick={() => { setForm(sampleForm()); setEditingId(undefined); }}>
            <Icon name="pencil" className="h-4 w-4" /> Điền bài mẫu
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Biểu mẫu Learning Pack">
          <Card className="space-y-4 p-5">
            <SectionTitle icon="book">{editingId ? 'Đang chỉnh sửa gói' : 'Thông tin chung'}</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Môn học">
                <select className={input} value={form.subjectId} onChange={(e) => set('subjectId', e.target.value)}>
                  {SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Chủ đề / đơn vị kiến thức">
                <input className={input} value={form.unit} onChange={(e) => set('unit', e.target.value)} placeholder="Ví dụ: Chủ đề: Hàm số" />
              </Field>
            </div>
            <Field label="Tên bài học">
              <input className={input} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ví dụ: Hàm số và đồ thị" />
            </Field>
            <Field label="Mục tiêu cần đạt" hint="mỗi dòng một mục tiêu">
              <textarea className={input} rows={3} value={form.objectives} onChange={(e) => set('objectives', e.target.value)} />
            </Field>
          </Card>

          <Card className="space-y-4 p-5">
            <SectionTitle icon="lines">Nội dung do giáo viên biên soạn</SectionTitle>
            <Field label="Kiến thức cốt lõi" hint='dòng bắt đầu bằng "# " là tiêu đề nhóm ý'>
              <textarea className={`${input} font-mono`} rows={6} value={form.core} onChange={(e) => set('core', e.target.value)} />
            </Field>
            <Field label="Ví dụ minh họa" hint='mỗi dòng: đề || lời giải'>
              <textarea className={`${input} font-mono`} rows={3} value={form.examples} onChange={(e) => set('examples', e.target.value)} />
            </Field>
            <Field label="Bài tập luyện tập" hint='mỗi dòng: câu hỏi || đáp án'>
              <textarea className={`${input} font-mono`} rows={4} value={form.exercises} onChange={(e) => set('exercises', e.target.value)} />
            </Field>
            <Field label="Bài kiểm tra ngắn" hint='mỗi dòng: câu hỏi | A | B | C | D | đáp án đúng (A–D)'>
              <textarea className={`${input} font-mono`} rows={3} value={form.quiz} onChange={(e) => set('quiz', e.target.value)} />
            </Field>
          </Card>

          <Card className="space-y-4 p-5">
            <SectionTitle
              icon="shield"
              aside={
                <Button size="sm" variant="secondary" onClick={() => set('resources', [...form.resources, newResource()])}>
                  <Icon name="plus" className="h-4 w-4" /> Thêm học liệu
                </Button>
              }
            >
              Học liệu đi kèm và giấy phép
            </SectionTitle>
            {form.resources.length === 0 && <p className="text-sm text-muted">Chưa có học liệu. Có thể bỏ trống nếu bài chỉ gồm nội dung tự soạn ở trên.</p>}
            <ul className="space-y-4">
              {form.resources.map((r) => {
                const lic = LICENSES[r.license];
                return (
                  <li key={r.id} className={`rounded-xl border p-3 ${lic.allowed ? 'border-line' : 'border-danger/50 bg-danger-soft/40'}`}>
                    <div className="grid gap-3 sm:grid-cols-[1.4fr_0.7fr_1.2fr]">
                      <Field label="Tên học liệu">
                        <input className={input} value={r.title} onChange={(e) => setResource(r.id, { title: e.target.value })} />
                      </Field>
                      <Field label="Loại">
                        <select className={input} value={r.type} onChange={(e) => setResource(r.id, { type: e.target.value as ResourceDraft['type'] })}>
                          <option value="video">Video</option>
                          <option value="doc">Tài liệu</option>
                          <option value="link">Liên kết</option>
                        </select>
                      </Field>
                      <Field label="Giấy phép">
                        <select className={input} value={r.license} onChange={(e) => setResource(r.id, { license: e.target.value as LicenseKind })}>
                          {(Object.keys(LICENSES) as LicenseKind[]).map((k) => (
                            <option key={k} value={k}>{LICENSES[k].label}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    {lic.needsProof && (
                      <div className="mt-3">
                        <Field label={lic.proofLabel ?? 'Nguồn'}>
                          <input className={input} value={r.proof} onChange={(e) => setResource(r.id, { proof: e.target.value })} />
                        </Field>
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <p className={`text-xs ${lic.allowed ? 'text-muted' : 'font-semibold text-danger-ink'}`}>{lic.hint}</p>
                      <Button size="sm" variant="ghost" onClick={() => set('resources', form.resources.filter((x) => x.id !== r.id))}>
                        Xóa
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-muted">Thử chọn "Bản scan/chụp SGK không có phép" để xem cổng bản quyền chặn xuất bản.</p>
          </Card>
        </form>

        {/* Cổng bản quyền */}
        <aside>
          <div className="space-y-4 lg:sticky lg:top-40">
            <Card className={`p-5 ${passed ? 'border-ok/50' : ''}`}>
              <SectionTitle icon={passed ? 'shield' : 'lock'}>Cổng bản quyền</SectionTitle>
              <ul className="space-y-2.5" aria-label="Kết quả kiểm tra trước khi xuất bản">
                {checks.map((c) => (
                  <li key={c.id} className="flex gap-2 text-sm">
                    <Icon name={c.ok ? 'check' : 'x'} className={`mt-0.5 h-4 w-4 shrink-0 ${c.ok ? 'text-ok' : 'text-danger'}`} />
                    <span>
                      <span className={c.ok ? '' : 'font-semibold'}>{c.label}</span>
                      <span className="sr-only">{c.ok ? ': đạt' : ': chưa đạt'}</span>
                      {c.detail && <span className="block text-xs text-danger-ink">{c.detail}</span>}
                    </span>
                  </li>
                ))}
              </ul>
              <label className="mt-4 flex cursor-pointer items-start gap-2 rounded-xl bg-brand-soft/60 p-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[#0d5c63]"
                  checked={form.declared}
                  onChange={(e) => set('declared', e.target.checked)}
                />
                <span>
                  Tôi cam kết nội dung do tôi biên soạn, không sao chép nguyên văn hay chụp lại trang SGK.
                </span>
              </label>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={publish} disabled={!passed}>
                  <Icon name="check" className="h-4 w-4" /> {editingId ? 'Cập nhật và xuất bản' : 'Xuất bản'}
                </Button>
                <Button variant="secondary" onClick={saveDraft} disabled={!form.title.trim()}>
                  Lưu nháp
                </Button>
              </div>
              {!passed && <p className="mt-2 text-xs text-muted">Nút xuất bản mở khi mọi mục bên trên đều đạt.</p>}
            </Card>

            <Card className="p-5">
              <SectionTitle icon="eye">Xem trước</SectionTitle>
              <p className="text-sm text-muted">{subjectName(form.subjectId)} · {form.unit || 'Chủ đề'}</p>
              <p className="font-display text-xl font-semibold">{form.title || 'Chưa đặt tên bài'}</p>
              <p className="mt-1 text-xs text-muted">
                {runGateCounts(form)}
              </p>
            </Card>
          </div>
        </aside>
      </div>

      {/* Danh sách */}
      <section className="mt-10" aria-labelledby="mine">
        <h2 id="mine" className="mb-3 font-display text-2xl font-semibold">Các Learning Pack hiện có</h2>
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                <th scope="col" className="px-4 py-3 font-semibold">Bài học</th>
                <th scope="col" className="px-4 py-3 font-semibold">Môn</th>
                <th scope="col" className="px-4 py-3 font-semibold">Học liệu</th>
                <th scope="col" className="px-4 py-3 font-semibold">Trạng thái</th>
                <th scope="col" className="px-4 py-3 font-semibold"><span className="sr-only">Thao tác</span></th>
              </tr>
            </thead>
            <tbody>
              {state.packs.map((p) => (
                <tr key={p.id} className="border-b border-line/70 last:border-0">
                  <th scope="row" className="px-4 py-3 font-semibold">
                    {p.status === 'published' ? (
                      <Link to={`/student/learn/${p.id}`} className="hover:underline">{p.title}</Link>
                    ) : (
                      p.title
                    )}
                    <span className="block text-xs font-normal text-muted">Cập nhật {fmtDate(p.updatedAt)}</span>
                  </th>
                  <td className="px-4 py-3">{subjectName(p.subjectId)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.resources.length === 0 && <span className="text-muted">Không có</span>}
                      {[...new Set(p.resources.map((r) => r.license))].map((l) => (
                        <LicenseBadge key={l} license={l} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={p.status === 'published' ? 'ok' : 'warn'}>{p.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setForm(packToForm(p));
                          setEditingId(p.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        Chỉnh sửa
                      </Button>
                      {p.status === 'published' && (
                        <Button size="sm" variant="ghost" onClick={() => actions.setPackStatus(p.id, 'draft')}>
                          Gỡ
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function runGateCounts(f: PackForm): string {
  const obj = f.objectives.split('\n').filter((l) => l.trim()).length;
  const ex = f.exercises.split('\n').filter((l) => l.trim()).length;
  const qz = f.quiz.split('\n').filter((l) => l.trim()).length;
  return `${obj} mục tiêu · ${ex} bài tập · ${qz} câu kiểm tra · ${f.resources.length} học liệu`;
}
