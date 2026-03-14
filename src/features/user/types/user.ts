import type { IRole } from "@/features/role/types/role";
import { z } from "zod";

export interface PaginatedUserResponse {
  result: IUser[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export type IUser = {
  id: number;
  user_id: string;
  role: IRole[];
  nama_lengkap: string | null;
  id_lembaga_pendidikan?: string | null;
  lembaga_pendidikan?: string | null;
  avatar: string | null;
  email: string | null;
  no_hp: string | null;
  kode_prov: string | null;
  kode_kab: string | null;
  is_active: number | null;
  created_at: string | null;
  updated_at: string | null;
  jenjang: string | null;
};

// Schema validasi form
export const userCreateSchema = z
  .object({
    nama: z.string().min(1, "Nama wajib diisi"),
    username: z.string().min(1, "Username wajib diisi"),
    is_active: z.number().optional(),
    id_role: z.array(z.number()).min(1, "Pilih minimal satu role"),
    avatar: z
      .instanceof(File)
      .optional()
      .nullable()
      .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
        message: "Ukuran maksimal 5MB",
      }),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirm_password: z
      .string()
      .min(6, "Konfirmasi password minimal 6 karakter"),
    department_id: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Password dan konfirmasi password harus sama",
    path: ["confirm_password"],
  });

export const userEditSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  username: z.string().min(1, "Username wajib diisi"),
  is_active: z.number().optional(),
  id_role: z.array(z.number()).min(1, "Pilih minimal satu role"),
  avatar: z
    .instanceof(File)
    .optional()
    .nullable()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
      message: "Ukuran maksimal 5MB",
    }),
});

// Tipe data form
export type UserCreateFormData = z.infer<typeof userCreateSchema>;

export type UserEditFormData = z.infer<typeof userEditSchema>;

// Untuk kirim data HTTP
export interface UserRequest {
  nama: string;
  username: string;
  is_active: number;
  id_role: number[];
}
