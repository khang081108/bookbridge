import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { useRoute } from './lib/router';
import { useApp } from './lib/store';
import type { Role } from './types';
import Home from './pages/Home';
import About from './pages/About';
import StudentDashboard from './pages/StudentDashboard';
import StudentLearning from './pages/StudentLearning';
import StudentBooks from './pages/StudentBooks';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherPacks from './pages/TeacherPacks';
import AdminDashboard from './pages/AdminDashboard';

function roleOfPath(path: string): Role | null {
  if (path.startsWith('/student')) return 'student';
  if (path.startsWith('/teacher')) return 'teacher';
  if (path.startsWith('/admin')) return 'admin';
  return null;
}

export default function App() {
  const { path, query } = useRoute();
  const { state, actions } = useApp();

  // Mở thẳng một đường dẫn của vai trò khác thì tự đổi vai trò cho khớp.
  useEffect(() => {
    const r = roleOfPath(path);
    if (r && r !== state.role) actions.setRole(r);
  }, [path, state.role, actions]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  let page;
  if (path === '/') page = <Home />;
  else if (path === '/about') page = <About />;
  else if (path === '/student') page = <StudentDashboard />;
  else if (path === '/student/learn') page = <StudentLearning initialSubject={query.get('subject')} />;
  else if (path.startsWith('/student/learn/')) page = <StudentLearning packId={path.slice('/student/learn/'.length)} />;
  else if (path === '/student/books') page = <StudentBooks />;
  else if (path === '/teacher') page = <TeacherDashboard />;
  else if (path === '/teacher/packs') page = <TeacherPacks initialSubject={query.get('subject')} />;
  else if (path === '/admin') page = <AdminDashboard />;
  else
    page = (
      <div className="py-16 text-center">
        <h1 className="font-display text-3xl font-semibold">Không tìm thấy trang</h1>
        <p className="mt-2 text-muted">Hãy quay về trang chủ để chọn lại.</p>
        <a href="#/" className="mt-4 inline-block font-semibold text-brand underline">
          Về trang chủ
        </a>
      </div>
    );

  return <Layout>{page}</Layout>;
}
