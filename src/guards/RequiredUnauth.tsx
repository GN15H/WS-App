
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RequireUnauth = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/rooms" replace />;
  }

  return <Outlet />;
};

