import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: number;
  nama: string;
  no_hp: string;
  email: string;
  avatar: string;
  user_id: string;
  id_role: number[];
  id_lembaga_pendidikan?: string | null;
  lembaga_pendidikan?: string | null;
  kode_prov?: string | null;
  kode_kab?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  hasLogin: () => boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setProfile: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hasLogin: () => !!get().accessToken && !!get().user,

      // set semua data ketika login berhasil
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),

      // update accessToken ketika refresh berhasil
      setAccessToken: (accessToken) => set({ accessToken }),

      // update profile user tanpa sentuh token
      setProfile: (user) => set({ user }),

      // alias lebih semantik untuk clearAuth
      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null });
        localStorage.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage", // localStorage key
    },
  ),
);
