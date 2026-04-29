import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Grade, Student } from '../../types';

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ studentId: '', subject: '', grade: '5', comment: '' });
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const [g, s] = await Promise.all([
      api.get<Grade[]>('/grades'),
      api.get<Student[]>('/students'),
    ]);
    setGrades(g.data);
    setStudents(s.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addGrade = async () => {
    if (!form.studentId || !form.subject) return;
    await api.post('/grades', {
      studentId: parseInt(form.studentId),
      subject: form.subject,
      grade: parseInt(form.grade),
      comment: form.comment || undefined,
    });
    setForm({ studentId: '', subject: '', grade: '5', comment: '' });
    setShowForm(false);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить оценку?')) return;
    await api.delete(`/grades/${id}`);
    setGrades(prev => prev.filter(g => g.id !== id));
  };

  const filtered = selectedStudent
    ? grades.filter(g => g.studentId === parseInt(selectedStudent))
    : grades;

  const gradeColor = (g: number) => {
    if (g >= 5) return 'bg-green-100 text-green-700';
    if (g >= 4) return 'bg-blue-100 text-blue-700';
    if (g >= 3) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Успеваемость</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Поставить оценку</button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Новая оценка</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Ученик</label>
              <select className="input" value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}>
                <option value="">Выберите ученика</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Предмет</label>
              <input className="input" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Математика" />
            </div>
            <div>
              <label className="label">Оценка</label>
              <select className="input" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}>
                {[5, 4, 3, 2, 1].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Комментарий (опционально)</label>
              <input className="input" value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} placeholder="Отличная работа!" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn-primary" onClick={addGrade}>Сохранить</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Отмена</button>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="flex items-center gap-3">
          <label className="label mb-0 whitespace-nowrap">Фильтр по ученику:</label>
          <select className="input max-w-xs" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
            <option value="">Все ученики</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-gray-500">Нет оценок. Добавьте первую!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(g => (
            <div key={g.id} className="card flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${gradeColor(g.grade)}`}>
                  {g.grade}
                </span>
                <div>
                  <p className="font-semibold text-gray-800">{g.subject}</p>
                  <p className="text-xs text-gray-400">
                    {g.student?.user.name} · {new Date(g.date).toLocaleDateString('ru-RU')}
                    {g.comment && ` · ${g.comment}`}
                  </p>
                </div>
              </div>
              <button className="btn-danger text-sm py-1.5 px-3" onClick={() => remove(g.id)}>Удалить</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="flex justify-center mt-20"><div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" /></div>;
}
