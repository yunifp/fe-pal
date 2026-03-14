import { z } from "zod";

export interface IProgramStudi {
  id_prodi: number;
  id_pt: number;
  jenjang: "D1" | "D2" | "D3" | "D4" | "S1";
  nama_prodi: string;
  kuota: number;
  boleh_buta_warna: "Y" | "N";
  RefPerguruanTinggi?: {
    nama_pt: string;
  };
  is_mapped?: boolean;
}

export interface PaginatedProgramStudiResponse {
  result: IProgramStudi[];
  total: number;
  current_page: number;
  total_pages: number;
}

export const programStudiSchema = z.object({
  id_pt: z.coerce.number().min(1, "Perguruan Tinggi harus dipilih"), // <-- TAMBAHKAN INI
  jenjang: z.enum(["D1", "D2", "D3", "D4", "S1"], {
    required_error: "Jenjang harus dipilih",
  }),
  nama_prodi: z.string().min(1, "Nama Program Studi tidak boleh kosong"),
  kuota: z.coerce.number().min(0, "Kuota tidak boleh negatif").default(0),
  boleh_buta_warna: z.enum(["Y", "N"], {
    required_error: "Status buta warna harus dipilih",
  }),
});

export type ProgramStudiFormData = z.infer<typeof programStudiSchema>;