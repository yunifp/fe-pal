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
  username?: string | null;
  is_active: number | null;
  jenis_akun: string | null;
  jabatan: string | null;
  nama_lengkap: string | null;
  nama?: string | null;
  no_hp: string | null;
  email: string | null;
  kode_prov?: string | null;
  provinsi?: string | null;
  kode_kab?: string | null;
  kabkota?: string | null;
  surat_penunjukan: string;
  telah_ganti_pin: string | null;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
};

// Skema Form Create
export const adminVerifikatorDinasCreateSchema = z
  .object({
    jenis_akun: z.string().min(1, "Jenis Akun wajib dipilih"),
    username: z.string().min(3, "Username minimal 3 karakter"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    nama: z.string().min(3, "Nama Penanggung Jawab wajib diisi"),
    email: z.string().email("Format Email tidak valid"),
    no_hp: z
      .string()
      .min(8, "No. Telepon minimal 8 digit")
      .regex(/^(\+62|62|0)8[1-9][0-9]{6,12}$/, "Format nomor HP tidak valid"),
    provinsi: z.string().optional(),
    kabkota: z.string().optional(),
    surat_penunjukan: z
      .instanceof(File, { message: "Surat penunjukan wajib diupload" })
      .refine((file) => file.size <= 2 * 1024 * 1024, "Ukuran file maksimal 2MB")
      .refine(
        (file) => ["application/pdf", "image/jpeg", "image/png"].includes(file.type),
        "Format file harus PDF / JPG / PNG"
      ),
    is_active: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.jenis_akun === "3" && !data.provinsi) {
      ctx.addIssue({ path: ["provinsi"], code: "custom", message: "Provinsi wajib diisi" });
    } else if (data.jenis_akun === "4") {
      if (!data.provinsi) ctx.addIssue({ path: ["provinsi"], code: "custom", message: "Provinsi wajib diisi" });
      if (!data.kabkota) ctx.addIssue({ path: ["kabkota"], code: "custom", message: "Kabupaten/Kota wajib diisi" });
    }
  });

export type AdminVerifikatorDinasCreateFormData = z.infer<typeof adminVerifikatorDinasCreateSchema>;

// Skema Form Edit
export const adminVerifikatorDinasEditSchema = z
  .object({
    jenis_akun: z.string().min(1, "Jenis Akun wajib dipilih"),
    username: z.string().min(3, "Username minimal 3 karakter"),
    password: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 6, "Password minimal 6 karakter"),
    nama: z.string().min(3, "Nama Penanggung Jawab wajib diisi"),
    email: z.string().email("Format Email tidak valid"),
    no_hp: z
      .string()
      .min(8, "No. Telepon minimal 8 digit")
      .regex(/^(\+62|62|0)8[1-9][0-9]{6,12}$/, "Format nomor HP tidak valid"),
    provinsi: z.string().optional(),
    kabkota: z.string().optional(),
    surat_penunjukan: z
      .instanceof(File, { message: "Surat penunjukan harus berupa file" })
      .refine((file) => file.size <= 2 * 1024 * 1024, "Ukuran file maksimal 2MB")
      .refine(
        (file) => ["application/pdf", "image/jpeg", "image/png"].includes(file.type),
        "Format file harus PDF / JPG / PNG"
      )
      .optional(),
    is_active: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.jenis_akun === "3" && !data.provinsi) {
      ctx.addIssue({ path: ["provinsi"], code: "custom", message: "Provinsi wajib diisi" });
    } else if (data.jenis_akun === "4") {
      if (!data.provinsi) ctx.addIssue({ path: ["provinsi"], code: "custom", message: "Provinsi wajib diisi" });
      if (!data.kabkota) ctx.addIssue({ path: ["kabkota"], code: "custom", message: "Kabupaten/Kota wajib diisi" });
    }
  });

export type AdminVerifikatorDinasEditFormData = z.infer<typeof adminVerifikatorDinasEditSchema>;