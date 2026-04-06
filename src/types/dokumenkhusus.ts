export interface IDokumenKhusus {
  id: number;
  id_jalur: number;
  persyaratan: string;
  status_aktif: "Y" | "N";
  valid_type: string;
  is_required: "Y" | "N";
  created_at?: string;
  updated_at?: string;
  jalur_ref?: {
    id: number;
    jalur: string;
  };
}

export interface PaginatedDokumenKhususResponse {
  result: IDokumenKhusus[];
  total: number;
  current_page: number;
  total_pages: number;
}