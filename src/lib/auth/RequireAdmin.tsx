import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

interface RequireAdminProps {
  children: React.ReactNode;
}

const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#FF69B4] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: window.location.pathname }} replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/admin/login" state={{ from: window.location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default RequireAdmin;
