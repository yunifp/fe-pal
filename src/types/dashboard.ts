// Tambahkan/Pastikan ada interface ini
export interface SebaranWilayahRow {
  tinggal_kode_prov: string;
  tinggal_prov: string;
  jumlah_pendaftar: number;
}

export interface DashboardStatsResponse {
  jumlah_peminat: number;
  jumlah_pendaftar: number;
  total_provinsi_sebaran: number;
  detail_sebaran_wilayah: SebaranWilayahRow[]; // <-- TAMBAHKAN BARIS INI KEMBALI
}

export interface PeriodeBeasiswa {
  id: number;
  nama_beasiswa: string;
  status_aktif: string;
}

export interface DashboardMasterStatsResponse {
  jumlah_prodi: number;
  total_kuota: number;
  list_periode: PeriodeBeasiswa[];
}