import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [useEmail, setUseEmail] = useState(true);
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        name,
        ...(useEmail ? { email: identifier } : { phone: identifier }),
        password,
        role,
      });
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg.includes('409') ? 'Пользователь уже зарегистрирован' : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-rose-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" />
          <p className="text-gray-500 mt-2 text-sm">Образовательная платформа для школ</p>
        </div>

        <div className="card">
          <h1 className="text-xl font-bold text-gray-800 mb-6">Создать аккаунт</h1>

          <div className="flex rounded-xl overflow-hidden border border-pink-200 mb-5">
            <button
              type="button"
              onClick={() => setUseEmail(true)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${useEmail ? 'bg-pink-500 text-white' : 'bg-white text-gray-500 hover:bg-pink-50'}`}
            >
              E-mail
            </button>
            <button
              type="button"
              onClick={() => setUseEmail(false)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${!useEmail ? 'bg-pink-500 text-white' : 'bg-white text-gray-500 hover:bg-pink-50'}`}
            >
              Телефон
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Полное имя</label>
              <input
                className="input"
                type="text"
                placeholder="Иванова Мария Ивановна"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">{useEmail ? 'E-mail' : 'Номер телефона'}</label>
              <input
                className="input"
                type={useEmail ? 'email' : 'tel'}
                placeholder={useEmail ? 'example@mail.ru' : '+7 999 000 00 00'}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Пароль</label>
              <input
                className="input"
                type="password"
                placeholder="Минимум 6 символов"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="label">Роль</label>
              <div className="flex gap-3">
                {(['student', 'teacher'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      role === r
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-white text-gray-600 border-pink-200 hover:border-pink-400'
                    }`}
                  >
                    {r === 'student' ? '🎒 Ученик' : '👩‍🏫 Преподаватель'}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-pink-500 font-medium hover:text-pink-700">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
