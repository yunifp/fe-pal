import { getJumlahSemester } from "@/data/jenjangKuliah";
import { z } from "zod";

export interface ITrxPks {
  id: number;
  id_trx_pks_referensi: number;

  no_pks: string | null;

  tanggal_pks: string | null;
  tanggal_awal_pks: string | null;
  tanggal_akhir_pks: string | null;

  id_lembaga_pendidikan: number | null;
  lembaga_pendidikan: string | null;

  id_jenjang: number | null;
  jenjang: string | null;

  tahun_angkatan: string | null;

  is_swakelola: "Y" | "N" | null;

  file_pks: string | null;

  jumlah_mahasiswa: number | null;

  biaya_hidup: number | null;
  biaya_hidup_per_bulan: number | null;
  biaya_hidup_per_bulan_per_mahasiswa: number | null;

  // 🔥 TOTAL pendidikan (hasil penjumlahan semester)
  biaya_pendidikan: number | null;

  // 🔥 PER SEMESTER
  biaya_pendidikan_semester_1: number | null;
  biaya_pendidikan_semester_2: number | null;
  biaya_pendidikan_semester_3: number | null;
  biaya_pendidikan_semester_4: number | null;
  biaya_pendidikan_semester_5: number | null;
  biaya_pendidikan_semester_6: number | null;
  biaya_pendidikan_semester_7: number | null;
  biaya_pendidikan_semester_8: number | null;

  // 🔥 PER MAHASISWA
  biaya_pendidikan_semester_1_per_mahasiswa: number | null;
  biaya_pendidikan_semester_2_per_mahasiswa: number | null;
  biaya_pendidikan_semester_3_per_mahasiswa: number | null;
  biaya_pendidikan_semester_4_per_mahasiswa: number | null;
  biaya_pendidikan_semester_5_per_mahasiswa: number | null;
  biaya_pendidikan_semester_6_per_mahasiswa: number | null;
  biaya_pendidikan_semester_7_per_mahasiswa: number | null;
  biaya_pendidikan_semester_8_per_mahasiswa: number | null;

  biaya_buku: number | null;
  biaya_buku_per_semester: number | null;
  biaya_buku_per_semester_per_mahasiswa: number | null;

  biaya_transportasi: number | null;
  biaya_transportasi_per_tahap: number | null;
  biaya_transportasi_per_tahap_per_mahasiswa: number | null;

  biaya_sertifikasi_kompetensi: number | null;
  biaya_sertifikasi_kompetensi_per_mahasiswa: number | null;

  nilai_pks: number | null;
}

export interface ITrxPksWithJumlahPerubahan extends ITrxPks {
  jumlah_perubahan_rekening: number | null;
  jumlah_perubahan_status_aktif: number | null;
  jumlah_perubahan_ipk: number | null;
}

export interface ITrxPksWithMahasiswa extends ITrxPks {
  total_mahasiswa: number | null;
  total_mahasiswa_aktif: number | null;
  total_mahasiswa_tidak_aktif: number | null;
}

export interface ITrxPksWithReferensi extends ITrxPksWithMahasiswa {
  pks_sebelumnya: number[] | null;
}

export interface PaginatedPerubahanDataMahasiswaResponse {
  result: IMahasiswaWithPks[];
  total: number;
  current_page: number;
  total_pages: number;
}

export interface IMahasiswaWithPks extends IMahasiswaPks {
  lembaga_pendidikan: string | null;
  jenjang: string | null;
  tahun_angkatan: string | null;
}

export interface ITrxPksGrouped {
  id: number;
  no_pks: string | null;
  tanggal_pks: string | null;

  id_lembaga_pendidikan: number | null;
  lembaga_pendidikan: string | null;

  file_pks: string | null;

  nilai_pks: number | null;

  biaya_hidup: number | null;
  biaya_pendidikan: number | null;
  biaya_buku: number | null;
  biaya_transportasi: number | null;
  biaya_sertifikasi_kompetensi: number | null;

  is_swakelola: boolean;

  jenjang: ITrxPksJenjang[];
}

export interface ITrxPksJenjang {
  id_jenjang: number | null;
  jenjang: string | null;
  tahun_angkatan: string | null;
}

export interface PaginatedTrxPksResponse {
  result: ITrxPks[];
  total: number;
  current_page: number;
  total_pages: number;
}

export interface PaginatedTrxWithJumlahPerubahanPksResponse {
  result: ITrxPksWithJumlahPerubahan[];
  total: number;
  current_page: number;
  total_pages: number;
}

export interface PaginatedTrxPksGroupedResponse {
  result: ITrxPksGrouped[];
  total: number;
  current_page: number;
  total_pages: number;
}

export interface IMahasiswaPks {
  id: number;
  id_trx_pks: number | null;
  status: 0 | 1;
  nik: string;
  nim: string;
  nama: string;
  jenis_kelamin: string;
  asal_kota: string;
  asal_provinsi: string;
  kode_pro: string;
  kode_kab: string;
  angkatan: number;
  no_rekening: string;
  nama_rekening: string;
  bank: string;
  kode_bank: string;
  file_scan_buku_tabungan: string;
  email: string;
  hp: string;
  id_kluster: 1 | 2;
  kluster: "Reguler" | "Afirmasi";
  file_pendukung: string | null;
  id_alasan_tidak_aktif: number | null;
  alasan_tidak_aktif: string | null;
  keterangan_tidak_aktif: string | null;
  has_perubahan_rekening: number | null;
  has_perubahan_status_aktif: number | null;
  has_perubahan_ipk: number | null;
}

export interface PaginatedMahasiswaPksResponse {
  result: IMahasiswaPks[];
  total: number;
  current_page: number;
  total_pages: number;
}

const pksBaseObject = z.object({
  no_pks: z.string().min(1, "No PKS wajib diisi"),
  tanggal_pks: z.string().min(1, "Tanggal PKS wajib diisi"),
  lembaga_pendidikan: z.string().min(1, "Lembaga Pendidikan wajib dipilih"),
  jenjang: z.string().min(1, "Jenjang wajib dipilih"),
  is_swakelola: z.string().min(1, "Jenis Swakelola wajib dipilih"),
  pks_referensi: z.string().optional(),
  tahun: z.string().min(1, "Tahun wajib diisi"),

  jumlah_mahasiswa: z.number().min(1),

  biaya_hidup: z.number().min(1),
  biaya_hidup_per_bulan: z.number().optional(),
  biaya_hidup_per_bulan_per_mahasiswa: z.number().optional(),

  biaya_pendidikan: z.number().min(1),

  pendidikan: z.array(
    z.object({
      semester: z.number(),
      biaya: z.number(),
      biaya_per_mahasiswa: z.number().optional(),
    }),
  ),

  biaya_buku: z.number().min(1),
  biaya_buku_per_semester: z.number().optional(),
  biaya_buku_per_semester_per_mahasiswa: z.number().optional(),

  biaya_transportasi: z.number().min(1),
  biaya_transportasi_per_tahap: z.number().optional(),
  biaya_transportasi_per_tahap_per_mahasiswa: z.number().optional(),

  biaya_sertifikasi_kompetensi: z.number().min(1),
  biaya_sertifikasi_kompetensi_per_mahasiswa: z.number().optional(),

  tanggal_awal_pks: z.string().min(1),
  tanggal_akhir_pks: z.string().min(1),
});

export const pksCreateSchema = pksBaseObject
  .extend({
    file_pks: z
      .instanceof(File, { message: "File PKS wajib diupload" })
      .refine((file) => file.size <= 5 * 1024 * 1024, "Maks 5MB")
      .refine((file) => file.type === "application/pdf", "Harus PDF"),
  })
  .superRefine((data, ctx) => {
    validatePendidikan(data, ctx);
  });

export type PksCreateFormData = z.infer<typeof pksCreateSchema>;

export const pksEditSchema = pksBaseObject
  .extend({
    file_pks: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || file.size <= 5 * 1024 * 1024, "Maks 5MB")
      .refine((file) => !file || file.type === "application/pdf", "Harus PDF"),
  })
  .superRefine((data, ctx) => {
    validatePendidikan(data, ctx);
  });

export type PksEditFormData = z.infer<typeof pksEditSchema>;

const pksSwakelolaObject = pksBaseObject.extend({
  pks_sebelumnya: z.array(z.number().int()).optional(),
});

export const pksSwakelolaCreateSchema = pksSwakelolaObject
  .extend({
    file_pks: z
      .instanceof(File, { message: "File PKS wajib diupload" })
      .refine((file) => file.size <= 5 * 1024 * 1024, "Maks 5MB")
      .refine((file) => file.type === "application/pdf", "Harus PDF"),
  })
  .superRefine((data, ctx) => {
    validatePendidikan(data, ctx);
  });

export type PksSwakelolaCreateFormData = z.infer<
  typeof pksSwakelolaCreateSchema
>;

export const pksSwakelolaEditSchema = pksSwakelolaObject
  .extend({
    file_pks: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || file.size <= 5 * 1024 * 1024, "Maks 5MB")
      .refine((file) => !file || file.type === "application/pdf", "Harus PDF"),
  })
  .superRefine((data, ctx) => {
    validatePendidikan(data, ctx);
  });

export type PksSwakelolaEditFormData = z.infer<typeof pksSwakelolaEditSchema>;

function validatePendidikan(data: any, ctx: z.RefinementCtx) {
  const maxSemester = getJumlahSemester(data.jenjang);

  if (maxSemester && data.pendidikan.length !== maxSemester) {
    ctx.addIssue({
      path: ["pendidikan"],
      code: z.ZodIssueCode.custom,
      message: `Jenjang ${data.jenjang} harus memiliki ${maxSemester} semester`,
    });
  }

  const totalSemester = data.pendidikan.reduce(
    (sum: number, item: any) => sum + item.biaya,
    0,
  );

  if (totalSemester !== data.biaya_pendidikan) {
    ctx.addIssue({
      path: ["biaya_pendidikan"],
      code: z.ZodIssueCode.custom,
      message:
        "Total biaya pendidikan harus sama dengan jumlah seluruh semester",
    });
  }
}

export interface ITrxIpk {
  id: number;
  id_trx_mahasiswa: number | null;
  semester: number | null;
  nilai: number | null;
}

export const ipkCreateSchema = z.object({
  semester: z.coerce.number().int().min(1),
  nilai: z
    .union([z.string(), z.number()])
    .transform((val) =>
      typeof val === "string" ? Number(val.replace(",", ".")) : val,
    )
    .refine((val) => !isNaN(val), "IPK tidak valid")
    .refine((val) => val >= 0 && val <= 4, "IPK harus 0 - 4"),
});

export type IpkCreateFormData = z.infer<typeof ipkCreateSchema>;

export interface ITrxBiayaHidup {
  id: number;
  id_trx_biaya_hidup_pks: number | null;
  id_trx_mahasiswa: number | null;
  bulan: string | null;
  nik: string | null;
  jumlah: number | null;
  tahun: number | null;
  status_disetujui?:
    | "Dalam Proses Kampus"
    | "Dalam Proses BPDP"
    | "Dalam Proses Pencairan"
    | "Selesai"
    | null;
  status_transfer?: "Y" | "N" | null;
}

export const biayaHidupCreateSchema = z.object({
  bulan: z
    .string({
      required_error: "Bulan wajib dipilih",
      invalid_type_error: "Bulan tidak valid",
    })
    .min(1, "Bulan wajib dipilih"),

  jumlah: z.coerce
    .number({
      required_error: "Jumlah biaya hidup wajib diisi",
      invalid_type_error: "Jumlah harus berupa angka",
    })
    .min(1, "Jumlah minimal Rp 1"),
});

export type BiayaHidupCreateFormData = z.infer<typeof biayaHidupCreateSchema>;

export interface ITrxBiayaPendidikan {
  id: number;
  id_trx_mahasiswa: number | null;
  semester: string | null;
  jumlah: number | null;
  status_disetujui?:
    | "Dalam Proses Kampus"
    | "Dalam Proses BPDP"
    | "Dalam Proses Pencairan"
    | "Selesai"
    | null;
  status_transfer?: "Y" | "N" | null;
}

export const biayaPendidikanCreateSchema = z.object({
  semester: z
    .number({
      required_error: "Semester wajib diisi",
      invalid_type_error: "Semester harus angka",
    })
    .min(1, "Semester minimal 1"),

  jumlah: z.coerce
    .number({
      required_error: "Jumlah biaya pendidikan wajib diisi",
      invalid_type_error: "Jumlah harus berupa angka",
    })
    .min(1, "Jumlah minimal Rp 1"),
});

export type BiayaPendidikanCreateFormData = z.infer<
  typeof biayaPendidikanCreateSchema
>;

export interface ITrxBiayaBuku {
  id: number;
  id_trx_mahasiswa: number | null;
  semester: string | null;
  tahun: string | null;
  jumlah: number | null;
  status_disetujui?:
    | "Dalam Proses Kampus"
    | "Dalam Proses BPDP"
    | "Dalam Proses Pencairan"
    | "Selesai"
    | null;
  status_transfer?: "Y" | "N" | null;
}

export const biayaBukuCreateSchema = z.object({
  semester: z
    .number({
      required_error: "Semester wajib diisi",
      invalid_type_error: "Semester harus angka",
    })
    .min(1, "Semester minimal 1"),

  jumlah: z.coerce
    .number({
      required_error: "Jumlah biaya buku wajib diisi",
      invalid_type_error: "Jumlah harus berupa angka",
    })
    .min(1, "Jumlah minimal Rp 1"),
});

export type BiayaBukuCreateFormData = z.infer<typeof biayaBukuCreateSchema>;

export interface ITrxBiayaTransportasi {
  id: number;
  id_trx_mahasiswa: number | null;
  tahap: string | null;
  jumlah: number | null;
  status_disetujui?:
    | "Dalam Proses Kampus"
    | "Dalam Proses BPDP"
    | "Dalam Proses Pencairan"
    | "Selesai"
    | null;
  status_transfer?: "Y" | "N" | null;
}

export const biayaTransportasiCreateSchema = z.object({
  tahap: z
    .string({
      required_error: "Tahap wajib dipilih",
      invalid_type_error: "Tahap tidak valid",
    })
    .min(1, "Tahap wajib dipilih"),

  jumlah: z.coerce
    .number({
      required_error: "Jumlah biaya buku wajib diisi",
      invalid_type_error: "Jumlah harus berupa angka",
    })
    .min(1, "Jumlah minimal Rp 1"),
});

export type BiayaTransportasiCreateFormData = z.infer<
  typeof biayaTransportasiCreateSchema
>;

export interface ITrxBiayaSertifikasi {
  id: number;
  id_trx_mahasiswa: number | null;
  jumlah: number | null;
  status_disetujui?:
    | "Dalam Proses Kampus"
    | "Dalam Proses BPDP"
    | "Dalam Proses Pencairan"
    | "Selesai"
    | null;
  status_transfer?: "Y" | "N" | null;
}

export const biayaSertifikasiCreateSchema = z.object({
  jumlah: z.coerce
    .number({
      required_error: "Jumlah biaya Sertifikasi wajib diisi",
      invalid_type_error: "Jumlah harus berupa angka",
    })
    .min(1, "Jumlah minimal Rp 1"),
});

export type BiayaSertifikasiCreateFormData = z.infer<
  typeof biayaSertifikasiCreateSchema
>;

export interface ITrxTracerStudi {
  id: number;
  id_trx_mahasiswa: number | null;
  jalur_karir: number | null;
  kontribusi_lulusan: number | null;
}

export const tracerStudiCreateSchema = z.object({
  jalur_karir: z
    .string({
      required_error: "Jalur karir wajib diisi",
      invalid_type_error: "Jalur karir tidak valid",
    })
    .min(3, "Jalur karir minimal 3 karakter"),

  kontribusi_lulusan: z
    .string({
      required_error: "Kontribusi lulusan wajib diisi",
      invalid_type_error: "Kontribusi lulusan tidak valid",
    })
    .min(5, "Kontribusi lulusan minimal 5 karakter"),
});

export type TracerStudiCreateFormData = z.infer<typeof tracerStudiCreateSchema>;

export const statusMahasiswaEditSchema = z
  .object({
    is_active: z.string(),

    alasan_tidak_aktif: z.string().optional(),

    keterangan_tidak_aktif: z.string().optional(),

    file_pendukung: z.instanceof(File).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.is_active === "0") {
      // Alasan WAJIB
      if (!data.alasan_tidak_aktif || data.alasan_tidak_aktif.trim() === "") {
        ctx.addIssue({
          path: ["alasan_tidak_aktif"],
          message: "Alasan tidak aktif wajib dipilih",
          code: z.ZodIssueCode.custom,
        });
      }

      if (
        !data.keterangan_tidak_aktif ||
        data.keterangan_tidak_aktif.trim() === ""
      ) {
        ctx.addIssue({
          path: ["keterangan_tidak_aktif"],
          message: "Keterangan",
          code: z.ZodIssueCode.custom,
        });
      }

      // File WAJIB
      if (!data.file_pendukung) {
        ctx.addIssue({
          path: ["file_pendukung"],
          message: "File pendukung wajib diupload",
          code: z.ZodIssueCode.custom,
        });
      } else {
        // Validasi file jika ada
        if (data.file_pendukung.size > 5 * 1024 * 1024) {
          ctx.addIssue({
            path: ["file_pendukung"],
            message: "Ukuran file maksimal 5MB",
            code: z.ZodIssueCode.custom,
          });
        }

        if (!["application/pdf"].includes(data.file_pendukung.type)) {
          ctx.addIssue({
            path: ["file_pendukung"],
            message: "Format file harus PDF",
            code: z.ZodIssueCode.custom,
          });
        }
      }
    }
  });

export type StatusMahasiswaEditFormData = z.infer<
  typeof statusMahasiswaEditSchema
>;

export interface IStatistikMahasiswa {
  total_mahasiswa: number;
  total_mahasiswa_aktif: number;
  total_mahasiswa_tidak_aktif: number;
}

export interface LockDataRequest {
  id_trx_pks: number;
  bulan: string;
  tahun: string;
  total_mahasiswa: number;
  total_mahasiswa_aktif: number;
  total_mahasiswa_tidak_aktif: number;
  jumlah_nominal: number;
}

export interface GetLockDataRequest {
  id_trx_pks: number;
  bulan: string;
  tahun: string;
}

export interface IStatistikMahasiswaLanding {
  id_lembaga_pendidikan: number;
  lembaga_pendidikan: string;
  jml: number;
}

export interface IStatistikMahasiswaProvinsiLanding {
  asal_provinsi: string;
  jml: number;
}

export interface BatchItem {
  id: number;
  no_pks: string | null;
  lembaga_pendidikan: string | null;
  bulan: string | null;
  tahun: string | null;
  jumlah: number | null;
  total_mahasiswa: number | null;
  jenjang: string | null;
}

export const identitasUpdateSchema = z.object({
  nik: z.string().optional(),

  nim: z.string().optional(),

  nama: z.string().optional(),

  jenis_kelamin: z.string().optional(),

  asal_kota: z.string().optional(),

  asal_provinsi: z.string().optional(),

  angkatan: z.coerce.number().optional(),

  email: z.string().optional(),

  hp: z.string().optional(),

  bank: z.string().optional(),

  no_rekening: z.string().optional(),
  nama_rekening: z.string().optional(),

  scan_buku_tabungan: z
    .instanceof(File)
    .optional()
    .refine(
      (file) =>
        !file ||
        file.size === 0 ||
        ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
      "Format foto harus JPG, PNG, atau PDF",
    )
    .refine(
      (file) => !file || file.size === 0 || file.size <= 2 * 1024 * 1024,
      "Ukuran foto maksimal 2MB",
    ),

  kluster: z.string().optional(),
});

export type IdentitasUpdateFormData = z.infer<typeof identitasUpdateSchema>;

export interface ILogPengajuan {
  id: number;
  id_pengajuan: number;
  section: string;
  timestamp: string;
  aksi: string;
  catatan: string | null;
}
