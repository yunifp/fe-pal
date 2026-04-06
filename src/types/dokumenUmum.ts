export interface IDokumenUmum {
  id: number;
  persyaratan: string;
  status_aktif: "Y" | "N";
  valid_type: string;
  is_required: "Y" | "N";
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedDokumenUmumResponse {
  result: IDokumenUmum[];
  total: number;
  current_page: number;
  total_pages: number;
}