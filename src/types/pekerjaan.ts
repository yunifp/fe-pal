export interface IPekerjaan {
  id: number;
  nama_pekerjaan: string;
  is_active: "Y" | "N";
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedPekerjaanResponse {
  result: IPekerjaan[];
  total: number;
  current_page: number;
  total_pages: number;
}