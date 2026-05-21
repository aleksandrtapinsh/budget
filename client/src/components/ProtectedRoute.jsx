import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Wraps protected pages. Redirects to /login if user is not authenticated.
export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // TODO: while loading (checking localStorage on mount), show a spinner or null
  if (loading) return null;

  // TODO: if no user, redirect to /login
  // If authenticated, render child routes via <Outlet />
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
