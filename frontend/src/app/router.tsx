import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { PublicMenuPage } from '../features/public-menu/pages/PublicMenuPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { AdminLayout } from '../layouts/AdminLayout';
import { DashboardOverviewPage } from '../features/admin-dashboard/pages/DashboardOverviewPage';
import { FoodManagementPage } from '../features/food-management/pages/FoodManagementPage';
import { CategoryManagementPage } from '../features/category-management/pages/CategoryManagementPage';
import { RestaurantSettingsPage } from '../features/restaurant-settings/pages/RestaurantSettingsPage';
import { QRManagementPage } from '../features/qr-management/pages/QRManagementPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c0d12] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Customer Menu */}
        <Route path="/menu" element={<PublicMenuPage />} />
        <Route path="/" element={<Navigate to="/menu" replace />} />

        {/* Owner Authentication */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Owner Administration Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverviewPage />} />
          <Route path="foods" element={<FoodManagementPage />} />
          <Route path="categories" element={<CategoryManagementPage />} />
          <Route path="restaurant" element={<RestaurantSettingsPage />} />
          <Route path="qr" element={<QRManagementPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
