import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Grade } from '../../types';

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Grade[]>('/grades').then(r => { setGrades(r.data); setLoading(false); });
  }, []);

  const subjects = [...new Set(grades.map(g => g.subject))];
  const avg = grades.length
    ? (grades.reduce((s, g) => s + g.grade, 0) / grades.length).toFixed(1)
    : null;

  const subjectAvg = (subject: string) => {
    const sg = grades.filter(g => g.subject === subject);
    return (sg.reduce((s, g) => s + g.grade, 0) / sg.length).toFixed(1);
  };

  const gradeColor = (g: number) => {
    if (g >= 5) return 'bg-green-100 text-green-700 border-green-200';
    if (g >= 4) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (g >= 3) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Мои результаты</h1>

      {grades.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-gray-500">Оценок пока нет</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="card text-center">
              <p className="text-4xl font-bold text-pink-500">{avg}</p>
              <p className="text-gray-500 text-sm mt-1">Средний балл</p>
            </div>
            <div className="card text-center">
              <p className="text-4xl font-bold text-gray-800">{grades.length}</p>
              <p className="text-gray-500 text-sm mt-1">Всего оценок</p>
            </div>
            <div className="card text-center">
              <p className="text-4xl font-bold text-gray-800">{subjects.length}</p>
              <p className="text-gray-500 text-sm mt-1">Предметов</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="font-semibold text-gray-700 mb-4">По предметам</h2>
              <div className="space-y-3">
                {subjects.map(subject => {
                  const sg = grades.filter(g => g.subject === subject);
                  const sAvg = parseFloat(subjectAvg(subject));
                  return (
                    <div key={subject} className="card py-3">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold text-gray-800">{subject}</p>
                        <span className={`px-2.5 py-0.5 rounded-full text-sm font-bold border ${gradeColor(sAvg)}`}>
                          {subjectAvg(subject)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {sg.map(g => (
                          <span key={g.id} className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold border ${gradeColor(g.grade)}`}>
                            {g.grade}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-gray-700 mb-4">История оценок</h2>
              <div className="space-y-2">
                {grades.map(g => (
                  <div key={g.id} className="card flex items-center gap-3 py-3">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center font-bold border ${gradeColor(g.grade)}`}>
                      {g.grade}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{g.subject}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(g.date).toLocaleDateString('ru-RU')}
                        {g.comment && ` · ${g.comment}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="flex justify-center mt-20"><div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" /></div>;
}
