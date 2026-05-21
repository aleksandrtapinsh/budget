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
    <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
      <span style={{ fontWeight: 700, fontSize: '1.1rem', marginRight: 'auto' }}>BudgetApp</span>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/planner">Planner</Link>
      <Link to="/transactions">Transactions</Link>
      {user && (
        <>
          <span style={{ color: '#6b7280' }}>{user.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </nav>
  );
}
