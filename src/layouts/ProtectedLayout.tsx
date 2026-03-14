import { useAuthStore } from "@/stores/authStore";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = useAuthStore((state) => state.accessToken);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
