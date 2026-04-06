export interface IPenghasilan {
  id: number;
  rentang_penghasilan: string;
  is_active: "Y" | "N";
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedPenghasilanResponse {
  result: IPenghasilan[];
  total: number;
  current_page: number;
  total_pages: number;
}