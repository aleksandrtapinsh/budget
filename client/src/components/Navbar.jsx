import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center gap-6">
      <Link to="/calendar" className="font-bold text-lg text-emerald-500 mr-auto hover:text-emerald-400 transition-colors">Bad Budget</Link>
      <Link to="/dashboard" className="text-sm text-gray-400 hover:text-emerald-400">Dashboard</Link>
      <Link to="/transactions" className="text-sm text-gray-400 hover:text-emerald-400">Transactions</Link>
      {user && (
        <>
          <span className="text-sm text-gray-500">{user.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-md"
          >
            Logout
          </button>
        </>
      )}
    </nav>
  );
}
