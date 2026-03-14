import { z } from "zod";

export interface PaginatedMenuResponse {
  result: IMenu[];
  total: number;
  current_page: number;
  total_pages: number;
}

export interface IMenu {
  id: number;
  nama: string;
  url: string;
  access: string;
  icon?: string;
  children?: IMenu[];
  parent_id: string | null;
  order: number;
}

// Skema validasi form

export const menuSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  url: z.string().min(1, "URL wajib diisi"),
  icon: z.string().optional(),
  parent_id: z.string().optional(),
  order: z.number({
    required_error: "Urutan wajib diisi",
    invalid_type_error: "Urutan harus berupa angka",
  }),
});

// Tipe data form
export type MenuFormData = z.infer<typeof menuSchema>;

// Untuk kirim data HTTP
export interface MenuRequest {
  nama: string;
  url: string;
  icon?: string;
  parent_id?: string | null;
  order: number;
}

// Data dari API
export interface MenusResponse {
  menus: IMenu[];
}

export interface UpdateAccessMenuRequest {
  id_role: number;
  access: string;
}
