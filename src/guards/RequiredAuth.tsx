import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RequireAuth = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

