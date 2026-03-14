import { z } from "zod";

export interface ILogPerubahanRekening {
  id?: number;

  id_trx_pks?: number | null;
  id_mahasiswa?: number | null;

  nama_bank_sebelumnya?: string | null;
  nama_bank_pengganti?: string | null;

  kode_bank_sebelumnya?: string | null;
  kode_bank_pengganti?: string | null;

  nomor_rekening_sebelumnya?: string | null;
  nomor_rekening_pengganti?: string | null;

  nama_rekening_sebelumnya?: string | null;
  nama_rekening_pengganti?: string | null;

  scan_buku_tabungan_sebelumnya?: string | null;
  scan_buku_tabungan_pengganti?: string | null;

  status?: string | null;
  catatan?: string | null;

  created_by?: string | null;
  created_at?: string | null;

  verified_by?: string | null;
  verified_at?: string | null;
}

export interface CreateLogPerubahanRekening {
  id_mahasiswa: number;
  id_trx_pks: number;

  nama_bank?: string;
  nomor_rekening?: string;
  nama_rekening?: string;

  scan_buku_tabungan?: File;
}

export const verifikasiRekeningSchema = z
  .object({
    status: z.enum(["Disetujui", "Ditolak"]),
    catatan: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status === "Ditolak") {
        return data.catatan && data.catatan.trim().length > 0;
      }
      return true;
    },
    {
      message: "Catatan wajib diisi jika menolak.",
      path: ["catatan"],
    },
  );

export type VerifikasiRekeningFormData = z.infer<
  typeof verifikasiRekeningSchema
>;

export interface ILogPerubahanStatusAktif {
  id?: number;

  id_trx_pks?: number | null;
  id_mahasiswa?: number | null;

  status_aktif_sebelumnya?: number | null;
  status_aktif_pengganti?: number | null;

  alasan_tidak_aktif_sebelumnya?: string | null;
  alasan_tidak_aktif_pengganti?: string | null;

  keterangan_tidak_aktif_sebelumnya?: string | null;
  keterangan_tidak_aktif_pengganti?: string | null;

  file_pendukung_sebelumnya?: string | null;
  file_pendukung_pengganti?: string | null;

  status?: "Pending" | "Ditolak" | "Disetujui" | null;
  catatan?: string | null;

  created_by?: string | null;
  verified_by?: string | null;

  created_at?: string | null;
  verified_at?: string | null;
}

export const verifikasiStatusAktifSchema = z
  .object({
    status: z.enum(["Disetujui", "Ditolak"]),
    catatan: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status === "Ditolak") {
        return data.catatan && data.catatan.trim().length > 0;
      }
      return true;
    },
    {
      message: "Catatan wajib diisi jika menolak.",
      path: ["catatan"],
    },
  );

export type VerifikasiStatusAktifFormData = z.infer<
  typeof verifikasiStatusAktifSchema
>;

export interface ILogPerubahanIpk {
  id?: number;

  id_trx_pks?: number | null;
  id_mahasiswa?: number | null;

  // Semester 1
  ipk_s1_sebelumnya?: number | null;
  ipk_s1_pengganti?: number | null;

  // Semester 2
  ipk_s2_sebelumnya?: number | null;
  ipk_s2_pengganti?: number | null;

  // Semester 3
  ipk_s3_sebelumnya?: number | null;
  ipk_s3_pengganti?: number | null;

  // Semester 4
  ipk_s4_sebelumnya?: number | null;
  ipk_s4_pengganti?: number | null;

  // Semester 5
  ipk_s5_sebelumnya?: number | null;
  ipk_s5_pengganti?: number | null;

  // Semester 6
  ipk_s6_sebelumnya?: number | null;
  ipk_s6_pengganti?: number | null;

  // Semester 7
  ipk_s7_sebelumnya?: number | null;
  ipk_s7_pengganti?: number | null;

  // Semester 8
  ipk_s8_sebelumnya?: number | null;
  ipk_s8_pengganti?: number | null;

  status?: "Pending" | "Ditolak" | "Disetujui" | null;
  catatan?: string | null;

  created_by?: string | null;
  verified_by?: string | null;

  created_at?: string | null;
  verified_at?: string | null;
}

export const verifikasiPerubahanIpkSchema = z
  .object({
    status: z.enum(["Disetujui", "Ditolak"]),
    catatan: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status === "Ditolak") {
        return data.catatan && data.catatan.trim().length > 0;
      }
      return true;
    },
    {
      message: "Catatan wajib diisi jika menolak.",
      path: ["catatan"],
    },
  );

export type VerifikasiPerubahanIpkFormData = z.infer<
  typeof verifikasiPerubahanIpkSchema
>;

export interface ILogPerubahanProfilLembaga {
  id: number;
  id_lembaga_pendidikan?: number | null;

  logo_sebelumnya?: string | null;
  logo_pengganti?: string | null;

  nama_sebelumnya?: string | null;
  nama_pengganti?: string | null;

  kode_sebelumnya?: string | null;
  kode_pengganti?: string | null;

  singkatan_sebelumnya?: string | null;
  singkatan_pengganti?: string | null;

  jenis_sebelumnya?: string | null;
  jenis_pengganti?: string | null;

  alamat_sebelumnya?: string | null;
  alamat_pengganti?: string | null;

  kota_sebelumnya?: string | null;
  kota_pengganti?: string | null;

  kode_pos_sebelumnya?: string | null;
  kode_pos_pengganti?: string | null;

  no_telepon_sebelumnya?: string | null;
  no_telepon_pengganti?: string | null;

  fax_sebelumnya?: string | null;
  fax_pengganti?: string | null;

  email_sebelumnya?: string | null;
  email_pengganti?: string | null;

  website_sebelumnya?: string | null;
  website_pengganti?: string | null;

  nama_pimpinan_sebelumnya?: string | null;
  nama_pimpinan_pengganti?: string | null;

  no_telepon_pimpinan_sebelumnya?: string | null;
  no_telepon_pimpinan_pengganti?: string | null;

  jabatan_pimpinan_sebelumnya?: string | null;
  jabatan_pimpinan_pengganti?: string | null;

  no_rekening_sebelumnya?: string | null;
  no_rekening_pengganti?: string | null;

  nama_bank_sebelumnya?: string | null;
  nama_bank_pengganti?: string | null;

  penerima_transfer_sebelumnya?: string | null;
  penerima_transfer_pengganti?: string | null;

  npwp_sebelumnya?: string | null;
  npwp_pengganti?: string | null;

  status?: "Pending" | "Ditolak" | "Disetujui" | null;
  catatan?: string | null;

  created_by?: string | null;
  verified_by?: string | null;

  created_at?: string | null;
  verified_at?: string | null;
}

export const verifikasiPtSchema = z
  .object({
    status: z.enum(["Disetujui", "Ditolak"]),
    catatan: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status === "Ditolak") {
        return data.catatan && data.catatan.trim().length > 0;
      }
      return true;
    },
    {
      message: "Catatan wajib diisi jika menolak.",
      path: ["catatan"],
    },
  );

export type VerifikasiPtFormData = z.infer<typeof verifikasiPtSchema>;
