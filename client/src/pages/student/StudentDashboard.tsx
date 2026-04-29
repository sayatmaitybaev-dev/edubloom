import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import StudentHome from './StudentHome';
import StudentSchedulePage from './StudentSchedulePage';
import StudentHomeworkPage from './StudentHomeworkPage';
import StudentGradesPage from './StudentGradesPage';

export default function StudentDashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<StudentHome />} />
        <Route path="/schedule" element={<StudentSchedulePage />} />
        <Route path="/homework" element={<StudentHomeworkPage />} />
        <Route path="/grades" element={<StudentGradesPage />} />
      </Routes>
    </Layout>
  );
}
