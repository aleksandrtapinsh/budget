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
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6">
      <Link to="/calendar" className="font-bold text-lg text-indigo-600 mr-auto hover:text-indigo-500 transition-colors">Bad Budget</Link>
      <Link to="/dashboard" className="text-sm text-gray-600 hover:text-indigo-600">Dashboard</Link>
      <Link to="/transactions" className="text-sm text-gray-600 hover:text-indigo-600">Transactions</Link>
      {user && (
        <>
          <span className="text-sm text-gray-500">{user.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md"
          >
            Logout
          </button>
        </>
      )}
    </nav>
  );
}
