import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Homework, Student } from '../../types';

interface FormState {
  title: string;
  description: string;
  dueDate: string;
  studentIds: number[];
}

const emptyForm: FormState = { title: '', description: '', dueDate: '', studentIds: [] };

export default function HomeworkPage() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [hw, st] = await Promise.all([
      api.get<Homework[]>('/homework'),
      api.get<Student[]>('/students'),
    ]);
    setHomework(hw.data);
    setStudents(st.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.title || !form.dueDate) return;
    if (editId) {
      await api.put(`/homework/${editId}`, form);
    } else {
      await api.post('/homework', form);
    }
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить задание?')) return;
    await api.delete(`/homework/${id}`);
    setHomework(prev => prev.filter(h => h.id !== id));
  };

  const startEdit = (h: Homework) => {
    setForm({
      title: h.title,
      description: h.description || '',
      dueDate: h.dueDate.slice(0, 10),
      studentIds: [],
    });
    setEditId(h.id);
    setShowForm(true);
  };

  const toggleStudent = (id: number) => {
    setForm(f => ({
      ...f,
      studentIds: f.studentIds.includes(id)
        ? f.studentIds.filter(s => s !== id)
        : [...f.studentIds, id],
    }));
  };

  const isPast = (date: string) => new Date(date) < new Date();

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Домашние задания</h1>
        <button className="btn-primary" onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}>
          + Добавить задание
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">{editId ? 'Редактировать задание' : 'Новое задание'}</h2>
          <div className="grid gap-4">
            <div>
              <label className="label">Название</label>
              <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Решить задачи 1-5" />
            </div>
            <div>
              <label className="label">Описание (опционально)</label>
              <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Подробное описание задания..." />
            </div>
            <div>
              <label className="label">Срок сдачи</label>
              <input className="input max-w-xs" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            {students.length > 0 && (
              <div>
                <label className="label">Назначить ученикам</label>
                <div className="flex flex-wrap gap-2">
                  {students.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleStudent(s.id)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        form.studentIds.includes(s.id)
                          ? 'bg-pink-500 text-white border-pink-500'
                          : 'bg-white text-gray-600 border-pink-200 hover:border-pink-400'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-5">
            <button className="btn-primary" onClick={submit}>Сохранить</button>
            <button className="btn-secondary" onClick={() => { setShowForm(false); setEditId(null); }}>Отмена</button>
          </div>
        </div>
      )}

      {homework.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-gray-500">Нет заданий. Добавьте первое!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {homework.map(h => {
            const past = isPast(h.dueDate);
            const doneCount = h.students?.filter(s => s.completed).length || 0;
            const total = h.students?.length || 0;
            return (
              <div key={h.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{h.title}</h3>
                      {past ? (
                        <span className="badge-pending">Просрочено</span>
                      ) : (
                        <span className="badge-done">Активно</span>
                      )}
                    </div>
                    {h.description && <p className="text-sm text-gray-500 mb-2">{h.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>📅 до {new Date(h.dueDate).toLocaleDateString('ru-RU')}</span>
                      {total > 0 && <span>✅ {doneCount}/{total} выполнено</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => startEdit(h)}>Изменить</button>
                    <button className="btn-danger text-sm py-1.5 px-3" onClick={() => remove(h.id)}>Удалить</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="flex justify-center mt-20"><div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" /></div>;
}
