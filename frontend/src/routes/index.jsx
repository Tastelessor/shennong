import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AgentLayout } from '../layouts/AgentLayout';
import { Home } from '../pages/Home';
import { AdminDashboard } from '../pages/AdminDashboard';
import { AgentDashboard } from '../pages/AgentDashboard';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
    ],
  },
  {
    path: '/agent',
    element: (
      <ProtectedRoute requiredRole="agent">
        <AgentLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AgentDashboard /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);