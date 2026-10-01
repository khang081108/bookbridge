import { Badge, Icon } from './ui';
import type { BookStatus, Group, LicenseKind } from '../types';
import { LICENSES } from '../lib/constants';

export function StatusBadge({ status }: { status: BookStatus }) {
  switch (status.kind) {
    case 'owned':
      return (
        <Badge tone="ok" icon="check">
          Đã có SGK
        </Badge>
      );
    case 'physical':
      return (
        <Badge tone="brand" icon="book">
          Đang mượn bản giấy
        </Badge>
      );
    case 'ebook':
      return (
        <Badge tone="brand" icon="tablet">
          Đang dùng bản điện tử
        </Badge>
      );
    default:
      return (
        <Badge tone="danger" icon="alert">
          Chưa có SGK
        </Badge>
      );
  }
}

export function LicenseBadge({ license }: { license: LicenseKind }) {
  const info = LICENSES[license];
  return (
    <Badge tone={info.allowed ? 'ok' : 'danger'} icon={info.allowed ? 'shield' : 'lock'}>
      {info.label}
    </Badge>
  );
}

type Cell = 'hold' | 'swap' | 'pack';
const PLAN: { day: string; dow: number; a: Cell; b: Cell }[] = [
  { day: 'Thứ 2', dow: 1, a: 'hold', b: 'pack' },
  { day: 'Thứ 3', dow: 2, a: 'hold', b: 'pack' },
  { day: 'Thứ 4', dow: 3, a: 'swap', b: 'hold' },
  { day: 'Thứ 5', dow: 4, a: 'pack', b: 'hold' },
  { day: 'Thứ 6', dow: 5, a: 'swap', b: 'pack' },
];

function CellBadge({ c }: { c: Cell }) {
  if (c === 'hold')
    return (
      <Badge tone="brand" icon="book">
        Giữ sách
      </Badge>
    );
  if (c === 'swap')
    return (
      <Badge tone="warn" icon="swap">
        Đổi sách
      </Badge>
    );
  return (
    <Badge tone="neutral" icon="lines">
      Learning Pack
    </Badge>
  );
}

/** Lịch luân phiên mẫu cho lớp có số sách bằng một nửa sĩ số. */
export function RotationPlan({ group }: { group?: Group }) {
  const dow = new Date().getDay();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-sm">
        <caption className="sr-only">Lịch luân phiên sách giữa nhóm A và nhóm B</caption>
        <thead>
          <tr className="border-b border-line text-muted">
            <th scope="col" className="py-2 pr-3 font-semibold">
              Ngày
            </th>
            <th scope="col" className={`py-2 pr-3 font-semibold ${group === 'A' ? 'text-brand-ink' : ''}`}>
              Nhóm A{group === 'A' && ' (bạn)'}
            </th>
            <th scope="col" className={`py-2 font-semibold ${group === 'B' ? 'text-brand-ink' : ''}`}>
              Nhóm B{group === 'B' && ' (bạn)'}
            </th>
          </tr>
        </thead>
        <tbody>
          {PLAN.map((r) => (
            <tr key={r.day} className={`border-b border-line/70 ${r.dow === dow ? 'bg-sun-soft/60' : ''}`}>
              <th scope="row" className="py-2 pr-3 font-semibold">
                {r.day}
                {r.dow === dow && <span className="ml-2 text-xs font-semibold text-sun-ink">Hôm nay</span>}
              </th>
              <td className="py-2 pr-3">
                <CellBadge c={r.a} />
              </td>
              <td className="py-2">
                <CellBadge c={r.b} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Meter({ label, value, total, tone = 'brand' }: { label: string; value: number; total: number; tone?: 'brand' | 'ok' | 'warn' | 'danger' }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const bar = { brand: 'bg-brand', ok: 'bg-ok', warn: 'bg-sun', danger: 'bg-danger' }[tone];
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-24 shrink-0 font-medium">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/10" role="img" aria-label={`${label}: ${value}/${total}`}>
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-16 shrink-0 text-right tabular-nums text-muted">
        {value}/{total}
      </span>
    </div>
  );
}

export function IconTile({ name }: { name: Parameters<typeof Icon>[0]['name'] }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
      <Icon name={name} />
    </span>
  );
}
