import { z } from "zod";
import type { IMahasiswaPks } from "./pks";

export interface PaginatedBiayaSertifikasiPksResponse {
  result: ITrxBiayaSertifikasiPksWithPks[];
  total: number;
  current_page: number;
  total_pages: number;
}

export const biayaSertifikasiPksCreateSchema = z.object({
  tahun: z
    .number({
      required_error: "Tahun wajib diisi",
      invalid_type_error: "Tahun harus berupa angka",
    })
    .min(1, "Tahun wajib dipilih"),

  jumlah: z.coerce
    .number({
      required_error: "Jumlah biaya sertifikasi wajib diisi",
      invalid_type_error: "Jumlah harus berupa angka",
    })
    .min(1, "Jumlah minimal Rp 1"),
});

export type BiayaSertifikasiPksCreateFormData = z.infer<
  typeof biayaSertifikasiPksCreateSchema
>;

export interface ITrxBiayaSertifikasiPks {
  id: number;
  id_trx_pks: number | null;
  tahun: string | null;
  jumlah: number | null;
  total_mahasiswa: number | null;
  total_mahasiswa_aktif: number | null;
  total_mahasiswa_tidak_aktif: number | null;
  id_status?: number | null;
  status?: string | null;
  status_transfer?: "Y" | "N" | null;
  last_update_lp: string;
  verify_by_lp: string;
  diajukan_ke_verifikator_at: string | null;
  diajukan_ke_verifikator_by: string | null;
}

export interface ITrxBiayaSertifikasiPksWithPks extends ITrxBiayaSertifikasiPks {
  id_sub_status?: number | null;
  sub_status?: string | null;

  no_pks: string | null;
  lembaga_pendidikan: string | null;
  tanggal_pks: string | null;
  jenjang: string | null;

  file_daftar_nominatif: string | null;
  file_salinan_bukti_pengeluaran: string | null;
  file_sptjm: string | null;
  file_bukti_kwitansi: string | null;

  tagihan_tahap_lalu: number | null;
  tagihan_tahap_ini: number | null;
  tagihan_sd_tahap_ini: number | null;
  tagihan_sisa_dana: number | null;

  catatan_verifikator: string | null;
}

export const ajukanKeVerifikatorSchema = z.object({
  id_trx_pks: z.number().optional(),
  tahun: z.string().optional(),
  total_mahasiswa: z.number().optional(),
  total_mahasiswa_aktif: z.number().optional(),
  total_mahasiswa_tidak_aktif: z.number().optional(),
  jumlah_nominal: z.number().optional(),

  status_verifikasi: z.string().optional(),

  tujuan_transfer: z.string().min(1, "Tujuan Transfer wajib dipilih"),

  daftar_nominatif: z
    .instanceof(File, { message: "File daftar nominatif wajib diupload" })
    .refine((file) => file.size <= 5 * 1024 * 1024, "Ukuran file maksimal 5MB")
    .refine((file) => file.type === "application/pdf", "Format file harus PDF"),

  salinan_bukti_pengeluaran: z
    .instanceof(File, {
      message: "File salinan bukti pengeluaran wajib diupload",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, "Ukuran file maksimal 5MB")
    .refine((file) => file.type === "application/pdf", "Format file harus PDF"),

  sptjm: z
    .instanceof(File, {
      message: "File SPTJM wajib diupload",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, "Ukuran file maksimal 5MB")
    .refine((file) => file.type === "application/pdf", "Format file harus PDF"),

  bukti_kwitansi: z
    .instanceof(File, {
      message: "File bukti kwitansi wajib diupload",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, "Ukuran file maksimal 5MB")
    .refine((file) => file.type === "application/pdf", "Format file harus PDF"),
});

export type AjukanKeVerifikatorFormData = z.infer<
  typeof ajukanKeVerifikatorSchema
>;

export const ajukanBpdpSchema = z
  .object({
    verifikasi: z.enum(["setuju", "kembalikan"], {
      required_error: "Pilih salah satu verifikasi",
    }),
    catatanRevisi: z.string().optional(),
  })
  .refine(
    (data) =>
      data.verifikasi === "setuju" ||
      (data.verifikasi === "kembalikan" &&
        data.catatanRevisi &&
        data.catatanRevisi.trim().length > 0),
    {
      message: "Catatan revisi wajib diisi jika dikembalikan",
      path: ["catatanRevisi"],
    },
  );

export type AjukanBpdpFormValues = z.infer<typeof ajukanBpdpSchema>;

export const staffBeasiswaSchema = z
  .object({
    total_pagu: z.coerce.number().min(0, "Total pagu tidak boleh negatif"),

    verifikasi: z.enum(["setuju", "kembalikan"], {
      required_error: "Pilih salah satu hasil verifikasi",
    }),

    catatan_revisi: z.string().optional(),

    // ✅ Buat field tagihan optional dulu
    tagihan_tahap_lalu: z.coerce.number().optional(),
    tagihan_tahap_ini: z.coerce.number().optional(),
    tagihan_sd_tahap_ini: z.coerce.number().optional(),
    tagihan_sisa_dana: z.coerce.number().optional(),

    ttd: z.string().optional(),
  })
  .refine(
    (data) => {
      // Jika verifikasi = kembalikan, catatan revisi wajib diisi
      if (data.verifikasi === "kembalikan") {
        return data.catatan_revisi && data.catatan_revisi.trim().length > 0;
      }
      return true;
    },
    {
      message: "Catatan revisi wajib diisi jika dokumen dikembalikan",
      path: ["catatan_revisi"],
    },
  )
  .refine(
    (data) => {
      // ✅ Jika verifikasi = setuju, field tagihan wajib diisi dan valid
      if (data.verifikasi === "setuju") {
        return (
          typeof data.tagihan_tahap_lalu === "number" &&
          data.tagihan_tahap_lalu >= 0
        );
      }
      return true;
    },
    {
      message: "Tagihan tahap lalu tidak boleh negatif",
      path: ["tagihan_tahap_lalu"],
    },
  )
  .refine(
    (data) => {
      if (data.verifikasi === "setuju") {
        return (
          typeof data.tagihan_tahap_ini === "number" &&
          data.tagihan_tahap_ini >= 0
        );
      }
      return true;
    },
    {
      message: "Tagihan tahap ini tidak boleh negatif",
      path: ["tagihan_tahap_ini"],
    },
  )
  .refine(
    (data) => {
      if (data.verifikasi === "setuju") {
        return (
          typeof data.tagihan_sd_tahap_ini === "number" &&
          data.tagihan_sd_tahap_ini >= 0
        );
      }
      return true;
    },
    {
      message: "Tagihan s/d tahap ini tidak boleh negatif",
      path: ["tagihan_sd_tahap_ini"],
    },
  )
  .refine(
    (data) => {
      // ✅ Signature wajib jika verifikasi = setuju
      if (data.verifikasi === "setuju") {
        return data.ttd && data.ttd.trim().length > 0;
      }
      return true;
    },
    {
      message: "Tanda tangan wajib diisi",
      path: ["ttd"],
    },
  );

export type StaffBeasiswaFormData = z.infer<typeof staffBeasiswaSchema>;

export const verifikatorPjkSchema = z
  .object({
    verifikasi: z.enum(["setuju", "kembalikan"], {
      required_error: "Pilih salah satu hasil verifikasi",
    }),
    catatan_revisi: z.string().optional(),
    ttd: z.string().optional(),
  })
  // Catatan revisi wajib jika verifikasi = kembalikan
  .refine(
    (data) => {
      if (data.verifikasi === "kembalikan") {
        return data.catatan_revisi && data.catatan_revisi.trim().length > 0;
      }
      return true;
    },
    {
      message: "Catatan revisi wajib diisi jika dokumen dikembalikan",
      path: ["catatan_revisi"],
    },
  )
  // Tanda tangan wajib jika verifikasi = setuju
  .refine(
    (data) => {
      if (data.verifikasi === "setuju") {
        return data.ttd && data.ttd.trim().length > 0;
      }
      return true;
    },
    {
      message: "Tanda tangan wajib diisi",
      path: ["ttd"],
    },
  );

export type VerifikatorPjkFormData = z.infer<typeof verifikatorPjkSchema>;

export interface PaginatedBatchBiayaSertifikasiPksResponse {
  result: IBatchBiayaSertifikasiPks[];
  total: number;
  current_page: number;
  total_pages: number;
}

export interface IBatchBiayaSertifikasiPks {
  id: number;
  nama: string;
  tahun: string;
  jenjang: string;
  ttd_nominatif_ppk: string;
  ttd_nominatif_bendahara: string;
}

export const ppkBendaharaSchema = z.object({
  ttd_ppk: z.string().optional(),
  ttd_bendahara: z.string().optional(),
});

export type PpkBendaharaFormData = z.infer<typeof ppkBendaharaSchema>;

export interface BatchItem {
  id: number;
  no_pks: string | null;
  lembaga_pendidikan: string | null;
  tahun: string | null;
  jumlah: number | null;
  total_mahasiswa: number | null;
  jenjang: string | null;
}

export interface GetLockDataRequest {
  id_trx_pks: number;
  tahun: string;
}

export interface ListSertifikasiWithMahasiswa extends IMahasiswaPks {
  has_diajukan: boolean;
}
