import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Schedule, Student } from '../../types';

const DAYS = ['', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

interface FormState {
  subject: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  studentIds: number[];
}

const emptyForm: FormState = { subject: '', dayOfWeek: '1', startTime: '09:00', endTime: '09:45', room: '', studentIds: [] };

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [sc, st] = await Promise.all([
      api.get<Schedule[]>('/schedule'),
      api.get<Student[]>('/students'),
    ]);
    setSchedules(sc.data);
    setStudents(st.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    const data = { ...form, dayOfWeek: parseInt(form.dayOfWeek) };
    if (editId) {
      await api.put(`/schedule/${editId}`, data);
    } else {
      await api.post('/schedule', data);
    }
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
    load();
  };

  const startEdit = (s: Schedule) => {
    setForm({
      subject: s.subject,
      dayOfWeek: String(s.dayOfWeek),
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room || '',
      studentIds: s.students?.map(ss => ss.student.user as unknown as number) || [],
    });
    setEditId(s.id);
    setShowForm(true);
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить занятие?')) return;
    await api.delete(`/schedule/${id}`);
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const toggleStudent = (id: number) => {
    setForm(f => ({
      ...f,
      studentIds: f.studentIds.includes(id)
        ? f.studentIds.filter(s => s !== id)
        : [...f.studentIds, id],
    }));
  };

  const grouped = DAYS.slice(1).reduce((acc, _, i) => {
    const day = i + 1;
    acc[day] = schedules.filter(s => s.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<number, Schedule[]>);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Расписание</h1>
        <button className="btn-primary" onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}>
          + Добавить занятие
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">{editId ? 'Редактировать занятие' : 'Новое занятие'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Предмет</label>
              <input className="input" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Математика" />
            </div>
            <div>
              <label className="label">День недели</label>
              <select className="input" value={form.dayOfWeek} onChange={e => setForm(f => ({ ...f, dayOfWeek: e.target.value }))}>
                {DAYS.slice(1).map((d, i) => <option key={i+1} value={i+1}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Начало</label>
              <input className="input" type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
            </div>
            <div>
              <label className="label">Конец</label>
              <input className="input" type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
            </div>
            <div>
              <label className="label">Кабинет (опционально)</label>
              <input className="input" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} placeholder="101" />
            </div>
          </div>
          {students.length > 0 && (
            <div className="mt-4">
              <label className="label">Ученики</label>
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
          <div className="flex gap-3 mt-5">
            <button className="btn-primary" onClick={submit}>Сохранить</button>
            <button className="btn-secondary" onClick={() => { setShowForm(false); setEditId(null); }}>Отмена</button>
          </div>
        </div>
      )}

      {schedules.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-gray-500">Расписание пусто. Добавьте первое занятие!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([day, items]) => items.length > 0 && (
            <div key={day}>
              <h2 className="text-sm font-semibold text-pink-500 uppercase tracking-wider mb-3">{DAYS[+day]}</h2>
              <div className="space-y-2">
                {items.map(s => (
                  <div key={s.id} className="card flex items-center justify-between py-3">
                    <div className="flex items-center gap-4">
                      <span className="text-pink-400 font-mono text-sm min-w-[90px]">{s.startTime}–{s.endTime}</span>
                      <div>
                        <p className="font-semibold text-gray-800">{s.subject}</p>
                        {s.room && <p className="text-xs text-gray-400">Кабинет {s.room}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => startEdit(s)}>Изменить</button>
                      <button className="btn-danger text-sm py-1.5 px-3" onClick={() => remove(s.id)}>Удалить</button>
                    </div>
                  </div>
                ))}
              </div>
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
