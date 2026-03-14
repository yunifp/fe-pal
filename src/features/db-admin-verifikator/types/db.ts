import { z } from "zod";

export interface PaginatedAdminVerifikatorResponse {
  result: IAdminVerifikator[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export type IAdminVerifikator = {
  id: number | null;
  user_id: string | null;
  is_active: number | null;
  jenis_akun: string | null;
  jabatan: string | null;
  nama_lengkap: string | null;
  no_hp: string | null;
  email: string | null;
  id_lembaga_pendidikan: string;
  lembaga_pendidikan: string;
  surat_penunjukan: string;
  telah_ganti_pin: string | null;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
};

export const adminVerifikatorLpCreateSchema = z.object({
  jenis_akun: z.string().min(1, "Jenis Akun wajib dipilih"),
  jabatan: z.string().min(1, "Jabatan wajib dipilih"),
  lembaga_pendidikan: z.string().min(1, "Lembaga Pendidikan wajib dipilih"),
  nama: z.string().min(1, "Nama Penanggung Jawab wajib diisi"),

  no_hp: z
    .string()
    .min(8, "No. Telepon minimal 8 digit")
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,12}$/, "Format nomor HP tidak valid"),

  email: z.string().email("Format Email tidak valid"),

  surat_penunjukan: z
    .instanceof(File, { message: "Surat penunjukan wajib diupload" })
    .refine((file) => file.size <= 2 * 1024 * 1024, "Ukuran file maksimal 2MB")
    .refine(
      (file) =>
        ["application/pdf", "image/jpeg", "image/png"].includes(file.type),
      "Format file harus PDF / JPG / PNG",
    ),

  is_active: z.number().optional(),
});

export type AdminVerifikatorLpCreateFormData = z.infer<
  typeof adminVerifikatorLpCreateSchema
>;

export const adminVerifikatorLpEditSchema = z.object({
  user_id: z.string().optional(),
  jenis_akun: z.string().min(1, "Jenis Akun wajib dipilih").optional(),
  jabatan: z.string().min(1, "Jabatan wajib dipilih").optional(),
  lembaga_pendidikan: z
    .string()
    .min(1, "Lembaga Pendidikan wajib dipilih")
    .optional(),
  nama: z.string().min(1, "Nama Penanggung Jawab wajib diisi").optional(),

  no_hp: z
    .string()
    .min(8, "No. Telepon minimal 8 digit")
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,12}$/, "Format nomor HP tidak valid")
    .optional(),

  email: z.string().email("Format Email tidak valid").optional(),

  surat_penunjukan: z
    .instanceof(File, { message: "Surat penunjukan harus berupa file" })
    .refine((file) => file.size <= 2 * 1024 * 1024, "Ukuran file maksimal 2MB")
    .refine(
      (file) =>
        ["application/pdf", "image/jpeg", "image/png"].includes(file.type),
      "Format file harus PDF / JPG / PNG",
    )
    .optional(),

  is_active: z.number().optional(),
});

export type AdminVerifikatorLpEditFormData = z.infer<
  typeof adminVerifikatorLpEditSchema
>;
