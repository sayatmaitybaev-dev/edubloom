import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const teacherNav: NavItem[] = [
  { to: '/', label: 'Главная', icon: '🏠' },
  { to: '/students', label: 'Ученики', icon: '🎒' },
  { to: '/schedule', label: 'Расписание', icon: '📅' },
  { to: '/homework', label: 'Домашние задания', icon: '📝' },
  { to: '/grades', label: 'Успеваемость', icon: '📊' },
];

const studentNav: NavItem[] = [
  { to: '/', label: 'Главная', icon: '🏠' },
  { to: '/schedule', label: 'Расписание', icon: '📅' },
  { to: '/homework', label: 'Домашние задания', icon: '📝' },
  { to: '/grades', label: 'Мои результаты', icon: '🏆' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const nav = user?.role === 'teacher' ? teacherNav : studentNav;

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-pink-100 flex flex-col shadow-sm">
      <div className="p-6 border-b border-pink-100">
        <Logo size="md" />
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-pink-100">
        <div className="mb-3 px-3">
          <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
          <p className="text-xs text-gray-400">{user?.role === 'teacher' ? 'Преподаватель' : 'Ученик'}</p>
        </div>
        <button onClick={logout} className="btn-secondary w-full text-sm">
          Выйти
        </button>
      </div>
    </aside>
  );
}
