import type { NotifikasiItem, StatistikPengajuan } from "@/types/statistik";
import CardStatistik from "./CardStatistik";
import { Award, BookOpen, Bus, GraduationCap, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { statistikService } from "@/services/statistikService";
import { STALE_TIME } from "@/constants/reactQuery";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, any> = {
  "Biaya Hidup": Wallet,
  "Biaya Pendidikan": GraduationCap,
  "Biaya Buku": BookOpen,
  "Biaya Transportasi": Bus,
  "Biaya Sertifikasi": Award,
};

const routeMap: Record<string, string> = {
  "Biaya Hidup": "/pengajuan-biaya-hidup",
  "Biaya Pendidikan": "/pengajuan-biaya-pendidikan",
  "Biaya Buku": "/pengajuan-biaya-buku",
  "Biaya Transportasi": "/pengajuan-biaya-transportasi",
  "Biaya Sertifikasi": "/pengajuan-biaya-sertifikasi",
};

const NotifikasiPengajuan = () => {
  const navigate = useNavigate();

  const { data: response, isLoading } = useQuery({
    queryKey: ["statistik", "pengajuan-biaya"],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return statistikService.getPengajuanBiaya();
    },
    staleTime: STALE_TIME,
  });

  const data: StatistikPengajuan[] = response?.data ?? [];

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
      <h3 className="font-medium mb-1">Notifikasi Pengajuan</h3>

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

export default NotifikasiPengajuan;
