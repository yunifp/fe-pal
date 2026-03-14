import type { LucideIcon } from "lucide-react";

export interface NotifikasiItem {
  icon: LucideIcon;
  title: string;
  value: string;
  onClick?: () => void;
}

export interface StatistikPengajuan {
  nama: string;
  jumlah: number;
}

export interface StatistikPerubahanDataMahasiswa {
  nama: string;
  jumlah: number;
}
