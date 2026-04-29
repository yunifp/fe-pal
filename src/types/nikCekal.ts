export interface INikCekal {
  id: number;
  nik: string;
  nama?: string;
  tahun?: string;
  keterangan?: string;
  is_aktif?: "Y" | "N";
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedNikCekalResponse {
  result: INikCekal[];
  total: number;
  current_page: number;
  total_pages: number;
}