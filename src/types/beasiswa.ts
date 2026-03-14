import { z } from "zod";

export interface IBeasiswa {
  id: number;
  nama_beasiswa: string;
  informasi: string;
  status_aktif: string;
  status_tutup_daftar: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
}

export interface IPersyaratanUmumBeasiswa {
  id: number;
  persyaratan: string;
  status_aktif: string;
  valid_type: string;
  is_required: "Y" | "N";
}

export interface ITrxDokumenUmum {
  id: number;
  id_trx_beasiswa: number | null;
  id_ref_dokumen: number | null;
  nama_dokumen_persyaratan: string | null;
  file: string | null;
  timestamp: string | null;
  status_verifikasi: "sesuai" | "tidak sesuai" | null;
  verifikator_nama: string | null;
  verifikator_catatan: string | null;
  verifikator_timestamp: string | null;
  verifikator_dinas_catatan: string | null;
  verifikator_dinas_timestamp: string | null;
}

export interface IWilayah {
  wilayah_id: number;
  parent: number;
  children: number;
  nama_wilayah: string;
  usulan_nama: string;
  tingkat: number;
  tingkat_label: string;
  kode_pro?: number;
  kode_kab?: number;
  kode_kec: number;
  kode_kel: number;
  singkatan: string;
  lat: number | null;
  lon: number | null;
}

export type IProvinsiWithCount = IWilayah & {
  jumlah_pendaftar: number;
};

export type IKabkotaWithCount = IWilayah & {
  jumlah_pendaftar: number;
};

export interface IJalur {
  id: number;
  jalur: string;
}
export interface IFlowBeasiswa {
  id: number;
  flow: string;
  ket: string | null;
}
export interface IPersyaratanKhususBeasiswa {
  id: number;
  id_jalur: number;
  persyaratan: string;
  status_aktif: string;
  valid_type: string;
  is_required: "Y" | "N";
}

export interface ITrxDokumenKhusus {
  id: number;
  id_trx_beasiswa: number | null;
  id_ref_dokumen: number | null;
  nama_dokumen_persyaratan: string | null;
  file: string | null;
  timestamp: string | null;
  status_verifikasi: "sesuai" | "tidak sesuai" | null;
  verifikator_nama: string | null;
  verifikator_catatan: string | null;
  verifikator_timestamp: string | null;
  verifikator_dinas_catatan: string | null;
  verifikator_dinas_timestamp: string | null;
}

export interface ITrxDokumenDinas {
  id: number;
  id_trx_beasiswa: number | null;
  id_ref_dokumen: number | null;
  nama_dokumen_persyaratan: string | null;
  file: string | null;
  timestamp: string | null;
  verifikator_nama: string | null;
  verifikator_catatan: string | null;
  verifikator_timestamp: string | null;
  verifikator_dinas_catatan: string | null;
  verifikator_dinas_timestamp: string | null;
}

export interface PaginatedTrxBeasiswaResponse {
  result: ITrxBeasiswa[];
  total: number;
  current_page: number;
  total_pages: number;
}

export interface ITrxBeasiswa {
  id_trx_beasiswa: number;
  id_ref_beasiswa: number;

  nama_beasiswa?: string | null;
  id_flow?: number | null;
  flow?: string | null;

  id_users?: number | null;

  // =====================
  // Foto
  // =====================
  foto?: string | null;
  foto_depan?: string | null;
  foto_samping_kiri?: string | null;
  foto_samping_kanan?: string | null;
  foto_belakang?: string | null;

  nama_lengkap?: string | null;
  nik?: string | null;
  nkk?: string | null;

  jenis_kelamin?: "L" | "P" | null;
  no_hp?: string | null;
  email?: string | null;
  kode_pendaftaran?: string | null;

  tanggal_lahir?: string | null;
  tempat_lahir?: string | null;
  agama?: string | null;
  suku?: string | null;

  berat_badan?: string | null;
  tinggi_badan?: string | null;

  // =====================
  // Pekerjaan
  // =====================
  id_pekerjaan?: number | null;
  pekerjaan?: string | null;
  id_instansi_pekerjaan?: number | null;
  instansi_pekerjaan?: string | null;

  // =====================
  // Alamat Tinggal
  // =====================
  tinggal_kode_prov?: string | null;
  tinggal_prov?: string | null;
  tinggal_kode_kab?: string | null;
  tinggal_kab_kota?: string | null;
  tinggal_kode_kec?: string | null;
  tinggal_kec?: string | null;
  tinggal_kode_kel?: string | null;
  tinggal_kel?: string | null;
  tinggal_dusun?: string | null;
  tinggal_kode_pos?: string | null;
  tinggal_rt?: string | null;
  tinggal_rw?: string | null;
  tinggal_alamat?: string | null;
  alamat_kerja_sama_dengan_tinggal?: boolean | null;

  // =====================
  // Alamat Kerja
  // =====================
  kerja_kode_prov?: string | null;
  kerja_prov?: string | null;
  kerja_kode_kab?: string | null;
  kerja_kab_kota?: string | null;
  kerja_kode_kec?: string | null;
  kerja_kec?: string | null;
  kerja_kode_kel?: string | null;
  kerja_kel?: string | null;
  kerja_dusun?: string | null;
  kerja_kode_pos?: string | null;
  kerja_rt?: string | null;
  kerja_rw?: string | null;
  kerja_alamat?: string | null;

  // =====================
  // Data Ayah (Required)
  // =====================
  ayah_nama?: string | null;
  ayah_nik?: string | null;
  ayah_jenjang_pendidikan?: string | null;
  ayah_pekerjaan?: string | null;
  ayah_penghasilan?: number | null;
  ayah_id_status_hidup?: number | null;
  ayah_status_hidup?: string | null;
  ayah_id_status_kekerabatan?: number | null;
  ayah_status_kekerabatan?: string | null;
  ayah_tempat_lahir?: string | null;
  ayah_tanggal_lahir?: string | null;
  ayah_no_hp?: string | null;
  ayah_email?: string | null;
  ayah_alamat?: string | null;

  // =====================
  // Data Ibu (Required)
  // =====================
  ibu_nama?: string | null;
  ibu_nik?: string | null;
  ibu_jenjang_pendidikan?: string | null;
  ibu_pekerjaan?: string | null;
  ibu_penghasilan?: number | null;
  ibu_id_status_hidup?: number | null;
  ibu_status_hidup?: string | null;
  ibu_id_status_kekerabatan?: number | null;
  ibu_status_kekerabatan?: string | null;
  ibu_tempat_lahir?: string | null;
  ibu_tanggal_lahir?: string | null;
  ibu_no_hp?: string | null;
  ibu_email?: string | null;
  ibu_alamat?: string | null;

  // =====================
  // Data Wali (Optional)
  // =====================
  wali_nama?: string | null;
  wali_nik?: string | null;
  wali_jenjang_pendidikan?: string | null;
  wali_pekerjaan?: string | null;
  wali_penghasilan?: number | null;
  wali_id_status_hidup?: number | null;
  wali_status_hidup?: string | null;
  wali_id_status_kekerabatan?: number | null;
  wali_status_kekerabatan?: string | null;
  wali_tempat_lahir?: string | null;
  wali_tanggal_lahir?: string | null;
  wali_no_hp?: string | null;
  wali_email?: string | null;
  wali_alamat?: string | null;

  // =====================
  // Alamat Sekolah
  // =====================
  sekolah_kode_prov?: string | null;
  sekolah_prov?: string | null;
  sekolah_kode_kab?: string | null;
  sekolah_kab_kota?: string | null;

  // =====================
  // Pendidikan
  // =====================
  id_jenjang_sekolah?: string | null;
  jenjang_sekolah?: string | null;
  sekolah?: string | null;
  jurusan?: string | null;
  tahun_lulus?: string | null;
  nama_jurusan_sekolah?: string | null;

  kondisi_buta_warna?: "Y" | "N" | null;

  // =====================
  // Jalur & Beasiswa
  // =====================
  id_jalur?: number | null;
  id_verifikator?: number | null;
  jalur?: string | null;

  // =====================
  // Status & Verifikasi
  // =====================
  status_lulus_administrasi?: "Y" | "N" | null;
  status_lulus_wawancara_akademik?: "Y" | "N" | null;
  status_dari_verifikator_dinas?: "Y" | "N" | null;
  berita_acara_verifikator_dinas?: string | null;
  status_hasil_analisa_rasio?: "Y" | "N" | null;
  file_rekomendasi_teknis?: string | null;
  status_undur_diri?: "Y" | "N" | null;
  status_akhir_kelulusan?: "Y" | "N" | null;

  verifikator_catatan?: string | null;
  verifikator_dinas_catatan?: string | null;

  created_at?: Date | string | null;
  updated_at?: Date | string | null;

  // =====================
  // DINAS
  // =====================
  kode_dinas_provinsi?: string | null;
  kode_dinas_kabkota?: string | null;
  nama_dinas_provinsi?: string | null;
  nama_dinas_kabkota?: string | null;

  // =====================
  // Relasi
  // =====================
  pilihan_program_studi?: IPilihanProgramStudi[] | null;

  catatan_data_section: CatatanDataSection | null;
}

export interface IProvinsiCount {
  kode_dinas_provinsi: string;
  jumlah_pendaftar: number;
}

export interface IKabkotaCount {
  kode_dinas_kabkota: string;
  jumlah_pendaftar: number;
}

export interface IPilihanProgramStudi {
  id: number;
  id_trx_beasiswa: number;
  id_pt: number;
  nama_pt: string;
  id_prodi: number;
  nama_prodi: string;
}

// ============================================================
// Helper: reusable foto schema blocks
// ============================================================

/** Factory — setiap pemanggilan menghasilkan instance baru agar tidak di-chain ulang */
const makeFotoRequired = (label = "Foto") =>
  z
    .instanceof(File, { message: `${label} wajib diisi` })
    .refine((file) => file.size > 0, `${label} wajib diisi`)
    .refine(
      (file) => ["image/jpeg", "image/png"].includes(file.type),
      "Format foto harus JPG atau PNG",
    )
    .refine((file) => file.size <= 2 * 1024 * 1024, "Ukuran foto maksimal 2MB");

/** Alias untuk kompatibilitas dengan editBeasiswaSchema omit/merge */
// const fotoRequiredSchema = makeFotoRequired("Foto");

/** Validasi foto opsional (boleh kosong, tapi kalau ada harus valid) */
const fotoOptionalSchema = z
  .instanceof(File)
  .optional()
  .refine(
    (file) =>
      !file ||
      file.size === 0 ||
      ["image/jpeg", "image/png"].includes(file.type),
    "Format foto harus JPG atau PNG",
  )
  .refine(
    (file) => !file || file.size === 0 || file.size <= 2 * 1024 * 1024,
    "Ukuran foto maksimal 2MB",
  );

// ============================================================
// createBeasiswaSchema — data BARU, semua foto wajib
// ============================================================
const createBeasiswaSchema = () => {
  const baseFields = {
    nama_lengkap: z
      .string()
      .min(1, "Nama wajib diisi")
      .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh berisi huruf dan spasi"),
    nik: z
      .string()
      .trim()
      .length(16, "NIK harus 16 digit")
      .regex(/^\d{16}$/, "NIK harus 16 digit angka")
      .refine((val) => !/^0+$/.test(val), "NIK tidak valid"),
    nkk: z
      .string()
      .min(16, "NKK harus 16 digit")
      .max(16, "NKK harus 16 digit")
      .regex(/^\d+$/, "NKK hanya boleh berisi angka"),
    jenis_kelamin: z.string().min(1, "Jenis Kelamin wajib dipilih"),
    no_hp: z
      .string()
      .min(8, "No. Telepon minimal 8 digit")
      .regex(/^(\+62|62|0)8[1-9][0-9]{6,12}$/, "Format nomor HP tidak valid"),
    email: z.string().email("Format Email tidak valid"),
    tanggal_lahir: z.string().min(1, "Tanggal Lahir wajib diisi"),
    tempat_lahir: z.string().min(1, "Tempat Lahir wajib diisi"),
    agama: z.string().min(1, "Agama wajib diisi"),
    suku: z.string().min(1, "Suku wajib diisi"),
    pekerjaan: z.string().optional(),
    instansi_pekerjaan: z.string().optional(),
    berat_badan: z.string().min(1, "Berat Badan wajib diisi"),
    tinggi_badan: z.string().min(1, "Tinggi Badan wajib diisi"),

    // ── Foto profil + 4 sisi (wajib untuk data baru) ──
    foto: makeFotoRequired("Foto Profil"),
    foto_depan: makeFotoRequired("Foto Tampak Depan"),
    foto_samping_kiri: makeFotoRequired("Foto Tampak Samping Kiri"),
    foto_samping_kanan: makeFotoRequired("Foto Tampak Samping Kanan"),
    foto_belakang: makeFotoRequired("Foto Tampak Belakang"),

    tinggal_provinsi: z.string().min(1, "Provinsi Tempat Tinggal wajib diisi"),
    kode_dinas_provinsi: z
      .string()
      .min(1, "Dinas Provinsi wajib diisi")
      .optional(),
    tinggal_kabkot: z
      .string()
      .min(1, "Kabupaten / Kota Tempat Tinggal wajib diisi"),
    kode_dinas_kabkot: z
      .string()
      .min(1, "Dinas Kabupaten / Kota wajib diisi")
      .optional(),
    tinggal_kecamatan: z
      .string()
      .min(1, "Kecamatan Tempat Tinggal wajib diisi"),
    tinggal_kelurahan: z
      .string()
      .min(1, "Kelurahan Tempat Tinggal wajib diisi"),
    tinggal_dusun: z.string().min(1, "Dusun Tempat Tinggal wajib diisi"),
    tinggal_rt: z.string().min(1, "RT Tempat Tinggal wajib diisi"),
    tinggal_rw: z.string().min(1, "RW Tempat Tinggal wajib diisi"),
    tinggal_kode_pos: z.string().min(1, "Kode pos Tempat Tinggal wajib diisi"),
    tinggal_alamat: z.string().min(1, "Alamat Tempat Tinggal wajib diisi"),
    alamat_kerja_sama_dengan_tinggal: z.boolean().optional(),

    kerja_provinsi: z
      .string()
      .min(1, "Provinsi Tempat Bekerja / Kebun wajib diisi"),
    kerja_kabkot: z
      .string()
      .min(1, "Kabupaten / Kota Tempat Bekerja / Kebun wajib diisi"),
    kerja_kecamatan: z
      .string()
      .min(1, "Kecamatan Tempat Bekerja / Kebun wajib diisi"),
    kerja_kelurahan: z
      .string()
      .min(1, "Kelurahan Tempat Bekerja / Kebun wajib diisi"),
    kerja_dusun: z.string().min(1, "Dusun Tempat Bekerja / Kebun wajib diisi"),
    kerja_rt: z.string().min(1, "RT Tempat Bekerja / Kebun wajib diisi"),
    kerja_rw: z.string().min(1, "RW Tempat Bekerja / Kebun wajib diisi"),
    kerja_kode_pos: z
      .string()
      .min(1, "Kode pos Tempat Bekerja / Kebun wajib diisi"),
    kerja_alamat: z
      .string()
      .min(1, "Alamat Tempat Bekerja / Kebun wajib diisi"),

    // Data Ayah
    ayah_nama: z.string().min(1, "Nama Ayah wajib diisi"),
    ayah_nik: z
      .string()
      .min(16, "NIK Ayah harus 16 digit")
      .max(16, "NIK Ayah harus 16 digit"),
    ayah_jenjang_pendidikan: z
      .string()
      .min(1, "Jenjang Pendidikan Ayah wajib diisi"),
    ayah_pekerjaan: z.string().min(1, "Pekerjaan Ayah wajib diisi"),
    ayah_penghasilan: z.string().min(1, "Penghasilan Ayah wajib diisi"),
    ayah_status_hidup: z.string().min(1, "Status Hidup Ayah wajib diisi"),
    ayah_status_kekerabatan: z
      .string()
      .min(1, "Status Kekerabatan Ayah wajib diisi"),
    ayah_alamat: z.string().min(1, "Alamat Ayah wajib diisi"),
    ayah_tempat_lahir: z.string().min(1, "Tempat Lahir Ayah wajib diisi"),
    ayah_tanggal_lahir: z.string().min(1, "Tanggal Lahir Ayah wajib diisi"),
    ayah_no_hp: z.string().min(1, "No. Telepon Ayah wajib diisi"),
    ayah_email: z.string().optional(),

    // Data Ibu
    ibu_nama: z.string().min(1, "Nama Ibu wajib diisi"),
    ibu_nik: z
      .string()
      .min(16, "NIK Ibu harus 16 digit")
      .max(16, "NIK Ibu harus 16 digit"),
    ibu_jenjang_pendidikan: z
      .string()
      .min(1, "Jenjang Pendidikan Ibu wajib diisi"),
    ibu_pekerjaan: z.string().min(1, "Pekerjaan Ibu wajib diisi"),
    ibu_penghasilan: z.string().min(1, "Penghasilan Ibu wajib diisi"),
    ibu_status_hidup: z.string().min(1, "Status Hidup Ibu wajib diisi"),
    ibu_status_kekerabatan: z
      .string()
      .min(1, "Status Kekerabatan Ibu wajib diisi"),
    ibu_alamat: z.string().min(1, "Alamat Ibu wajib diisi"),
    ibu_tempat_lahir: z.string().min(1, "Tempat Lahir Ibu wajib diisi"),
    ibu_tanggal_lahir: z.string().min(1, "Tanggal Lahir Ibu wajib diisi"),
    ibu_no_hp: z.string().min(1, "No. Telepon Ibu wajib diisi"),
    ibu_email: z.string().optional(),

    // Data Wali (opsional)
    wali_nama: z.string().optional(),
    wali_nik: z.string().optional(),
    wali_jenjang_pendidikan: z.string().optional(),
    wali_pekerjaan: z.string().optional(),
    wali_penghasilan: z.string().optional(),
    wali_status_hidup: z.string().optional(),
    wali_status_kekerabatan: z.string().optional(),
    wali_alamat: z.string().optional(),
    wali_tempat_lahir: z.string().optional(),
    wali_tanggal_lahir: z.string().optional(),
    wali_no_hp: z.string().optional(),
    wali_email: z
      .string()
      .email("Format Email Wali tidak valid")
      .optional()
      .or(z.literal("")),

    sekolah_provinsi: z.string().min(1, "Provinsi Sekolah wajib diisi"),
    sekolah_kabkot: z.string().min(1, "Kabupaten / Kota Sekolah wajib diisi"),
    jenjang_sekolah: z.string().min(1, "Jenjang Sekolah wajib dipilih"),
    sekolah: z.string().min(1, "Nama Sekolah wajib diisi"),
    jurusan_sekolah: z.string().min(1, "Jurusan Sekolah wajib diisi"),
    tahun_lulus: z.string().min(1, "Tahun Lulus wajib diisi"),
    nama_jurusan_sekolah: z.string().min(1, "Nama Jurusan wajib diisi"),

    kondisi_buta_warna: z.string().min(1, "Kondisi Buta Warna wajib diisi"),
    pilihan_program_studi: z
      .array(
        z.object({
          perguruan_tinggi: z.string().min(1, "Wajib dipilih"),
          program_studi: z.string().min(1, "Wajib dipilih"),
        }),
      )
      .min(1),

    jalur: z.string().min(1, "Jalur wajib dipilih"),
    id_verifikasi: z.string().optional(),
    suku_lainnya: z.string().optional(),
  };

  return z.object({ ...baseFields });
};

// ============================================================
// editBeasiswaSchema — data LAMA, semua foto opsional
// ============================================================
export const editBeasiswaSchema = () =>
  createBeasiswaSchema()
    .omit({
      foto: true,
      foto_depan: true,
      foto_samping_kiri: true,
      foto_samping_kanan: true,
      foto_belakang: true,
    })
    .merge(
      z.object({
        // Foto profil — opsional saat edit
        foto: fotoOptionalSchema,
        // 4 foto badan — opsional saat edit (sudah ada sebelumnya)
        foto_depan: fotoOptionalSchema,
        foto_samping_kiri: fotoOptionalSchema,
        foto_samping_kanan: fotoOptionalSchema,
        foto_belakang: fotoOptionalSchema,
      }),
    );

// ============================================================
// createBeasiswaDraftSchema — semua foto opsional
// ============================================================
export const createBeasiswaDraftSchema = () => {
  return z.object({
    nama_lengkap: z.string().optional(),
    nik: z
      .string()
      .trim()
      .length(16, "NIK harus 16 digit")
      .regex(/^\d{16}$/, "NIK harus 16 digit angka")
      .refine((val) => !/^0+$/.test(val), "NIK tidak valid"),
    nkk: z.string().optional(),
    jenis_kelamin: z.string().optional(),
    no_hp: z.string().optional(),
    email: z.string().optional(),
    tanggal_lahir: z.string().optional(),
    tempat_lahir: z.string().optional(),
    agama: z.string().optional(),
    suku: z.string().optional(),
    suku_lainnya: z.string().optional(),
    pekerjaan: z.string().optional(),
    instansi_pekerjaan: z.string().optional(),
    berat_badan: z.string().optional(),
    tinggi_badan: z.string().optional(),

    // ── Semua foto opsional untuk draft ──
    foto: fotoOptionalSchema,
    foto_depan: fotoOptionalSchema,
    foto_samping_kiri: fotoOptionalSchema,
    foto_samping_kanan: fotoOptionalSchema,
    foto_belakang: fotoOptionalSchema,

    tinggal_provinsi: z.string().optional(),
    tinggal_kabkot: z.string().optional(),
    tinggal_kecamatan: z.string().optional(),
    tinggal_kelurahan: z.string().optional(),
    tinggal_dusun: z.string().optional(),
    tinggal_rt: z.string().optional(),
    tinggal_rw: z.string().optional(),
    tinggal_kode_pos: z.string().optional(),
    tinggal_alamat: z.string().optional(),

    kerja_provinsi: z.string().optional(),
    kerja_kabkot: z.string().optional(),
    kerja_kecamatan: z.string().optional(),
    kerja_kelurahan: z.string().optional(),
    kerja_dusun: z.string().optional(),
    kerja_rt: z.string().optional(),
    kerja_rw: z.string().optional(),
    kerja_kode_pos: z.string().optional(),
    kerja_alamat: z.string().optional(),

    alamat_kerja_sama_dengan_tinggal: z.boolean().optional(),

    // Data Ayah
    ayah_nama: z.string().min(1, "Nama Ayah wajib diisi"),
    ayah_nik: z
      .string()
      .min(16, "NIK Ayah harus 16 digit")
      .max(16, "NIK Ayah harus 16 digit"),
    ayah_jenjang_pendidikan: z
      .string()
      .min(1, "Jenjang Pendidikan Ayah wajib diisi"),
    ayah_pekerjaan: z.string().min(1, "Pekerjaan Ayah wajib diisi"),
    ayah_penghasilan: z.string().min(1, "Penghasilan Ayah wajib diisi"),
    ayah_status_hidup: z.string().min(1, "Status Hidup Ayah wajib diisi"),
    ayah_status_kekerabatan: z
      .string()
      .min(1, "Status Kekerabatan Ayah wajib diisi"),
    ayah_alamat: z.string().min(1, "Alamat Ayah wajib diisi"),
    ayah_tempat_lahir: z.string().min(1, "Tempat Lahir Ayah wajib diisi"),
    ayah_tanggal_lahir: z.string().min(1, "Tanggal Lahir Ayah wajib diisi"),
    ayah_no_hp: z.string().min(1, "No. Telepon Ayah wajib diisi"),
    ayah_email: z
      .string()
      .email("Format Email Ayah tidak valid")
      .optional()
      .or(z.literal("")),

    // Data Ibu
    ibu_nama: z.string().min(1, "Nama Ibu wajib diisi"),
    ibu_nik: z
      .string()
      .min(16, "NIK Ibu harus 16 digit")
      .max(16, "NIK Ibu harus 16 digit"),
    ibu_jenjang_pendidikan: z
      .string()
      .min(1, "Jenjang Pendidikan Ibu wajib diisi"),
    ibu_pekerjaan: z.string().min(1, "Pekerjaan Ibu wajib diisi"),
    ibu_penghasilan: z.string().min(1, "Penghasilan Ibu wajib diisi"),
    ibu_status_hidup: z.string().min(1, "Status Hidup Ibu wajib diisi"),
    ibu_status_kekerabatan: z
      .string()
      .min(1, "Status Kekerabatan Ibu wajib diisi"),
    ibu_alamat: z.string().min(1, "Alamat Ibu wajib diisi"),
    ibu_tempat_lahir: z.string().min(1, "Tempat Lahir Ibu wajib diisi"),
    ibu_tanggal_lahir: z.string().min(1, "Tanggal Lahir Ibu wajib diisi"),
    ibu_no_hp: z.string().min(1, "No. Telepon Ibu wajib diisi"),
    ibu_email: z
      .string()
      .email("Format Email Ibu tidak valid")
      .optional()
      .or(z.literal("")),
    // Data Wali (opsional)
    wali_nama: z.string().optional(),
    wali_nik: z.string().optional(),
    wali_jenjang_pendidikan: z.string().optional(),
    wali_pekerjaan: z.string().optional(),
    wali_penghasilan: z.string().optional(),
    wali_status_hidup: z.string().optional(),
    wali_status_kekerabatan: z.string().optional(),
    wali_alamat: z.string().optional(),
    wali_tempat_lahir: z.string().optional(),
    wali_tanggal_lahir: z.string().optional(),
    wali_no_hp: z.string().optional(),
    wali_email: z
      .string()
      .email("Format Email Wali tidak valid")
      .optional()
      .or(z.literal("")),

    sekolah_provinsi: z.string().optional(),
    sekolah_kabkot: z.string().optional(),
    jenjang_sekolah: z.string().optional(),
    sekolah: z.string().optional(),
    jurusan_sekolah: z.string().optional(),
    tahun_lulus: z.string().min(1, "Tahun Lulus wajib diisi"),
    nama_jurusan_sekolah: z.string().optional(),

    kondisi_buta_warna: z.string().optional(),
    pilihan_program_studi: z
      .array(
        z.object({
          perguruan_tinggi: z.string().min(1),
          program_studi: z.string().min(1),
        }),
      )
      .optional(),
    jalur: z.string().optional(),
    id_verifikasi: z.string().optional(),
  });
};

export const BeasiswaSchemaUnion = z.union([
  createBeasiswaSchema(),
  createBeasiswaDraftSchema(),
  editBeasiswaSchema(),
]);

export type BeasiswaFormData = z.infer<typeof BeasiswaSchemaUnion>;

export { createBeasiswaSchema };

export interface InitialTransaksiRequest {
  id_ref_beasiswa: number;
  nama_beasiswa: string;
}

export interface FullDataBeasiswa {
  data_beasiswa: ITrxBeasiswa;
  persyaratan_umum: ITrxDokumenUmum[];
  persyaratan_khusus: ITrxDokumenKhusus[];
  persyaratan_dinas: ITrxDokumenDinas[];
}

export interface CatatanDataSection {
  id: number;

  id_trx_beasiswa: number | null;

  data_pribadi_is_valid: "Y" | "N" | null;
  data_pribadi_catatan: string | null;

  data_tempat_tinggal_is_valid: "Y" | "N" | null;
  data_tempat_tinggal_catatan: string | null;

  data_tempat_bekerja_is_valid: "Y" | "N" | null;
  data_tempat_bekerja_catatan: string | null;

  data_orang_tua_is_valid: "Y" | "N" | null;
  data_orang_tua_catatan: string | null;

  data_pendidikan_is_valid: "Y" | "N" | null;
  data_pendidikan_catatan: string | null;

  data_program_studi_is_valid: "Y" | "N" | null;
  data_program_studi_catatan: string | null;

  created_at: string | null;
  created_by: string | null;
}

const persyaratanSchema = z
  .object({
    id: z.string(),
    kategori: z.enum(["Umum", "Khusus", "Dinas"]),
    is_valid: z.enum(["Y", "N"], {
      required_error: "Kesesuaian wajib dipilih",
    }),
    catatan: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.is_valid === "N" && !data.catatan?.trim()) {
      ctx.addIssue({
        path: ["catatan"],
        message: "Catatan wajib diisi jika persyaratan tidak sesuai",
        code: z.ZodIssueCode.custom,
      });
    }
  });

const persyaratanDinasSchema = z
  .object({
    id: z.string().optional(),
    kategori: z.enum(["Umum", "Khusus", "Dinas"]).optional(),
    is_valid: z.enum(["Y", "N"], {
      required_error: "Kesesuaian wajib dipilih",
    }),
    catatan: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.is_valid === "N" && !data.catatan?.trim()) {
      ctx.addIssue({
        path: ["catatan"],
        message: "Catatan wajib diisi jika persyaratan tidak sesuai",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const verifikasiSchema = z
  .object({
    catatan: z.string().optional(),
    selectedStatus: z.number().optional(),
    kode_dinas_provinsi: z.string().optional(),
    kode_dinas_kabkota: z.string().optional(),
    data_pribadi_is_valid: z
      .string()
      .min(1, "Kesesuaian Data Pribadi wajib dipilih"),
    data_pribadi_catatan: z.string().optional(),

    _uploadFile: z.any().optional(),
    _selectedFile: z.any().optional(),

    data_tempat_tinggal_is_valid: z
      .string()
      .min(1, "Kesesuaian Data Tempat Tinggal wajib dipilih"),
    data_tempat_tinggal_catatan: z.string().optional(),

    data_orang_tua_is_valid: z
      .string()
      .min(1, "Kesesuaian Data Orang Tua wajib dipilih"),
    data_orang_tua_catatan: z.string().optional(),

    data_tempat_bekerja_is_valid: z
      .string()
      .min(1, "Kesesuaian Data Tempat Bekerja / Kebun wajib dipilih"),
    data_tempat_bekerja_catatan: z.string().optional(),

    data_pendidikan_is_valid: z
      .string()
      .min(1, "Kesesuaian Data Pendidikan wajib dipilih"),
    data_pendidikan_catatan: z.string().optional(),

    data_program_studi_is_valid: z
      .string()
      .min(1, "Kesesuaian Data program studi wajib dipilih"),
    data_program_studi_catatan: z.string().optional(),

    data_persyaratan_umum: z.array(persyaratanSchema),
    data_persyaratan_khusus: z.array(persyaratanSchema),
    data_persyaratan_dinas: z.array(persyaratanDinasSchema),
    fileSuratKeputusan: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.selectedStatus === 6) {
      if (!data.kode_dinas_provinsi || data.kode_dinas_provinsi.trim() === "") {
        ctx.addIssue({
          path: ["kode_dinas_provinsi"],
          message: "Provinsi wajib diisi untuk status Lulus Administrasi",
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.kode_dinas_kabkota || data.kode_dinas_kabkota.trim() === "") {
        ctx.addIssue({
          path: ["kode_dinas_kabkota"],
          message: "Kabupaten/Kota wajib diisi untuk status Lulus Administrasi",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    const rules = [
      {
        isValid: data.data_pribadi_is_valid,
        catatan: data.data_pribadi_catatan,
        field: "data_pribadi_catatan",
        message:
          "Catatan wajib diisi jika Data Pribadi dinyatakan tidak sesuai",
      },
      {
        isValid: data.data_tempat_tinggal_is_valid,
        catatan: data.data_tempat_tinggal_catatan,
        field: "data_tempat_tinggal_catatan",
        message:
          "Catatan wajib diisi jika Data Tempat Tinggal dinyatakan tidak sesuai",
      },
      {
        isValid: data.data_orang_tua_is_valid,
        catatan: data.data_orang_tua_catatan,
        field: "data_orang_tua_catatan",
        message:
          "Catatan wajib diisi jika Data Orang Tua dinyatakan tidak sesuai",
      },
      {
        isValid: data.data_tempat_bekerja_is_valid,
        catatan: data.data_tempat_bekerja_catatan,
        field: "data_tempat_bekerja_catatan",
        message:
          "Catatan wajib diisi jika Data Tempat Bekerja / Kebun dinyatakan tidak sesuai",
      },
      {
        isValid: data.data_pendidikan_is_valid,
        catatan: data.data_pendidikan_catatan,
        field: "data_pendidikan_catatan",
        message:
          "Catatan wajib diisi jika Data Pendidikan dinyatakan tidak sesuai",
      },
      {
        isValid: data.data_program_studi_is_valid,
        catatan: data.data_program_studi_catatan,
        field: "data_program_studi_catatan",
        message:
          "Catatan wajib diisi jika Data Pendidikan dinyatakan tidak sesuai",
      },
    ];

    rules.forEach((rule) => {
      if (
        rule.isValid === "N" &&
        (!rule.catatan || rule.catatan.trim() === "")
      ) {
        ctx.addIssue({
          path: [rule.field],
          message: rule.message,
          code: z.ZodIssueCode.custom,
        });
      }
    });
  });

export type VerifikasiFormData = z.infer<typeof verifikasiSchema>;

export const verifikasiDinasSchema = z
  .object({
    catatan: z.string().optional(),
    selectedStatus: z.number().optional(),
  })
  .refine(
    (data) => {
      if (data.selectedStatus === 9) {
        return data.catatan && data.catatan.trim().length > 0;
      }
      return true;
    },
    {
      message: "Catatan wajib diisi",
      path: ["catatan"],
    },
  );

export type VerifikasiDinasFormData = z.infer<typeof verifikasiDinasSchema>;
