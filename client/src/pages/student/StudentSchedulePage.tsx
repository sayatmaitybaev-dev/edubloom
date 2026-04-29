import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Schedule } from '../../types';

const DAYS = ['', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

export default function StudentSchedulePage() {
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Schedule[]>('/schedule').then(r => { setSchedule(r.data); setLoading(false); });
  }, []);

  const today = new Date().getDay() || 7;

  const grouped = DAYS.slice(1).reduce((acc, _, i) => {
    const day = i + 1;
    acc[day] = schedule.filter(s => s.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<number, Schedule[]>);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Моё расписание</h1>

      {schedule.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-gray-500">Расписание пока не добавлено</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([day, items]) => items.length > 0 && (
            <div key={day}>
              <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${+day === today ? 'text-pink-500' : 'text-gray-400'}`}>
                {DAYS[+day]}
                {+day === today && <span className="badge-done">Сегодня</span>}
              </h2>
              <div className="space-y-2">
                {items.map(s => (
                  <div key={s.id} className={`card flex items-center gap-4 py-3 ${+day === today ? 'border-pink-200 bg-pink-50/50' : ''}`}>
                    <span className="text-pink-400 font-mono text-sm min-w-[90px]">{s.startTime}–{s.endTime}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{s.subject}</p>
                      <p className="text-xs text-gray-400">
                        {s.teacher && `Преп: ${s.teacher.name}`}
                        {s.room && ` · Каб. ${s.room}`}
                      </p>
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
