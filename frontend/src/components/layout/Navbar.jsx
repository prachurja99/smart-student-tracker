import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, GraduationCap, User, Sun, Moon } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColor = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    teacher: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    student: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-blue-600" size={28} />
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              Smart Student Tracker
            </span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />

            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="flex items-center gap-2">
              <User size={18} className="text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${roleColor[user?.role]}`}>
                {user?.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;