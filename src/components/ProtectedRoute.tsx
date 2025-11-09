import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { adminService } from '@/services/adminService';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();

  // Check if this is an admin route
  const isAdminRoute = location.pathname === '/admin' || requireAdmin;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-background' : 'bg-background'}`}>
        <div className="flex flex-col items-center gap-6">
          <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <div className={`text-sm ${theme === 'dark' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If admin route, check admin status
  if (isAdminRoute && !adminService.isAdmin(user.email)) {
    // Don't show toast here as AdminDashboard will handle it
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;


