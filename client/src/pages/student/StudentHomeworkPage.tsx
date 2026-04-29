import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Homework } from '../../types';

export default function StudentHomeworkPage() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    api.get<Homework[]>('/homework').then(r => { setHomework(r.data); setLoading(false); });
  }, []);

  const toggle = async (id: number, completed: boolean) => {
    setToggling(id);
    try {
      await api.patch(`/homework/${id}/complete`, { completed: !completed });
      setHomework(prev => prev.map(h => h.id === id ? { ...h, completed: !completed } : h));
    } finally {
      setToggling(null);
    }
  };

  const pending = homework.filter(h => !h.completed);
  const done = homework.filter(h => h.completed);
  const isPast = (date: string) => new Date(date) < new Date();

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Домашние задания</h1>
      <p className="text-gray-500 mb-6">
        Выполнено: {done.length} из {homework.length}
      </p>

      {homework.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-gray-500">Заданий нет! Отдыхай</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">
                Не выполнено ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map(h => (
                  <HomeworkCard key={h.id} hw={h} toggling={toggling === h.id} onToggle={toggle} isPast={isPast(h.dueDate)} />
                ))}
              </div>
            </div>
          )}
          {done.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">
                Выполнено ({done.length})
              </h2>
              <div className="space-y-3">
                {done.map(h => (
                  <HomeworkCard key={h.id} hw={h} toggling={toggling === h.id} onToggle={toggle} isPast={false} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function HomeworkCard({ hw, toggling, onToggle, isPast }: {
  hw: Homework;
  toggling: boolean;
  onToggle: (id: number, completed: boolean) => void;
  isPast: boolean;
}) {
  return (
    <div className={`card flex items-start gap-4 py-4 transition-opacity ${hw.completed ? 'opacity-70' : ''}`}>
      <button
        onClick={() => onToggle(hw.id, hw.completed || false)}
        disabled={toggling}
        className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          hw.completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-pink-300 hover:border-pink-500'
        }`}
      >
        {hw.completed && '✓'}
      </button>
      <div className="flex-1">
        <p className={`font-semibold text-gray-800 ${hw.completed ? 'line-through text-gray-400' : ''}`}>
          {hw.title}
        </p>
        {hw.description && <p className="text-sm text-gray-500 mt-1">{hw.description}</p>}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span>📅 до {new Date(hw.dueDate).toLocaleDateString('ru-RU')}</span>
          {isPast && !hw.completed && <span className="text-red-400">⚠ Просрочено</span>}
          {hw.completed && hw.completedAt && (
            <span className="text-green-500">
              ✅ Выполнено {new Date(hw.completedAt).toLocaleDateString('ru-RU')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return <div className="flex justify-center mt-20"><div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" /></div>;
}
