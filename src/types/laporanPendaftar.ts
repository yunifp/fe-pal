export interface ILaporanPendaftar {
  id_trx_beasiswa: number;
  kode_pendaftaran: string;
  nama_lengkap: string;
  nik: string;
  jalur: string; // Ubah dari object ke string
}

export interface PaginatedLaporanPendaftarResponse {
  result: ILaporanPendaftar[];
  total: number;
  current_page: number;
  total_pages: number;
}