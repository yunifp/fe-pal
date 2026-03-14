import z from "zod";
import type { IMahasiswaPks } from "./pks";

export interface IValiditasIpkMahasiswa {
  id: number;
  id_trx_pks: number | null;
  semester: number | null;
  isi_pernyataan: string | null;
  created_by: string | null;
  created_at: string | null;
  no_pks?: string;
}

export interface PaginatedValiditasIpkMahasiswa {
  result: IValiditasIpkMahasiswa[];
  total: number;
  current_page: number;
  total_pages: number;
}

export const ajukanValiditasIpkMahasiswaSchema = z.object({
  id_trx_pks: z.number().optional(),
  semester: z.number().optional(),
  total_mahasiswa_aktif: z.number().optional(),

  pernyataan_disetujui: z.literal(true, {
    errorMap: () => ({
      message: "Anda harus menyetujui pernyataan terlebih dahulu",
    }),
  }),

  isi_pernyataan: z.string().optional(),
});

export type AjukanValiditasIpkMahasiswaFormData = z.infer<
  typeof ajukanValiditasIpkMahasiswaSchema
>;

export interface GetLockDataRequest {
  id_trx_pks: number;
  semester: string;
}

export interface ListIpkWithMahasiswa extends IMahasiswaPks {
  has_diajukan: boolean;
}
