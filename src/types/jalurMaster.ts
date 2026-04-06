export interface IJalurMaster {
  id: number;
  jalur: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedJalurMasterResponse {
  result: IJalurMaster[];
  total: number;
  current_page: number;
  total_pages: number;
}