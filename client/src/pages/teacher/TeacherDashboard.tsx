import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import TeacherHome from './TeacherHome';
import StudentsPage from './StudentsPage';
import SchedulePage from './SchedulePage';
import HomeworkPage from './HomeworkPage';
import GradesPage from './GradesPage';

export default function TeacherDashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TeacherHome />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/homework" element={<HomeworkPage />} />
        <Route path="/grades" element={<GradesPage />} />
      </Routes>
    </Layout>
  );
}
