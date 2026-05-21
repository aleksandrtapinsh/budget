import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { BudgetProvider } from './context/BudgetContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Calendar from './pages/Calendar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BudgetPlanner from './pages/BudgetPlanner.jsx';
import TransactionLog from './pages/TransactionLog.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BudgetProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/planner" element={<BudgetPlanner />} />
              <Route path="/transactions" element={<TransactionLog />} />
            </Route>

            <Route path="*" element={<Navigate to="/calendar" replace />} />
          </Routes>
        </BrowserRouter>
      </BudgetProvider>
    </AuthProvider>
  );
}
