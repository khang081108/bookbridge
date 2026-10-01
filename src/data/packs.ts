import type { LearningPack } from '../types';

/**
 * Bộ Learning Pack mẫu. Toàn bộ nội dung là ví dụ do người soạn tự viết dựa trên
 * yêu cầu cần đạt của chương trình, KHÔNG sao chép nguyên văn hay hình ảnh từ SGK.
 */
export function samplePacks(day: string): LearningPack[] {
  return [
    {
      id: 'pk-toan-ham-so',
      subjectId: 'toan',
      grade: 10,
      title: 'Hàm số và đồ thị',
      unit: 'Chủ đề: Hàm số',
      author: 'Tổ Toán (mẫu)',
      status: 'published',
      updatedAt: day,
      objectives: [
        'Nhận biết một quy tắc có phải là hàm số hay không.',
        'Tìm tập xác định của hàm số cho bởi công thức đơn giản.',
        'Tính giá trị của hàm số tại một điểm.',
        'Vẽ đồ thị hàm số bậc nhất y = ax + b bằng hai điểm.',
      ],
      core: [
        {
          heading: 'Hàm số là gì?',
          points: [
            'Một hàm số gán cho mỗi giá trị x trong tập xác định đúng một giá trị y. Ta viết y = f(x).',
            'Tập xác định D là tập các giá trị x để biểu thức f(x) có nghĩa.',
            'Hàm số có thể cho bằng bảng, bằng công thức hoặc bằng đồ thị.',
          ],
        },
        {
          heading: 'Tìm tập xác định',
          points: [
            'Với f(x) = 1 / g(x): cần g(x) ≠ 0.',
            'Với f(x) = √g(x): cần g(x) ≥ 0.',
            'Đa thức xác định với mọi số thực x.',
          ],
        },
        {
          heading: 'Đồ thị hàm số',
          points: [
            'Đồ thị của y = f(x) là tập các điểm (x; f(x)) trên mặt phẳng tọa độ.',
            'Đồ thị y = ax + b (a ≠ 0) là một đường thẳng, chỉ cần hai điểm; thường chọn giao điểm với hai trục.',
          ],
        },
      ],
      examples: [
        {
          problem: 'Cho f(x) = 2x² − 3x + 1. Tính f(2) và f(−1).',
          solution: 'f(2) = 2·4 − 6 + 1 = 3. f(−1) = 2·1 + 3 + 1 = 6.',
        },
        {
          problem: 'Tìm tập xác định của y = √(x − 2) / (x − 5).',
          solution:
            'Cần x − 2 ≥ 0 và x − 5 ≠ 0, suy ra x ≥ 2 và x ≠ 5. Vậy D = [2; +∞) \\ {5}.',
        },
      ],
      exercises: [
        { q: 'Tìm tập xác định của y = 3 / (x + 4).', answer: 'D = ℝ \\ {−4}.' },
        { q: 'Cho g(x) = |x| − 2x. Tính g(−3).', answer: 'g(−3) = 3 + 6 = 9.' },
        {
          q: 'Tìm giao điểm của đồ thị y = 2x − 4 với hai trục tọa độ.',
          answer: 'Với x = 0 được (0; −4). Với y = 0 được x = 2, điểm (2; 0). Nối hai điểm để vẽ đồ thị.',
        },
        { q: 'Tìm tập xác định của y = √(6 − 2x).', answer: 'Cần 6 − 2x ≥ 0, tức x ≤ 3. D = (−∞; 3].' },
      ],
      quiz: [
        {
          q: 'Hàm số y = 1 / (x − 1) không xác định tại giá trị nào?',
          options: ['x = 0', 'x = 1', 'x = −1', 'x = 2'],
          answer: 1,
          explain: 'Mẫu số bằng 0 khi x = 1 nên biểu thức không có nghĩa.',
        },
        {
          q: 'Điểm nào thuộc đồ thị y = 2x − 4?',
          options: ['(1; 2)', '(2; 0)', '(0; 4)', '(3; 1)'],
          answer: 1,
          explain: 'Thay x = 2 được y = 0, đúng với điểm (2; 0).',
        },
        {
          q: 'Tập xác định của y = √(x + 3) là:',
          options: ['(−3; +∞)', '[−3; +∞)', '(−∞; −3]', 'ℝ'],
          answer: 1,
          explain: 'Cần x + 3 ≥ 0, tức x ≥ −3.',
        },
      ],
      resources: [
        { id: 'r1', title: 'Video bài giảng: Cách tìm tập xác định (8 phút)', type: 'video', license: 'self' },
        { id: 'r2', title: 'Bảng tóm tắt công thức do tổ Toán biên soạn (PDF)', type: 'doc', license: 'self' },
        {
          id: 'r3',
          title: 'Mô phỏng đồ thị hàm số',
          type: 'link',
          license: 'cc',
          proof: 'Cộng đồng GeoGebra, giấy phép do tác giả từng học liệu chọn. Giáo viên kiểm tra trước khi đưa vào.',
        },
        { id: 'r4', title: 'Mục lục chương Hàm số trên trang chính thức của NXB', type: 'link', license: 'official-link' },
      ],
    },
    {
      id: 'pk-ly-chuyen-dong-thang-deu',
      subjectId: 'ly',
      grade: 10,
      title: 'Chuyển động thẳng đều',
      unit: 'Chủ đề: Mô tả chuyển động',
      author: 'Tổ Vật lí (mẫu)',
      status: 'published',
      updatedAt: day,
      objectives: [
        'Mô tả chuyển động thẳng đều và nêu công thức tính vận tốc.',
        'Viết phương trình chuyển động x = x₀ + vt.',
        'Giải bài toán hai vật chuyển động thẳng đều đuổi kịp hoặc gặp nhau.',
      ],
      core: [
        {
          heading: 'Khái niệm',
          points: [
            'Chuyển động thẳng đều: vật đi theo đường thẳng với vận tốc không đổi.',
            'Trong những khoảng thời gian bằng nhau, vật đi được những quãng đường bằng nhau.',
          ],
        },
        {
          heading: 'Công thức',
          points: [
            'Vận tốc: v = d / t (d là độ dịch chuyển, t là thời gian).',
            'Phương trình chuyển động: x = x₀ + v·t, với v > 0 khi vật đi theo chiều dương.',
            'Đồ thị tọa độ – thời gian là đường thẳng; độ dốc của đường thẳng chính là vận tốc.',
          ],
        },
        {
          heading: 'Lưu ý đơn vị',
          points: ['Đổi km/h sang m/s bằng cách chia cho 3,6. Ví dụ 36 km/h = 10 m/s.'],
        },
      ],
      examples: [
        {
          problem:
            'Xe A xuất phát từ gốc tọa độ với v = 10 m/s. Cùng lúc đó xe B ở vị trí 120 m, chạy cùng chiều với v = 4 m/s. Sau bao lâu A đuổi kịp B?',
          solution:
            'x_A = 10t; x_B = 120 + 4t. A đuổi kịp B khi x_A = x_B: 10t = 120 + 4t, suy ra t = 20 s. Vị trí gặp nhau: x = 200 m.',
        },
      ],
      exercises: [
        { q: 'Đổi 54 km/h sang m/s.', answer: '54 : 3,6 = 15 m/s.' },
        { q: 'Một xe đi thẳng đều với v = 12 m/s. Tính quãng đường đi được sau 25 s.', answer: 'd = v·t = 12 × 25 = 300 m.' },
        { q: 'Viết phương trình chuyển động của vật có x₀ = 5 m, v = −2 m/s.', answer: 'x = 5 − 2t (x tính bằng m, t tính bằng s).' },
      ],
      quiz: [
        {
          q: 'Đồ thị tọa độ – thời gian của chuyển động thẳng đều có dạng:',
          options: ['Đường thẳng', 'Parabol', 'Đường tròn', 'Đường cong bất kì'],
          answer: 0,
          explain: 'x = x₀ + vt là hàm bậc nhất của t nên đồ thị là đường thẳng.',
        },
        {
          q: '36 km/h bằng:',
          options: ['3,6 m/s', '10 m/s', '36 m/s', '100 m/s'],
          answer: 1,
          explain: '36 : 3,6 = 10 m/s.',
        },
        {
          q: 'Trong x = x₀ + vt, đại lượng x₀ là:',
          options: ['Vận tốc', 'Thời gian', 'Tọa độ ban đầu', 'Gia tốc'],
          answer: 2,
          explain: 'x₀ là tọa độ của vật tại thời điểm t = 0.',
        },
      ],
      resources: [
        { id: 'r1', title: 'Video thí nghiệm xe chuyển động trên đệm không khí (6 phút)', type: 'video', license: 'self' },
        { id: 'r2', title: 'Phiếu bài tập chuyển động thẳng đều (PDF)', type: 'doc', license: 'self' },
        {
          id: 'r3',
          title: 'Mô phỏng chuyển động (PhET)',
          type: 'link',
          license: 'cc',
          proof: 'PhET Interactive Simulations, Đại học Colorado Boulder, CC BY 4.0',
        },
      ],
    },
    {
      id: 'pk-hoa-cau-tao-nguyen-tu',
      subjectId: 'hoa',
      grade: 10,
      title: 'Cấu tạo nguyên tử',
      unit: 'Chủ đề: Nguyên tử',
      author: 'Tổ Hóa học (mẫu)',
      status: 'published',
      updatedAt: day,
      objectives: [
        'Nêu thành phần của nguyên tử: proton, neutron, electron.',
        'Xác định số hiệu nguyên tử Z và số khối A.',
        'Tính số hạt trong nguyên tử khi biết Z và A.',
      ],
      core: [
        {
          heading: 'Thành phần nguyên tử',
          points: [
            'Hạt nhân gồm proton (mang điện dương) và neutron (không mang điện). Vỏ nguyên tử chứa electron (mang điện âm).',
            'Nguyên tử trung hòa về điện nên số proton bằng số electron.',
          ],
        },
        {
          heading: 'Đại lượng đặc trưng',
          points: [
            'Số hiệu nguyên tử Z = số proton = số electron.',
            'Số khối A = Z + N, với N là số neutron.',
          ],
        },
        {
          heading: 'Đồng vị',
          points: ['Các nguyên tử có cùng Z nhưng khác N (nên khác A) là các đồng vị của cùng một nguyên tố.'],
        },
      ],
      examples: [
        {
          problem: 'Nguyên tử natri có Z = 11 và A = 23. Tính số proton, electron và neutron.',
          solution: 'p = e = Z = 11. N = A − Z = 23 − 11 = 12.',
        },
      ],
      exercises: [
        { q: 'Nguyên tử clo có 17 proton và 18 neutron. Tính số khối.', answer: 'A = 17 + 18 = 35.' },
        {
          q: 'Nguyên tử X có tổng số hạt (p, n, e) là 40, trong đó số hạt mang điện nhiều hơn số hạt không mang điện là 12. Tìm Z và A.',
          answer: '2Z + N = 40 và 2Z − N = 12, suy ra Z = 13, N = 14, A = 27 (nhôm).',
        },
        {
          q: 'Nguyên tử hiđro có Z = 1, A = 1 và nguyên tử hiđro có Z = 1, A = 2 có phải đồng vị của nhau không?',
          answer: 'Có. Cùng Z = 1 nhưng khác số neutron (0 và 1).',
        },
      ],
      quiz: [
        {
          q: 'Hạt nào trong nguyên tử mang điện tích dương?',
          options: ['Electron', 'Neutron', 'Proton', 'Không hạt nào'],
          answer: 2,
          explain: 'Proton nằm trong hạt nhân và mang điện dương.',
        },
        {
          q: 'Số khối A được tính bằng:',
          options: ['Z − N', 'Z + N', 'N − Z', '2Z'],
          answer: 1,
          explain: 'A = số proton + số neutron = Z + N.',
        },
        {
          q: 'Nguyên tử có Z = 8 có bao nhiêu electron?',
          options: ['4', '8', '16', 'Không xác định'],
          answer: 1,
          explain: 'Nguyên tử trung hòa nên số electron bằng Z = 8.',
        },
      ],
      resources: [
        { id: 'r1', title: 'Video: Hạt nhân và lớp vỏ electron (7 phút)', type: 'video', license: 'self' },
        {
          id: 'r2',
          title: 'Mô phỏng xây dựng nguyên tử (PhET)',
          type: 'link',
          license: 'cc',
          proof: 'PhET Interactive Simulations, Đại học Colorado Boulder, CC BY 4.0',
        },
      ],
    },
    {
      id: 'pk-van-doc-hieu-van-ban-thong-tin',
      subjectId: 'van',
      grade: 10,
      title: 'Đọc hiểu văn bản thông tin',
      unit: 'Kĩ năng: Xác định luận điểm và bằng chứng',
      author: 'Tổ Ngữ văn (mẫu)',
      status: 'published',
      updatedAt: day,
      objectives: [
        'Xác định chủ đề và luận điểm chính của một văn bản thông tin.',
        'Phân biệt thông tin chính với chi tiết minh họa.',
        'Tóm tắt văn bản trong ba đến bốn câu bằng lời của mình.',
      ],
      core: [
        {
          heading: 'Quy trình đọc 4 bước',
          points: [
            'Bước 1: Đọc nhan đề, đề mục và phần mở đầu để dự đoán nội dung.',
            'Bước 2: Đọc lướt để tìm câu chủ đề của từng đoạn.',
            'Bước 3: Gạch chân luận điểm và bằng chứng (số liệu, ví dụ, trích dẫn).',
            'Bước 4: Tóm tắt lại bằng lời của em.',
          ],
        },
        {
          heading: 'Phân biệt',
          points: [
            'Luận điểm là ý chính mà tác giả muốn chứng minh.',
            'Bằng chứng là số liệu, ví dụ, dẫn chứng làm rõ luận điểm.',
            'Câu chủ đề thường đứng ở đầu hoặc cuối đoạn.',
          ],
        },
      ],
      examples: [
        {
          problem:
            'Đoạn văn do giáo viên tự soạn: "Đọc sách giúp mở rộng vốn từ. Nhiều khảo sát cho thấy học sinh đọc đều đặn viết mạch lạc hơn. Vì vậy mỗi ngày nên dành 20 phút để đọc." Hãy xác định luận điểm và bằng chứng.',
          solution:
            'Luận điểm: nên đọc sách mỗi ngày 20 phút. Bằng chứng: khảo sát cho thấy học sinh đọc đều đặn viết mạch lạc hơn.',
        },
      ],
      exercises: [
        {
          q: 'Viết một câu chủ đề cho đoạn văn nói về lợi ích của việc ngủ đủ giấc đối với học tập.',
          answer: 'Gợi ý: Ngủ đủ giấc giúp học sinh tập trung và ghi nhớ bài tốt hơn.',
        },
        {
          q: 'Tóm tắt đoạn văn ở ví dụ trên trong một câu không quá 20 chữ.',
          answer: 'Gợi ý: Đọc sách 20 phút mỗi ngày giúp em viết mạch lạc hơn.',
        },
      ],
      quiz: [
        {
          q: 'Câu chủ đề của một đoạn văn thường:',
          options: ['Nằm giữa đoạn', 'Nêu ý chính của đoạn', 'Là câu dài nhất', 'Luôn là câu cuối'],
          answer: 1,
          explain: 'Câu chủ đề nêu ý chính và thường ở đầu hoặc cuối đoạn.',
        },
        {
          q: 'Số liệu và ví dụ trong văn bản thông tin thường đóng vai trò:',
          options: ['Bằng chứng', 'Nhan đề', 'Lời chào', 'Kết luận'],
          answer: 0,
          explain: 'Chúng được dùng để làm rõ và chứng minh luận điểm.',
        },
      ],
      resources: [
        { id: 'r1', title: 'Sơ đồ 4 bước đọc hiểu (PDF do tổ Ngữ văn biên soạn)', type: 'doc', license: 'self' },
        { id: 'r2', title: 'Video hướng dẫn gạch chân luận điểm (5 phút)', type: 'video', license: 'self' },
      ],
    },
    {
      id: 'pk-anh-present-tenses',
      subjectId: 'anh',
      grade: 10,
      title: 'Present simple và Present continuous',
      unit: 'Grammar',
      author: 'Tổ Tiếng Anh (mẫu)',
      status: 'published',
      updatedAt: day,
      objectives: [
        'Phân biệt cách dùng thì hiện tại đơn và hiện tại tiếp diễn.',
        'Chia đúng dạng động từ trong câu.',
        'Nhận biết động từ trạng thái thường không dùng ở tiếp diễn.',
      ],
      core: [
        {
          heading: 'Present simple',
          points: [
            'Dùng cho thói quen và sự thật hiển nhiên: S + V(s/es).',
            'Dấu hiệu: always, usually, often, every day.',
          ],
        },
        {
          heading: 'Present continuous',
          points: [
            'Dùng cho hành động đang diễn ra: S + am/is/are + V-ing.',
            'Dấu hiệu: now, at the moment, Look!, Listen!',
          ],
        },
        {
          heading: 'Stative verbs',
          points: ['know, like, want, understand… thường không dùng ở thì tiếp diễn.'],
        },
      ],
      examples: [
        { problem: 'Choose: She (studies / is studying) in the library now.', solution: 'is studying, vì có dấu hiệu "now".' },
        { problem: 'Choose: Water (boils / is boiling) at 100°C.', solution: 'boils, vì đây là sự thật khoa học.' },
      ],
      exercises: [
        { q: 'Tom usually ____ (go) to school by bike.', answer: 'goes' },
        { q: 'Look! The children ____ (play) in the yard.', answer: 'are playing' },
        { q: 'I ____ (not / know) the answer.', answer: "don't know (động từ trạng thái)" },
      ],
      quiz: [
        {
          q: 'My mother ____ dinner at the moment.',
          options: ['cooks', 'is cooking', 'cook', 'cooking'],
          answer: 1,
          explain: '"at the moment" báo hiệu hiện tại tiếp diễn.',
        },
        {
          q: 'He ____ football every Sunday.',
          options: ['play', 'is playing', 'plays', 'playing'],
          answer: 2,
          explain: '"every Sunday" là thói quen, chủ ngữ số ít nên thêm s.',
        },
      ],
      resources: [
        { id: 'r1', title: 'Bảng so sánh hai thì (PDF do tổ Tiếng Anh biên soạn)', type: 'doc', license: 'self' },
        { id: 'r2', title: 'Video: Present simple vs continuous (6 phút)', type: 'video', license: 'self' },
      ],
    },
    {
      id: 'pk-toan-bpt-hai-an',
      subjectId: 'toan',
      grade: 10,
      title: 'Bất phương trình bậc nhất hai ẩn',
      unit: 'Chủ đề: Bất phương trình',
      author: 'Tổ Toán (mẫu)',
      status: 'draft',
      updatedAt: day,
      objectives: ['Nhận biết bất phương trình bậc nhất hai ẩn.', 'Biểu diễn miền nghiệm trên mặt phẳng tọa độ.'],
      core: [
        {
          heading: 'Khái niệm',
          points: ['Bất phương trình bậc nhất hai ẩn có dạng ax + by + c < 0 (hoặc >, ≤, ≥).'],
        },
      ],
      examples: [],
      exercises: [],
      quiz: [],
      resources: [],
    },
  ];
}
