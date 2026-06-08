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
  has_d1_d2: string | null;

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

export interface IJenjang {
  id_jenjang: number;
  nama_jenjang: string;
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

// --- Interface ---
export interface INpsn {
  id: number;
  id_jenjang: number;
  sekolah: string;
  npsn: string | null;
  jenis_sekolah: string | null;
}

export interface PaginatedNpsnResponse {
  result: INpsn[];
  total: number;
  current_page: number;
  total_pages: number;
}

export interface ICmsHero {
  id: number;
  judul: string;
  subjudul: string | null;
  bg_image_url: string | null;
  bg_image_url_2: string | null;
  bg_image_url_3: string | null;
  label_cta: string | null;
  url_cta: string | null;
  label_cta_2: string | null; 
  url_cta_2: string | null;   
  // --- Tambahan Slide 2 ---
  judul_2: string | null;
  subjudul_2: string | null;
  s2_label_cta: string | null;
  s2_url_cta: string | null;
  s2_label_cta_2: string | null;
  s2_url_cta_2: string | null;

  // --- Tambahan Slide 3 ---
  judul_3: string | null;
  subjudul_3: string | null;
  s3_label_cta: string | null;
  s3_url_cta: string | null;
  s3_label_cta_2: string | null;
  s3_url_cta_2: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface ICmsHeroFormData {
  judul: string;
  subjudul?: string;
  bg_image_url: string | null;
  bg_image_url_2: string | null;
  bg_image_url_3: string | null;
  label_cta?: string;
  url_cta?: string;
  label_cta_2?: string; // UBAH: Tambahan field baru
  url_cta_2?: string;   // UBAH: Tambahan field baru
  judul_2?: string;
  subjudul_2?: string;
  s2_label_cta?: string;
  s2_url_cta?: string;
  s2_label_cta_2?: string;
  s2_url_cta_2?: string;

  // --- Tambahan Slide 3 ---
  judul_3?: string;
  subjudul_3?: string;
  s3_label_cta?: string;
  s3_url_cta?: string;
  s3_label_cta_2?: string;
  s3_url_cta_2?: string;
  is_active?: number;
}

// --- Zod Schema ---
export const npsnSchema = z.object({
  id_jenjang: z
    .number({ invalid_type_error: "ID jenjang harus berupa angka" })
    .int("ID jenjang harus bilangan bulat")
    .min(1, "ID jenjang wajib diisi"),
  sekolah: z
    .string()
    .min(1, "Nama sekolah wajib diisi")
    .max(255, "Nama sekolah maksimal 255 karakter"),
  npsn: z
    .string()
    .max(20, "NPSN maksimal 20 karakter")
    .optional()
    .or(z.literal("")),
  jenis_sekolah: z
    .string()
    .max(100, "Jenis sekolah maksimal 100 karakter")
    .optional()
    .or(z.literal("")),
});

export type NpsnFormData = z.infer<typeof npsnSchema>;

export type PerguruanTinggiEditFormData = z.infer<
  typeof perguruanEditTinggiSchema
>;

export interface ICmsJalurSyarat {
  id: number;
  id_jalur: number;
  syarat: string;
  urutan: number;
  template_link?: string;
}

export interface ICmsJalurDokumen {
  id: number;
  id_jalur: number;
  dokumen: string;
  urutan: number;
  template_link?: string;
}

export interface ICmsJalurPendaftaran {
  id: number;
  urutan: number;
  judul: string;
  deskripsi: string | null;
  gambar_url: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  syarat: ICmsJalurSyarat[];
  dokumen: ICmsJalurDokumen[];
}

export interface ICmsJalurFormData {
  judul: string;
  deskripsi?: string;
  gambar_url?: string;
  urutan?: number;
  is_active?: number;
  syarat?: { syarat: string; urutan?: number }[];
  dokumen?: { dokumen: string; urutan?: number }[];
}

export interface ICmsItemFormData {
  syarat?: string;
  dokumen?: string;
  urutan?: number;
}

export interface ICmsKontak {
  id: number;
  judul_section: string;
  nama_instansi: string | null;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  whatsapp: string | null;
  whatsapp_2: string | null;
  jam_operasional: string | null;
  maps_embed_url: string | null;
  maps_lat: string | null;
  maps_lng: string | null;
  is_active: number;
  created_by: string | null;
  updated_by: string | null;
}

export interface ICmsKontakFormData {
  judul_section: string;
  nama_instansi?: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  whatsapp?: string;
  whatsapp_2?: string;
  jam_operasional?: string;
  maps_embed_url?: string;
  maps_lat?: string;
  maps_lng?: string;
  is_active?: number;
}

export interface ICmsTentang {
  id: number;
  judul_section: string;
  deskripsi: string | null;
  gambar_url: string | null;
  is_active: number;
  created_by: string | null;
  updated_by: string | null;
}

export interface ICmsTentangFormData {
  judul_section: string;
  deskripsi?: string;
  gambar_url?: string;
  is_active?: number;
}