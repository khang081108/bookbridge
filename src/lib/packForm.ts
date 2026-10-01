import type { CoreBlock, Exercise, LearningPack, LicenseKind, QuizItem, Resource, WorkedExample } from '../types';
import { LICENSES } from './constants';
import { todayISO, uid } from './format';

export interface ResourceDraft {
  id: string;
  title: string;
  type: Resource['type'];
  license: LicenseKind;
  proof: string;
}

export interface PackForm {
  subjectId: string;
  title: string;
  unit: string;
  objectives: string;
  core: string;
  examples: string;
  exercises: string;
  quiz: string;
  resources: ResourceDraft[];
  declared: boolean;
}

export const emptyForm = (subjectId = 'toan'): PackForm => ({
  subjectId,
  title: '',
  unit: '',
  objectives: '',
  core: '',
  examples: '',
  exercises: '',
  quiz: '',
  resources: [],
  declared: false,
});

/** Bài mẫu để demo nhanh. Nội dung do người soạn tự viết. */
export const sampleForm = (): PackForm => ({
  subjectId: 'toan',
  title: 'Hệ thức lượng trong tam giác',
  unit: 'Chủ đề: Hệ thức lượng',
  objectives: 'Nêu và vận dụng định lí côsin trong tam giác.\nNêu và vận dụng định lí sin trong tam giác.',
  core: [
    '# Định lí côsin',
    'a² = b² + c² − 2bc·cos A.',
    'Dùng khi biết hai cạnh và góc xen giữa, hoặc biết cả ba cạnh.',
    '# Định lí sin',
    'a / sin A = b / sin B = c / sin C = 2R, với R là bán kính đường tròn ngoại tiếp.',
  ].join('\n'),
  examples:
    'Tam giác ABC có b = 5, c = 8 và góc A = 60°. Tính a. || a² = 25 + 64 − 2·5·8·cos 60° = 89 − 40 = 49, nên a = 7.',
  exercises: [
    'Tam giác có a = 6 và góc A = 30°. Tính bán kính đường tròn ngoại tiếp R. || 2R = a / sin A = 6 / 0,5 = 12, nên R = 6.',
    'Tam giác ABC có a = 7, b = 8, c = 9. Tính cos A. || cos A = (b² + c² − a²) / (2bc) = (64 + 81 − 49) / 144 = 2/3.',
  ].join('\n'),
  quiz: [
    'Công thức nào đúng với định lí côsin? | a² = b² + c² − 2bc·cos A | a² = b² + c² + 2bc·cos A | a² = b² + c² | a = b + c | A',
    'Trong định lí sin, tỉ số a / sin A bằng: | R | 2R | R/2 | 4R | B',
  ].join('\n'),
  resources: [
    { id: uid('r'), title: 'Video giải bài mẫu (giáo viên tự quay)', type: 'video', license: 'self', proof: '' },
    { id: uid('r'), title: 'Phiếu bài tập định lí sin, côsin (PDF tự biên soạn)', type: 'doc', license: 'self', proof: '' },
  ],
  declared: false,
});

export const newResource = (): ResourceDraft => ({ id: uid('r'), title: '', type: 'doc', license: 'self', proof: '' });

/* ------------------------------ Phân tích văn bản ------------------------------ */

const lines = (s: string): string[] =>
  s
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

export const parseObjectives = (s: string): string[] => lines(s);

export function parseCore(s: string): CoreBlock[] {
  const blocks: CoreBlock[] = [];
  for (const l of lines(s)) {
    if (l.startsWith('# ')) {
      blocks.push({ heading: l.slice(2).trim(), points: [] });
    } else {
      if (blocks.length === 0) blocks.push({ heading: 'Kiến thức cốt lõi', points: [] });
      blocks[blocks.length - 1].points.push(l);
    }
  }
  return blocks.filter((b) => b.points.length > 0);
}

function parsePairs(s: string, fallback: string): { a: string; b: string }[] {
  return lines(s).map((l) => {
    const i = l.indexOf('||');
    return i === -1 ? { a: l, b: fallback } : { a: l.slice(0, i).trim(), b: l.slice(i + 2).trim() || fallback };
  });
}

export const parseExamples = (s: string): WorkedExample[] =>
  parsePairs(s, 'Giáo viên bổ sung lời giải.').map((p) => ({ problem: p.a, solution: p.b }));

export const parseExercises = (s: string): Exercise[] =>
  parsePairs(s, 'Giáo viên bổ sung đáp án.').map((p) => ({ q: p.a, answer: p.b }));

export function parseQuiz(s: string): { items: QuizItem[]; bad: number } {
  const items: QuizItem[] = [];
  let bad = 0;
  for (const l of lines(s)) {
    const parts = l.split('|').map((p) => p.trim());
    const letter = parts[parts.length - 1]?.toUpperCase();
    const options = parts.slice(1, -1);
    const idx = letter && /^[A-D]$/.test(letter) ? letter.charCodeAt(0) - 65 : -1;
    if (parts.length < 4 || options.length < 2 || idx < 0 || idx >= options.length || !parts[0]) {
      bad++;
      continue;
    }
    items.push({ q: parts[0], options, answer: idx, explain: `Đáp án đúng: ${letter}. ${options[idx]}` });
  }
  return { items, bad };
}

/* ------------------------------ Cổng bản quyền ------------------------------ */

export interface GateCheck {
  id: string;
  label: string;
  ok: boolean;
  detail?: string;
}

export function runGate(f: PackForm): GateCheck[] {
  const blocked = f.resources.filter((r) => !LICENSES[r.license].allowed);
  const noProof = f.resources.filter((r) => LICENSES[r.license].needsProof && !r.proof.trim());
  const untitled = f.resources.filter((r) => !r.title.trim());
  const quiz = parseQuiz(f.quiz);
  const corePoints = parseCore(f.core).reduce((n, b) => n + b.points.length, 0);

  return [
    { id: 'title', label: 'Có tiêu đề bài học', ok: f.title.trim().length > 0 },
    { id: 'obj', label: 'Có ít nhất 2 mục tiêu cần đạt', ok: parseObjectives(f.objectives).length >= 2 },
    { id: 'core', label: 'Có ít nhất 2 ý kiến thức cốt lõi', ok: corePoints >= 2 },
    { id: 'ex', label: 'Có ít nhất 1 bài tập luyện tập', ok: parseExercises(f.exercises).length >= 1 },
    {
      id: 'quiz',
      label: 'Câu kiểm tra đúng định dạng',
      ok: quiz.bad === 0,
      detail: quiz.bad > 0 ? `${quiz.bad} dòng sai định dạng` : undefined,
    },
    {
      id: 'res-name',
      label: 'Mọi học liệu đều có tên',
      ok: untitled.length === 0,
    },
    {
      id: 'res-license',
      label: 'Mọi học liệu khai giấy phép hợp lệ',
      ok: blocked.length === 0,
      detail: blocked.length > 0 ? blocked.map((r) => `"${r.title || 'chưa đặt tên'}" – ${LICENSES[r.license].label}`).join('; ') : undefined,
    },
    {
      id: 'res-proof',
      label: 'Học liệu giấy phép mở / NXB có ghi nguồn hoặc văn bản',
      ok: noProof.length === 0,
      detail: noProof.length > 0 ? noProof.map((r) => `"${r.title || 'chưa đặt tên'}"`).join('; ') : undefined,
    },
    { id: 'declare', label: 'Giáo viên cam kết không sao chép nguyên văn SGK', ok: f.declared },
  ];
}

export function gatePassed(checks: GateCheck[]): boolean {
  return checks.every((c) => c.ok);
}

/* ------------------------------ Chuyển đổi ------------------------------ */

export function buildPack(f: PackForm, status: 'published' | 'draft', id?: string): LearningPack {
  return {
    id: id ?? uid('pk'),
    subjectId: f.subjectId,
    grade: 10,
    title: f.title.trim(),
    unit: f.unit.trim() || 'Chủ đề mới',
    author: 'Giáo viên (demo)',
    status,
    updatedAt: todayISO(),
    objectives: parseObjectives(f.objectives),
    core: parseCore(f.core),
    examples: parseExamples(f.examples),
    exercises: parseExercises(f.exercises),
    quiz: parseQuiz(f.quiz).items,
    resources: f.resources
      .filter((r) => r.title.trim())
      .map((r) => ({
        id: r.id,
        title: r.title.trim(),
        type: r.type,
        license: r.license,
        proof: r.proof.trim() || undefined,
      })),
  };
}

export function packToForm(p: LearningPack): PackForm {
  return {
    subjectId: p.subjectId,
    title: p.title,
    unit: p.unit,
    objectives: p.objectives.join('\n'),
    core: p.core.map((b) => [`# ${b.heading}`, ...b.points].join('\n')).join('\n'),
    examples: p.examples.map((e) => `${e.problem} || ${e.solution}`).join('\n'),
    exercises: p.exercises.map((e) => `${e.q} || ${e.answer}`).join('\n'),
    quiz: p.quiz
      .map((q) => `${q.q} | ${q.options.join(' | ')} | ${String.fromCharCode(65 + q.answer)}`)
      .join('\n'),
    resources: p.resources.map((r) => ({ id: r.id, title: r.title, type: r.type, license: r.license, proof: r.proof ?? '' })),
    declared: false,
  };
}
