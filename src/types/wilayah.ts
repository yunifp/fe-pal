export interface IWilayah {
  id: number;
  kode_wilayah: string;
  nama_wilayah: string;
  kode_pro?: string;
  kode_kab?: string;
  kode_kec?: string;
  tingkat: number;
  created_at?: string;
  updated_at?: string;
}


export interface IReferensiWilayah {
  wilayah_id: number;
  nama_wilayah: string;
  tingkat_label: string;
  kode_pro: number;
  kode_kab: number;
  kode_kec: number;
  kode_kel: number;
}

export interface PaginatedReferensiWilayahResponse {
  result: IReferensiWilayah[];
  total: number;
  current_page: number;
  total_pages: number;
}