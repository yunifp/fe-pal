import { z } from "zod";

export interface PaginatedRoleResponse {
  result: IRole[];
  total: number;
  current_page: number;
  total_pages: number;
}

export interface IRole {
  id: number;
  nama: string;
}

// Skema validasi form
export const roleSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
});

// Tipe data form
export type RoleFormData = z.infer<typeof roleSchema>;

// Untuk kirim data HTTP
export interface RoleRequest {
  nama: string;
}
