export interface IWilayahKhusus {
  wilayah_id: number;
  kode_pro: number;
  nama_provinsi: string;
  kode_kab: number;
  nama_kabkota: string;
  wilayah_3t: boolean; // Disesuaikan
  wilayah_perbatasan: boolean; // Disesuaikan
  wilayah_papua_nusateng: boolean; // Disesuaikan
  is_khusus: boolean;
}

export interface PaginatedWilayahKhususResponse {
  result: IWilayahKhusus[];
  total: number;
  current_page: number;
  total_pages: number;
}