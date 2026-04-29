import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Student } from '../../types';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  const load = () => api.get<Student[]>('/students').then(r => { setStudents(r.data); setLoading(false); });

  useEffect(() => { load(); }, []);

  const addStudent = async () => {
    if (!userId) return;
    setError('');
    setAdding(true);
    try {
      await api.post('/students', { userId: parseInt(userId) });
      setUserId('');
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || 'Ошибка добавления');
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить ученика?')) return;
    await api.delete(`/students/${id}`);
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Мои ученики</h1>

      <div className="card mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">Добавить ученика</h2>
        <p className="text-sm text-gray-400 mb-3">
          Ученик должен сначала зарегистрироваться. Введите его ID (отображается в профиле).
        </p>
        <div className="flex gap-3">
          <input
            className="input max-w-xs"
            type="number"
            placeholder="ID ученика"
            value={userId}
            onChange={e => setUserId(e.target.value)}
          />
          <button className="btn-primary" onClick={addStudent} disabled={adding}>
            {adding ? 'Добавление...' : 'Добавить'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {students.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🎒</p>
          <p className="text-gray-500">Пока нет учеников. Добавьте первого!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {students.map(s => (
            <div key={s.id} className="card flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-300 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  {s.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.email || s.phone} · ID: {s.userId}</p>
                </div>
              </div>
              <button className="btn-danger" onClick={() => remove(s.id)}>Удалить</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center mt-20">
      <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );
}
