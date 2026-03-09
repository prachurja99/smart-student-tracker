import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, GraduationCap, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColor = {
    admin: 'bg-red-100 text-red-700',
    teacher: 'bg-green-100 text-green-700',
    student: 'bg-blue-100 text-blue-700',
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-blue-600" size={28} />
            <span className="text-xl font-bold text-gray-800">
              Smart Student Tracker
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${roleColor[user?.role]}`}>
                {user?.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition"
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