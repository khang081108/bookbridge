import { Button, ButtonLink, Card, Icon, StatTile, type IconName } from '../components/ui';
import { navigate } from '../lib/router';
import { schoolTotals } from '../lib/logic';
import { useApp } from '../lib/store';

function BridgeArt() {
  return (
    <svg viewBox="0 0 560 300" role="img" aria-label="Chiếc cầu nối từ bờ chưa có sách sang bờ đã có sách chính thức" className="w-full">
      <rect x="0" y="236" width="560" height="64" fill="#dcecea" />
      <path d="M0 262 Q70 250 140 262 T280 262 T420 262 T560 262" fill="none" stroke="#0d5c63" strokeOpacity="0.35" strokeWidth="2" />
      {/* bờ trái */}
      <rect x="20" y="150" width="120" height="96" rx="6" fill="#17212b" opacity="0.06" />
      <rect x="34" y="196" width="92" height="14" rx="2" fill="#e8a33d" />
      <rect x="40" y="182" width="80" height="14" rx="2" fill="#0d5c63" />
      <rect x="46" y="168" width="68" height="14" rx="2" fill="#b42318" opacity="0.85" />
      {/* bờ phải */}
      <rect x="420" y="150" width="120" height="96" rx="6" fill="#17212b" opacity="0.06" />
      <rect x="432" y="196" width="96" height="14" rx="2" fill="#0d5c63" />
      <rect x="438" y="182" width="84" height="14" rx="2" fill="#1f7a4d" />
      <rect x="444" y="168" width="72" height="14" rx="2" fill="#e8a33d" />
      {/* cung cầu */}
      <path d="M96 150 Q280 -10 464 150" fill="none" stroke="#0d5c63" strokeWidth="9" strokeLinecap="round" />
      <path d="M96 150 H464" stroke="#17212b" strokeWidth="5" strokeLinecap="round" />
      {[150, 215, 280, 345, 410].map((x) => {
        const t = (x - 96) / (464 - 96);
        const y = (1 - t) * (1 - t) * 150 + 2 * (1 - t) * t * -10 + t * t * 150;
        return <line key={x} x1={x} y1={y + 4} x2={x} y2={148} stroke="#0d5c63" strokeWidth="3" opacity="0.7" />;
      })}
      {/* nhãn */}
      <g fontFamily="'Be Vietnam Pro', sans-serif" fontSize="13" fontWeight="600" fill="#17212b">
        <text x="80" y="276" textAnchor="middle">
          Chưa có SGK
        </text>
        <text x="480" y="276" textAnchor="middle">
          SGK chính thức
        </text>
      </g>
    </svg>
  );
}

const TIERS: { icon: IconName; title: string; text: string; to: string; cta: string }[] = [
  {
    icon: 'pencil',
    title: 'Tầng 1 – Learning Pack',
    text: 'Giáo viên tự soạn gói học theo từng bài: mục tiêu, kiến thức cốt lõi, ví dụ, bài tập, bài kiểm tra ngắn. Học sinh học được ngay, không phụ thuộc SGK.',
    to: '/student/learn',
    cta: 'Xem học liệu',
  },
  {
    icon: 'swap',
    title: 'Tầng 2 – Thư viện SGK luân phiên',
    text: 'Một cuốn sách phục vụ nhiều học sinh nhờ mượn có hạn, gia hạn, trả và lịch đổi sách giữa các nhóm. Khi bản giấy hết, học sinh được mượn bản điện tử hợp pháp.',
    to: '/student/books',
    cta: 'Mượn sách',
  },
  {
    icon: 'shield',
    title: 'Tầng 3 – Kho tài nguyên hợp pháp',
    text: 'Chỉ nhận học liệu tự biên soạn, giấy phép mở, được NXB cho phép hoặc liên kết chính thức. Cổng bản quyền chặn mọi bản scan không rõ phép.',
    to: '/teacher/packs',
    cta: 'Xem cổng bản quyền',
  },
  {
    icon: 'chart',
    title: 'Tầng 4 – Ai đang có sách?',
    text: 'Bảng điều khiển cho nhà trường: bao nhiêu học sinh thiếu sách, lớp nào thiếu nhiều nhất, lô SGK nào đang về và nên phân bổ cho ai trước.',
    to: '/admin',
    cta: 'Mở dashboard',
  },
];

const DEMO_STEPS: { n: number; title: string; text: string; to: string; role: string }[] = [
  { n: 1, role: 'Học sinh', title: 'Thấy mình thiếu sách', text: 'Khang chưa có SGK Vật lí, bản giấy đã gần hết.', to: '/student' },
  { n: 2, role: 'Học sinh', title: 'Vẫn học ngay bằng Learning Pack', text: 'Đọc bài, làm bài tập, tự kiểm tra bằng quiz.', to: '/student/learn' },
  { n: 3, role: 'Học sinh', title: 'Đăng ký mượn bản giấy hoặc bản điện tử', text: 'Hệ thống kiểm tra số bản còn lại và giới hạn mượn.', to: '/student/books' },
  { n: 4, role: 'Giáo viên', title: 'Tạo Learning Pack qua cổng bản quyền', text: 'Khai giấy phép từng học liệu; học liệu không rõ phép bị chặn.', to: '/teacher/packs' },
  { n: 5, role: 'Nhà trường', title: 'Nhập SGK mới và phân bổ', text: 'Ưu tiên lớp thiếu nhiều và học sinh chưa có bản mượn.', to: '/admin' },
  { n: 6, role: 'Nhà trường', title: 'Tắt Temporary Mode', text: 'Khi 100% có sách, hệ thống thành thư viện và kho học liệu.', to: '/admin' },
];

export default function Home() {
  const { state } = useApp();
  const t = schoolTotals(state);
  const published = state.packs.filter((p) => p.status === 'published').length;
  const loans = state.borrows.filter((b) => b.status === 'active').length;

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand">Cầu nối tri thức</p>
          <h1 className="font-display text-4xl font-semibold leading-[1.1] sm:text-5xl">
            Thiếu sách không có nghĩa là <span className="text-brand">thiếu cơ hội học tập.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            BookBridge giúp học sinh học đúng tiến độ trong những tuần chưa có SGK chính thức: học liệu do giáo viên tự biên
            soạn, sách giấy luân phiên, sách điện tử hợp pháp. Không photocopy, không scan trái phép.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => navigate('/student')}>
              <Icon name="user" className="h-4 w-4" />
              Thử với vai Học sinh
            </Button>
            <Button variant="secondary" onClick={() => navigate('/teacher')}>
              <Icon name="users" className="h-4 w-4" />
              Vai Giáo viên
            </Button>
            <Button variant="secondary" onClick={() => navigate('/admin')}>
              <Icon name="school" className="h-4 w-4" />
              Vai Nhà trường
            </Button>
          </div>
        </div>
        <div className="paper-grain rounded-3xl border border-line bg-card p-4">
          <BridgeArt />
        </div>
      </section>

      {/* Số liệu sống */}
      <section aria-labelledby="live" className="space-y-3">
        <h2 id="live" className="sr-only">
          Số liệu hiện tại của trường demo
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Học sinh chưa đủ SGK" value={t.studentsMissingAny} hint={`trên ${t.students} học sinh khối 10`} tone="danger" icon="alert" />
          <StatTile label="Bản giấy đang cho mượn" value={loans} hint={`kho còn ${t.stockAvailable}/${t.stockTotal} cuốn`} tone="brand" icon="book" />
          <StatTile label="SGK đang vận chuyển" value={t.inTransit} hint="cuốn, chờ nhập kho" tone="warn" icon="truck" />
          <StatTile label="Learning Pack đã xuất bản" value={published} hint="do giáo viên tự biên soạn" tone="ok" icon="pencil" />
        </div>
      </section>

      {/* Bài toán */}
      <section aria-labelledby="problem">
        <h2 id="problem" className="font-display text-3xl font-semibold">
          Một trường có 1.000 học sinh, hai tuần đầu chỉ nhận 700 bộ SGK
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="flex items-center gap-2 font-semibold text-danger">
              <Icon name="alert" /> Cách thông thường
            </h3>
            <ol className="mt-4 space-y-3 text-muted">
              <li>300 học sinh thiếu sách</li>
              <li>Photocopy hàng loạt</li>
              <li className="font-medium text-ink">Vướng bản quyền và tốn chi phí cho cả trường</li>
            </ol>
          </Card>
          <Card className="border-brand/40 p-6">
            <h3 className="flex items-center gap-2 font-semibold text-brand">
              <Icon name="check" /> Cách của BookBridge
            </h3>
            <ol className="mt-4 space-y-3">
              <li>
                300 học sinh thiếu sách nhận <strong>ba lớp hỗ trợ cùng lúc</strong>: Learning Pack của giáo viên, mượn luân
                phiên (giấy hoặc điện tử), tài nguyên hợp pháp
              </li>
              <li>Học bình thường, không gián đoạn</li>
              <li>SGK chính thức về: ưu tiên em chưa có sách, thu hồi bản mượn</li>
              <li className="font-medium">Tắt chế độ tạm thời, hệ thống thành thư viện và kho học liệu</li>
            </ol>
          </Card>
        </div>
      </section>

      {/* 4 tầng */}
      <section aria-labelledby="tiers">
        <h2 id="tiers" className="font-display text-3xl font-semibold">
          Bốn tầng giải pháp
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {TIERS.map((tier) => (
            <Card key={tier.title} className="flex flex-col p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">
                <Icon name={tier.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{tier.title}</h3>
              <p className="mt-2 flex-1 text-muted">{tier.text}</p>
              <div className="mt-4">
                <ButtonLink to={tier.to} variant="ghost" size="sm" className="-ml-3">
                  {tier.cta} <Icon name="arrow" className="h-4 w-4" />
                </ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Kịch bản demo */}
      <section aria-labelledby="demo">
        <h2 id="demo" className="font-display text-3xl font-semibold">
          Demo 5 phút: từ thiếu sách đến kết thúc chế độ tạm thời
        </h2>
        <ol className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {DEMO_STEPS.map((s) => (
            <li key={s.n}>
              <a
                href={`#${s.to}`}
                className="group flex h-full gap-3 rounded-2xl border border-line bg-card p-4 transition-colors hover:border-brand/50"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">{s.n}</span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-brand">{s.role}</span>
                  <span className="block font-semibold group-hover:underline">{s.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">{s.text}</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
