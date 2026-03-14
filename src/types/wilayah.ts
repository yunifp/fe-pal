export interface IWilayah {
  id: number;
  kode_wilayah: string;
  nama_wilayah: string;
  kode_pro?: string;
  kode_kab?: string;
  kode_kec?: string;
  tingkat: number;
  created_at?: string;
  updated_at?: string;
}
