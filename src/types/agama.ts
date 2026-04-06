export interface IAgama {
  id: number;
  nama_agama: string;
  is_active: "Y" | "N";
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedAgamaResponse {
  result: IAgama[];
  total: number;
  current_page: number;
  total_pages: number;
}