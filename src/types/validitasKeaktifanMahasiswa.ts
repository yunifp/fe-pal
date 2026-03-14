import z from "zod";

export interface IValiditasKeaktifanMahasiswa {
  id: number;
  id_trx_pks: number | null;
  bulan: string | null;
  tahun: string | null;
  isi_pernyataan: string | null;
  created_by: string | null;
  created_at: string | null;
  no_pks?: string;
}

export interface PaginatedValiditasKeaktifanMahasiswa {
  result: IValiditasKeaktifanMahasiswa[];
  total: number;
  current_page: number;
  total_pages: number;
}

export const ajukanValiditasKeaktifanMahasiswaSchema = z.object({
  id_trx_pks: z.number().optional(),
  bulan: z.string().optional(),
  tahun: z.string().optional(),
  total_mahasiswa_aktif: z.number().optional(),

  pernyataan_disetujui: z.literal(true, {
    errorMap: () => ({
      message: "Anda harus menyetujui pernyataan terlebih dahulu",
    }),
  }),

  isi_pernyataan: z.string().optional(),
});

export type AjukanValiditasKeaktifanMahasiswaFormData = z.infer<
  typeof ajukanValiditasKeaktifanMahasiswaSchema
>;

export interface GetLockDataRequest {
  id_trx_pks: number;
  bulan: string;
  tahun: string;
}
