import z from "zod";

export interface PaginatedPerguruanTinggiResponse {
  result: IPerguruanTinggi[];
  total: number;
  current_page: number;
  total_pages: number;
}

export interface IPerguruanTinggi {
  id_pt: number;
  nama_pt: string;
  kode_pt: string | null;
  singkatan: string | null;
  jenis: string;

  alamat: string | null;
  kota: string | null;
  kode_pos: string | null;

  no_telepon_pt: string | null;
  fax_pt: string | null;
  email: string | null;
  website: string | null;

  logo_path: string | null;

  nama_pimpinan: string | null;
  no_telepon_pimpinan: string | null;
  jabatan_pimpinan: string | null;

  no_rekening: string | null;
  nama_bank: string | null;
  nama_penerima_transfer: string | null;

  npwp: string | null;

  nama_operator: string | null;
  no_telepon_operator: string | null;
  email_operator: string | null;

  nama_verifikator: string | null;
  no_telepon_verifikator: string | null;
  email_verifikator: string | null;

  status_aktif: number;

  has_pengajuan_perubahan: number;
}

export interface IProgramStudi {
  id_prodi: number;
  id_pt: number;
  jenjang: string;
  nama_prodi: string;
  kuota: number;
  boleh_buta_warna: string;
}

export interface IWilayah {
  wilayah_id: number;
  parent: number;
  children: number;
  nama_wilayah: string;
  usulan_nama: string;
  tingkat: number;
  tingkat_label: string;
  kode_pro: number;
  kode_kab: number;
  kode_kec: number;
  kode_kel: number;
  singkatan: string;
  lat: number | null;
  lon: number | null;
}

// ✅ Perbaikan: Gunakan intersection type, bukan extends
export type IProvinsiWithCount = IWilayah & {
  jumlah_pendaftar: number;
};

export type IKabkotaWithCount = IWilayah & {
  jumlah_pendaftar: number;
  kode_dinas_kabkota: string;
  kode_dinas_provinsi: string;
};
export interface ILembagaPendidikan {
  id: number;
  nama: string;
}

export interface PaginatedJenjangSekolahResponse {
  result: IJenjangSekolah[];
  total: number;
  current_page: number;
  total_pages: number;
}

export interface IJenjangSekolah {
  id: number;
  jenjang: string;
  keterangan: string;
}

export interface PaginatedJurusanSekolahResponse {
  result: IJurusanSekolah[];
  total: number;
  current_page: number;
  total_pages: number;
}

export interface IJurusanSekolah {
  id_jurusan_sekolah: number;
  id_jenjang_sekolah: number;
  jurusan: string;
}

export interface IJenjangKuliah {
  id: number;
  nama: string;
}

export interface IAlasanTidakAktif {
  id: number;
  nama: string;
}

export interface IBank {
  id: string;
  kode_bank: string;
  bank: string;
}

export const perguruanEditTinggiSchema = z.object({
  namaPerguruanTinggi: z.string().min(1, "Nama perguruan tinggi wajib diisi"),
  kodePerguruanTinggi: z.string().min(1, "Kode perguruan tinggi wajib diisi"),

  singkatan: z.string().min(1, "Singkatan wajib diisi"),

  alamat: z.string().min(1, "Alamat wajib diisi"),

  jenis: z.string().min(1, "Jenis perguruan tinggi wajib dipilih"),

  noTeleponPt: z.string().min(1, "Nomor telepon perguruan tinggi wajib diisi"),
  faxPt: z.string().min(1, "Nomor facsimile perguruan tinggi wajib diisi"),

  kota: z.string().min(1, "Kota wajib diisi"),

  kodePos: z
    .string()
    .min(5, "Kode pos tidak valid")
    .max(10, "Kode pos tidak valid"),

  alamatWebsite: z
    .string()
    .url("Alamat website tidak valid")
    .optional()
    .or(z.literal("")),

  alamatEmail: z.string().email("Alamat email tidak valid"),

  logoLembaga: z
    .instanceof(File, { message: "Logo lembaga wajib diunggah" })
    .optional(),

  namaDirektur: z.string().min(1, "Nama Direktur / Rektor wajib diisi"),
  noTeleponPimpinan: z.string().min(1, "Nomor telepon pimpinan wajib diisi"),
  jabatanPimpinan: z.string().min(1, "Nama pimpinan wajib diisi"),

  noRekeningLembaga: z.string().min(1, "Nomor rekening lembaga wajib diisi"),

  namaBank: z.string().min(1, "Nama bank wajib diisi"),

  namaPenerimaTransfer: z.string().min(1, "Nama penerima transfer wajib diisi"),

  npwp: z.string().min(15, "NPWP tidak valid").max(20, "NPWP tidak valid"),

  statusAktif: z.number().optional(),

  namaOperator: z.string().min(1, "Nama operator wajib diisi"),
  noTeleponOperator: z.string().min(1, "Nomor telepon operator wajib diisi"),
  emailOperator: z.string().min(1, "Email operator wajib diisi"),

  namaVerifikator: z.string().min(1, "Nama verifikator wajib diisi"),
  noTeleponVerifikator: z
    .string()
    .min(1, "Nomor telepon verifikator wajib diisi"),
  emailVerifikator: z.string().min(1, "Email verifikator wajib diisi"),
});

export type PerguruanTinggiEditFormData = z.infer<
  typeof perguruanEditTinggiSchema
>;
