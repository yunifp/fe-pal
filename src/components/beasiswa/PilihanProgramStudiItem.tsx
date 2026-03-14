// File: @/components/beasiswa/PilihanProgramStudiItem.tsx
import { Card } from "@/components/ui/card";
import { Building2, GraduationCap } from "lucide-react";
import type { IPilihanProgramStudi } from "@/types/beasiswa";

interface PilihanProgramStudiItemProps {
  pilihan: IPilihanProgramStudi;
  index: number;
}

export const PilihanProgramStudiItem = ({
  pilihan,
  index,
}: PilihanProgramStudiItemProps) => {
  const InfoItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value?: string | null;
  }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm mt-1 break-words">{value || "-"}</p>
      </div>
    </div>
  );

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h5 className="font-semibold text-sm flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          Pilihan {index + 1}
        </h5>
      </div>

      <div className="space-y-2">
        <InfoItem
          icon={Building2}
          label="Perguruan Tinggi"
          value={pilihan.nama_pt}
        />
        <InfoItem
          icon={GraduationCap}
          label="Program Studi"
          value={pilihan.nama_prodi}
        />
      </div>
    </Card>
  );
};
