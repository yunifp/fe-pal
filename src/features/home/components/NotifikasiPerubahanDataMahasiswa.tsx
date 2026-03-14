import type {
  NotifikasiItem,
  StatistikPerubahanDataMahasiswa,
} from "@/types/statistik";
import CardStatistik from "./CardStatistik";
import { Activity, Award, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { statistikService } from "@/services/statistikService";
import { STALE_TIME } from "@/constants/reactQuery";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, any> = {
  "Perubahan Rekening": CreditCard,
  "Perubahan Status Aktif": Activity,
  "Perubahan IPK": Award,
};

const routeMap: Record<string, string> = {
  "Perubahan Rekening":
    "/database/perubahan-data-mahasiswa?jenis_perubahan=rekening",
  "Perubahan Status Aktif":
    "/database/perubahan-data-mahasiswa?jenis_perubahan=status_aktif",
  "Perubahan IPK": "/database/perubahan-data-mahasiswa?jenis_perubahan=ipk",
};

const NotifikasiPerubahanDataMahasiswa = () => {
  const navigate = useNavigate();

  const { data: response, isLoading } = useQuery({
    queryKey: ["statistik", "perubahan-data-mahasiswa"],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return statistikService.getPerubahanDataMahasiswa();
    },
    staleTime: STALE_TIME,
  });

  const data: StatistikPerubahanDataMahasiswa[] = response?.data ?? [];

  const notifikasiList: NotifikasiItem[] = data.map((item) => ({
    icon: iconMap[item.nama],
    title: item.nama,
    value: item.jumlah.toString(),
    onClick: routeMap[item.nama]
      ? () => navigate(routeMap[item.nama])
      : undefined,
  }));

  return (
    <div>
      <h3 className="font-medium mb-1">Notifikasi Perubahan Data</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-24" />
            ))
          : notifikasiList.map((item, index) => (
              <CardStatistik
                key={index}
                icon={item.icon}
                title={item.title}
                value={item.value}
                onClick={item.onClick}
              />
            ))}
      </div>
    </div>
  );
};

export default NotifikasiPerubahanDataMahasiswa;
