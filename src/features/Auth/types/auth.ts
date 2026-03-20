import type { IUser } from "@/features/user/types/user";
import type { IMenu } from "@/types/menu";
import { z } from "zod";

export interface LoginRequest {
  user_id: string;
  pin: string;
  jenis_akun: "instansi" | "penerima-beasiswa";
  captchaId?: string;
  answer?: number;
}

export interface RegisterRequest {
  jenis_akun: string;
  nama_lengkap: string;
  email: string;
  no_hp: string;
  id_perguruan_tinggi?: string;
  id_jenjang?: string;
  id_program_studi?: string;
  kode_prov?: string;
  prov?: string;
  kode_kab?: string;
  kabkota?: string;

  username?: string;
  password?: string;
  captchaId?: string;
  answer?: number;

  // Tambahan untuk file
  surat_penunjukan?: File;
}

export interface LoginResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
  menus: IMenu[];
  redirectPage: string;
}

export interface RegisterResponse {
  user_id: string;
  pin: string;
}

// Profile interface dari API
export interface IProfile {
  id: number;
  nama: string;
  avatar?: string;
  user_id: string;
  no_hp: string;
  email: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png"];

export const profileSchema = z
  .object({
    nama: z.string().min(1, "Nama wajib diisi"),
    user_id: z.string().optional(),

    current_pin: z.string().optional(),

    pin: z.string().min(6, "PIN minimal 6 digit").optional(),

    confirm_pin: z.string().optional(),

    avatar: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
        message: "File terlalu besar (maks 5MB)",
      })
      .refine((file) => !file || ACCEPTED_FILE_TYPES.includes(file.type), {
        message: "Tipe file harus JPEG atau PNG",
      }),
  })
  .refine(
    (data) => {
      // jika user mau ganti PIN
      if (data.pin) {
        return !!data.current_pin;
      }
      return true;
    },
    {
      message: "PIN sekarang wajib diisi",
      path: ["current_pin"],
    },
  )
  .refine(
    (data) => {
      if (data.pin) {
        return data.pin === data.confirm_pin;
      }
      return true;
    },
    {
      message: "Konfirmasi PIN tidak sama",
      path: ["confirm_pin"],
    },
  );

// Form input type
export type ProfileFormData = z.infer<typeof profileSchema>;
