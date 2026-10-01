import { Badge, Card, Icon, PageHeader, SectionTitle } from '../components/ui';
import { LICENSES } from '../lib/constants';
import type { LicenseKind } from '../types';

const DO = [
  'Giáo viên tự biên soạn tài liệu dựa trên yêu cầu cần đạt của chương trình.',
  'Cho mượn và luân phiên chính những cuốn sách nhà trường đang có.',
  'Dùng tài nguyên có giấy phép mở, được NXB cho phép hoặc chỉ dẫn liên kết chính thức.',
  'Cho đọc bản điện tử có kiểm soát: suất đọc có hạn, chỉ đọc trong trình duyệt.',
];

const DONT = [
  'Không scan hay chụp SGK rồi đưa lên website.',
  'Không photocopy hàng loạt thay cho việc cung ứng sách.',
  'Không đăng tài liệu chưa rõ giấy phép, kể cả khi "chỉ để tạm thời".',
  'Không thay thế SGK: hệ thống chỉ là cầu nối cho tới khi sách chính thức về đủ.',
];

const LICENSE_ORDER: LicenseKind[] = ['self', 'cc', 'publisher', 'official-link', 'unknown', 'scan'];

export default function About() {
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Mô hình & bản quyền"
        title="Nội dung được cung cấp theo cách hợp pháp"
        desc="Phần quan trọng nhất của dự án không phải là website, mà là mô hình vận hành: ai làm gì, sách đi đâu, nội dung nào được phép xuất hiện."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <SectionTitle icon="check">Hệ thống làm</SectionTitle>
          <ul className="space-y-2.5">
            {DO.map((t) => (
              <li key={t} className="flex gap-2.5">
                <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-ok" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <SectionTitle icon="x">Hệ thống không làm</SectionTitle>
          <ul className="space-y-2.5">
            {DONT.map((t) => (
              <li key={t} className="flex gap-2.5">
                <Icon name="x" className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Cổng bản quyền */}
      <section aria-labelledby="gate">
        <h2 id="gate" className="font-display text-2xl font-semibold">
          Cổng bản quyền (License / Rights Gate)
        </h2>
        <p className="mt-2 max-w-3xl text-muted">
          Mọi học liệu trong Learning Pack phải khai một loại giấy phép trước khi xuất bản. Loại không rõ hoặc bản scan SGK không
          có phép bị chặn, giáo viên không thể bấm xuất bản.
        </p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                <th scope="col" className="px-4 py-3 font-semibold">Loại giấy phép</th>
                <th scope="col" className="px-4 py-3 font-semibold">Kết quả</th>
                <th scope="col" className="px-4 py-3 font-semibold">Cần chứng minh</th>
                <th scope="col" className="px-4 py-3 font-semibold">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {LICENSE_ORDER.map((k) => {
                const l = LICENSES[k];
                return (
                  <tr key={k} className="border-b border-line/70 last:border-0">
                    <th scope="row" className="px-4 py-3 font-semibold">{l.label}</th>
                    <td className="px-4 py-3">
                      <Badge tone={l.allowed ? 'ok' : 'danger'} icon={l.allowed ? 'check' : 'lock'}>
                        {l.allowed ? 'Được xuất bản' : 'Bị chặn'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{l.needsProof ? l.proofLabel : 'Không'}</td>
                    <td className="px-4 py-3 text-muted">{l.hint}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Ebook */}
      <section aria-labelledby="ebook">
        <h2 id="ebook" className="font-display text-2xl font-semibold">
          Sách điện tử khi sách giấy không đủ
        </h2>
        <p className="mt-2 max-w-3xl text-muted">
          Số bản giấy thực tế thường không đủ cho mọi học sinh. Sách điện tử là lớp bổ sung, đi theo ba nguồn có mức rủi ro khác nhau.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <Badge tone="ok">Có trong bản demo</Badge>
            <h3 className="mt-3 font-semibold">A. Sách miễn phí hoặc được phép</h3>
            <p className="mt-1 text-sm text-muted">
              Học sinh mở trực tiếp trên trang chính thức của nhà xuất bản. Hệ thống chỉ chỉ dẫn liên kết, không lưu nội dung.
              Rủi ro thấp, chi phí bằng 0.
            </p>
          </Card>
          <Card className="p-5">
            <Badge tone="ok">Có trong bản demo</Badge>
            <h3 className="mt-3 font-semibold">B. Trường mua suất đọc</h3>
            <p className="mt-1 text-sm text-muted">
              Mỗi suất cấp cho một học sinh trong 14 ngày rồi tự hết hạn và trả lại. Có chi phí, nên chỉ mua cho đầu sách thiếu nhất.
            </p>
          </Card>
          <Card className="p-5">
            <Badge tone="warn">Chưa làm trong MVP</Badge>
            <h3 className="mt-3 font-semibold">C. Cho mượn bản số từ sách giấy của trường</h3>
            <p className="mt-1 text-sm text-muted">
              Mô hình một bản giấy tương ứng một lượt mượn số. Đang gây tranh cãi pháp lý ở nước ngoài và chưa rõ ở Việt Nam, nên
              chỉ cân nhắc khi có văn bản đồng ý của nhà xuất bản.
            </p>
          </Card>
        </div>
        <p className="mt-3 text-sm text-muted">
          Bảo vệ nội dung: chỉ đọc trong trình duyệt, không cho tải về, quyền đọc có hạn, hiển thị mã học sinh trên trang đọc.
        </p>
      </section>

      {/* Temporary Mode */}
      <section aria-labelledby="temp">
        <h2 id="temp" className="font-display text-2xl font-semibold">
          Temporary Mode: giải pháp có điểm kết thúc
        </h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            ['Bật', 'Nhà trường bật chế độ hỗ trợ tạm thời khi bắt đầu năm học.'],
            ['Vận hành', 'Learning Pack, mượn luân phiên, sách điện tử cùng hoạt động.'],
            ['Phân bổ', 'SGK mới về được chia theo mức thiếu: lớp thiếu nhiều và em chưa có bản mượn đi trước.'],
            ['Kết thúc', '100% có SGK thì tắt chế độ; hệ thống thành thư viện và kho học liệu.'],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-2xl border border-line bg-card p-4">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-sun text-sm font-bold text-ink">{i + 1}</span>
              <h3 className="mt-2 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Ai làm gì */}
      <section aria-labelledby="roles">
        <h2 id="roles" className="font-display text-2xl font-semibold">
          Ai làm gì
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <h3 className="flex items-center gap-2 font-semibold"><Icon name="user" className="text-brand" /> Học sinh</h3>
            <p className="mt-2 text-sm text-muted">Xem mình đang thiếu sách nào, học bằng Learning Pack, đăng ký mượn bản giấy hoặc bản điện tử, gia hạn và trả sách.</p>
          </Card>
          <Card className="p-5">
            <h3 className="flex items-center gap-2 font-semibold"><Icon name="users" className="text-brand" /> Giáo viên</h3>
            <p className="mt-2 text-sm text-muted">Theo dõi học sinh thiếu sách trong lớp, ghi nhận em đã nhận SGK, soạn và xuất bản Learning Pack qua cổng bản quyền.</p>
          </Card>
          <Card className="p-5">
            <h3 className="flex items-center gap-2 font-semibold"><Icon name="school" className="text-brand" /> Nhà trường / thư viện</h3>
            <p className="mt-2 text-sm text-muted">Quản lý kho, nhập lô SGK mới và phân bổ theo mức thiếu, quyết định khi nào tắt chế độ tạm thời.</p>
          </Card>
        </div>
      </section>

      <Card className="border-sun/50 bg-sun-soft/50 p-5">
        <h2 className="flex items-center gap-2 font-semibold text-sun-ink"><Icon name="alert" /> Giới hạn của bản MVP</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-sun-ink">
          <li>Dữ liệu học sinh, sách và phiếu mượn là dữ liệu giả lập, lưu trong trình duyệt.</li>
          <li>Vai trò được chọn bằng nút chuyển; đăng nhập thật dùng Supabase Auth (xem thư mục supabase/).</li>
          <li>Các liên kết video và nguồn sách điện tử là chỗ giữ chỗ; nhà trường cấu hình đường dẫn thật khi triển khai.</li>
          <li>Quy định pháp lý về sách điện tử và cho mượn bản số cần được xác nhận với nhà xuất bản và cơ quan quản lý.</li>
        </ul>
      </Card>
    </div>
  );
}
