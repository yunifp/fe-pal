import { Card, CardContent } from "@/components/ui/card";
import type { IPerguruanTinggi } from "@/types/master";
import { AlertCircle, MapPin } from "lucide-react";

interface LpCardProps {
  data: IPerguruanTinggi;
  onClick?: (data: IPerguruanTinggi) => void;
}

const JENIS_COLOR: Record<string, string> = {
  universitas: "bg-blue-50 text-blue-700 border-blue-200",
  institut: "bg-purple-50 text-purple-700 border-purple-200",
  politeknik: "bg-emerald-50 text-emerald-700 border-emerald-200",
  akademi: "bg-rose-50 text-rose-700 border-rose-200",
  sekolah: "bg-amber-50 text-amber-700 border-amber-200",
};

function getJenisColor(jenis: string) {
  for (const key of Object.keys(JENIS_COLOR)) {
    if (jenis.toLowerCase().includes(key)) return JENIS_COLOR[key];
  }
  return "bg-slate-50 text-slate-600 border-slate-200";
}

export function LpCard({ data, onClick }: LpCardProps) {
  const isAktif = data.status_aktif === 1;
  const hasPengajuan = data.has_pengajuan_perubahan === 1;

  const initials = (data.singkatan ?? data.nama_pt)
    .slice(0, data.singkatan ? 3 : 2)
    .toUpperCase();

  return (
    <Card
      onClick={() => onClick?.(data)}
      className={`
        group relative overflow-hidden border transition-all duration-150
        hover:shadow-md hover:-translate-y-px cursor-pointer select-none
        ${isAktif ? "bg-white border-slate-200" : "bg-slate-50 border-slate-200 opacity-60"}
      `}
    >
      {/* top accent */}
      <div
        className={`absolute inset-x-0 top-0 h-0.5 ${isAktif ? "bg-gradient-to-r from-sky-400 to-indigo-500" : "bg-slate-300"}`}
      />

      <CardContent className="p-3.5 flex items-center gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          {data.logo_path ? (
            <img
              src={data.logo_path}
              alt={data.nama_pt}
              className="w-10 h-10 rounded-lg object-contain border border-slate-200 bg-white p-0.5"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs tracking-wide">
              {initials}
            </div>
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
              {data.nama_pt}
            </p>
            {hasPengajuan && (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
          </div>

          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${getJenisColor(data.jenis)}`}
            >
              {data.jenis}
            </span>

            {data.kode_pt && (
              <span className="text-[10px] font-mono text-slate-400">
                {data.kode_pt}
              </span>
            )}

            {data.kota && (
              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                <MapPin className="w-2.5 h-2.5" />
                {data.kota}
              </span>
            )}
          </div>
        </div>

        {/* Status dot */}
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span
            className={`w-2 h-2 rounded-full ${isAktif ? "bg-emerald-500" : "bg-slate-300"}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
