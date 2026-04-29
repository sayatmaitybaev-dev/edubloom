import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [useEmail, setUseEmail] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(useEmail ? { email: identifier, password } : { phone: identifier, password });
      navigate('/');
    } catch {
      setError('Неверный логин или пароль');
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
          <h1 className="text-xl font-bold text-gray-800 mb-6">Вход в аккаунт</h1>

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
                placeholder="Введите пароль"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-pink-500 font-medium hover:text-pink-700">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
