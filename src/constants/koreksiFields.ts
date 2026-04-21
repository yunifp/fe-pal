export interface KoreksiFieldItem {
  field: string;
  label: string;
  catatan: string;
}

export const KOREKSI_FIELDS = [
  { field: "nama_lengkap", label: "Nama Lengkap", section: "Data Pribadi" },
  { field: "nik", label: "NIK / No. KTP", section: "Data Pribadi" },
  { field: "nkk", label: "No. Kartu Keluarga", section: "Data Pribadi" },
  { field: "jenis_kelamin", label: "Jenis Kelamin", section: "Data Pribadi" },
  { field: "no_hp", label: "No. Telepon", section: "Data Pribadi" },
  { field: "email", label: "Email", section: "Data Pribadi" },
  { field: "tanggal_lahir", label: "Tanggal Lahir", section: "Data Pribadi" },
  { field: "tempat_lahir", label: "Tempat Lahir", section: "Data Pribadi" },
  { field: "agama", label: "Agama", section: "Data Pribadi" },
  { field: "suku", label: "Suku", section: "Data Pribadi" },
  { field: "berat_badan", label: "Berat Badan", section: "Data Pribadi" },
  { field: "tinggi_badan", label: "Tinggi Badan", section: "Data Pribadi" },
  {
    field: "tinggal_alamat",
    label: "Alamat Tinggal",
    section: "Data Tempat Tinggal",
  },
  {
    field: "kerja_alamat",
    label: "Alamat Kerja/Kebun",
    section: "Data Tempat Tinggal",
  },
  { field: "ayah_nama", label: "Nama Ayah", section: "Data Orang Tua" },
  { field: "ayah_nik", label: "NIK Ayah", section: "Data Orang Tua" },
  { field: "ibu_nama", label: "Nama Ibu", section: "Data Orang Tua" },
  { field: "ibu_nik", label: "NIK Ibu", section: "Data Orang Tua" },
  { field: "sekolah", label: "Nama Sekolah", section: "Data Pendidikan" },
  {
    field: "jenjang_sekolah",
    label: "Jenjang Sekolah",
    section: "Data Pendidikan",
  },
  { field: "tahun_lulus", label: "Tahun Lulus", section: "Data Pendidikan" },
  {
    field: "kondisi_buta_warna",
    label: "Kondisi Buta Warna",
    section: "Data Pendidikan",
  },
];
