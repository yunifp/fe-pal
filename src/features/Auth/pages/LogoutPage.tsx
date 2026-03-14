// LogoutPage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useQueryClient } from "@tanstack/react-query";

const LogoutPage = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    // simpan role dulu sebelum logout
    const isPenerimaBeasiswa = user?.id_role.includes(1);

    // logout & clear cache
    logout();
    queryClient.clear();

    // navigasi setelah logout
    setTimeout(() => {
      if (isPenerimaBeasiswa) {
        navigate("/login", { replace: true });
      } else {
        navigate("/login-instansi", { replace: true });
      }
    }, 0);
  }, [logout, navigate, queryClient]); // jangan taruh user di sini

  return null;
};

export default LogoutPage;
