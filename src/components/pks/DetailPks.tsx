import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Calendar, School, GraduationCap } from "lucide-react";
import type { ITrxPks } from "@/types/pks";
import { formatTanggalIndo } from "@/utils/dateFormatter";

interface DetailPksProps {
  dataPks?: ITrxPks;
}

export const DetailPks: React.FC<DetailPksProps> = ({ dataPks }) => {
  return (
    <Card className="shadow-none">
      <CardContent className="space-y-4">
        <h1 className="text-lg font-semibold">Informasi PKS</h1>
        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* No PKS */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-muted-foreground">
              <FileText className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-xs text-muted-foreground">No. PKS</div>
              <div className="font-medium">{dataPks?.no_pks || "-"}</div>
            </div>
          </div>

          {/* Tanggal PKS */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-muted-foreground">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-xs text-muted-foreground">Tanggal PKS</div>
              <div className="font-medium">
                {formatTanggalIndo(dataPks?.tanggal_pks) || "-"}
              </div>
            </div>
          </div>

          {/* Lembaga Pendidikan */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-muted-foreground">
              <School className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-xs text-muted-foreground">
                Lembaga Pendidikan
              </div>
              <div className="font-medium">
                {dataPks?.lembaga_pendidikan || "-"}
              </div>
            </div>
          </div>

          {/* Jenjang */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-xs text-muted-foreground">Jenjang</div>
              <div className="font-medium">{dataPks?.jenjang || "-"}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
