// src/types/nikCekal.ts

export interface INikCekal {
  id: number;
  nik: string;
  nama: string | null;
  keterangan: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedNikCekalResponse {
  result: INikCekal[];
  total: number;
  current_page: number;
  total_pages: number;
}