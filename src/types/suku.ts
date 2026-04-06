export interface ISukuMaster {
  id: number;
  nama_suku: string;
  is_active: "Y" | "N";
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedSukuMasterResponse {
  result: ISukuMaster[];
  total: number;
  current_page: number;
  total_pages: number;
}