import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Homework, Schedule, Grade } from '../../types';

export default function StudentHome() {
  const { user } = useAuth();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    api.get<Homework[]>('/homework').then(r => setHomework(r.data));
    api.get<Schedule[]>('/schedule').then(r => setSchedule(r.data));
    api.get<Grade[]>('/grades').then(r => setGrades(r.data));
  }, []);

  const today = new Date().getDay() || 7;
  const todaySchedule = schedule.filter(s => s.dayOfWeek === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const pending = homework.filter(h => !h.completed);
  const completed = homework.filter(h => h.completed);

  const avg = grades.length
    ? (grades.reduce((s, g) => s + g.grade, 0) / grades.length).toFixed(1)
    : '—';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        Привет, {user?.name?.split(' ')[0]}! 👋
      </h1>
      <p className="text-gray-500 mb-8">Вот твой учебный день</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Заданий выполнено" value={`${completed.length}/${homework.length}`} icon="✅" color="green" to="/homework" />
        <StatCard label="Занятий сегодня" value={String(todaySchedule.length)} icon="📅" color="pink" to="/schedule" />
        <StatCard label="Средний балл" value={avg} icon="🏆" color="purple" to="/grades" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">📅 Сегодняшние занятия</h2>
          {todaySchedule.length === 0 ? (
            <p className="text-gray-400 text-sm">Нет занятий сегодня 🎉</p>
          ) : (
            <div className="space-y-2">
              {todaySchedule.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
                  <span className="text-pink-400 font-mono text-xs">{s.startTime}–{s.endTime}</span>
                  <span className="font-medium text-gray-700">{s.subject}</span>
                  {s.room && <span className="text-gray-400 text-xs">каб. {s.room}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">📝 Невыполненные задания</h2>
          {pending.length === 0 ? (
            <p className="text-gray-400 text-sm">Все задания выполнены! 🎉</p>
          ) : (
            <div className="space-y-2">
              {pending.slice(0, 4).map(h => (
                <div key={h.id} className="p-3 bg-amber-50 rounded-xl">
                  <p className="font-medium text-gray-700 text-sm">{h.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    до {new Date(h.dueDate).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              ))}
              {pending.length > 4 && (
                <Link to="/homework" className="text-pink-500 text-sm hover:underline">
                  Ещё {pending.length - 4} заданий →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, to }: {
  label: string; value: string; icon: string; color: string; to: string;
}) {
  const colors: Record<string, string> = {
    green: 'from-green-400 to-green-600',
    pink: 'from-pink-400 to-pink-600',
    purple: 'from-purple-400 to-purple-600',
  };
  return (
    <Link to={to} className="card hover:shadow-md transition-shadow cursor-pointer">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-2xl mb-4`}>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </Link>
  );
}
