import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Student, Homework, Schedule } from '../../types';

export default function TeacherHome() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [schedule, setSchedule] = useState<Schedule[]>([]);

  useEffect(() => {
    api.get<Student[]>('/students').then(r => setStudents(r.data));
    api.get<Homework[]>('/homework').then(r => setHomework(r.data));
    api.get<Schedule[]>('/schedule').then(r => setSchedule(r.data));
  }, []);

  const today = new Date().getDay() || 7;
  const todaySchedule = schedule.filter(s => s.dayOfWeek === today);
  const pendingHw = homework.filter(h => new Date(h.dueDate) >= new Date()).slice(0, 3);

  const days = ['', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        Добро пожаловать, {user?.name?.split(' ')[0]}! 👋
      </h1>
      <p className="text-gray-500 mb-8">Вот краткая сводка на сегодня</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Учеников" value={students.length} icon="🎒" color="pink" to="/students" />
        <StatCard label="Занятий сегодня" value={todaySchedule.length} icon="📅" color="purple" to="/schedule" />
        <StatCard label="Активных заданий" value={homework.length} icon="📝" color="amber" to="/homework" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            📅 Расписание на сегодня
            <span className="text-xs text-gray-400 font-normal">({days[today]})</span>
          </h2>
          {todaySchedule.length === 0 ? (
            <p className="text-gray-400 text-sm">Нет занятий сегодня</p>
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
          <h2 className="font-semibold text-gray-700 mb-4">📝 Ближайшие задания</h2>
          {pendingHw.length === 0 ? (
            <p className="text-gray-400 text-sm">Нет активных заданий</p>
          ) : (
            <div className="space-y-2">
              {pendingHw.map(h => (
                <div key={h.id} className="p-3 bg-pink-50 rounded-xl">
                  <p className="font-medium text-gray-700 text-sm">{h.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    до {new Date(h.dueDate).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, to }: {
  label: string; value: number; icon: string; color: string; to: string;
}) {
  const colors: Record<string, string> = {
    pink: 'from-pink-400 to-pink-600',
    purple: 'from-purple-400 to-purple-600',
    amber: 'from-amber-400 to-amber-600',
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
