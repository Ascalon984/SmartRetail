import { createBrowserRouter } from 'react-router-dom';
import { PrivateRoute, PublicRoute } from './RouteGuards';
import MainLayout from '../components/layout/MainLayout';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import POSPage from '../pages/pos/POSPage';
import InventoryPage from '../pages/inventory/InventoryPage';
import SuppliersPage from '../pages/contacts/SuppliersPage';
import ReportsPage from '../pages/reports/ReportsPage';
import TransactionHistoryPage from '../pages/transactions/TransactionHistoryPage';
import SettingsPage from '../pages/settings/SettingsPage';
import StaffPage from '../pages/settings/StaffPage';

const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/pos', element: <POSPage /> },
          { path: '/transactions', element: <TransactionHistoryPage /> },
          { path: '/inventory', element: <InventoryPage /> },
          { path: '/suppliers', element: <SuppliersPage /> },
          { path: '/reports', element: <ReportsPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/staff', element: <StaffPage /> },
        ],
      },
    ],
  },
]);

export default router;
