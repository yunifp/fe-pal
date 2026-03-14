import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Calendar, GraduationCap, Building2 } from "lucide-react";
import { pksService } from "@/services/pksService";
import type { ITrxPks } from "@/types/pks";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import ListMahasiswa from "../components/ListMahasiswa";
const STALE_TIME = 5 * 60 * 1000;

const StatusAktifMahasiswaPage = () => {
  const [selectedPksId, setSelectedPksId] = useState<string>("");

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["pks"],
    queryFn: () => pksService.getAllPks(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const data: ITrxPks[] = response?.data ?? [];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const selectedPks = data.find((pks) => pks.id.toString() === selectedPksId);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Gagal memuat data PKS. Silakan coba lagi.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <CustBreadcrumb
        items={[
          {
            name: "Update Status Aktif Mahasiswa",
            url: "/database/update-status-aktif-mahasiswa",
          },
        ]}
      />

      <p className="text-xl font-semibold mt-4">
        Update Status Aktif Mahasiswa
      </p>

      <Card className="shadow-none mt-3">
        <CardHeader>
          <CardTitle>Pilih Perjanjian Kerjasama (PKS)</CardTitle>
          <CardDescription>
            Silakan pilih PKS dari daftar di bawah ini
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pks-select">PKS</Label>
            <Select value={selectedPksId} onValueChange={setSelectedPksId}>
              <SelectTrigger id="pks-select" className="w-full">
                <SelectValue placeholder="Pilih PKS..." />
              </SelectTrigger>
              <SelectContent className="font-inter">
                {data.map((pks) => (
                  <SelectItem key={pks.id} value={pks.id.toString()}>
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {pks.no_pks || `PKS #${pks.id}`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {pks.lembaga_pendidikan || "Lembaga tidak tersedia"} •{" "}
                          {pks.jenjang || "Jenjang tidak tersedia"} •{" "}
                          {pks.tahun_angkatan || "Jenjang tidak tersedia"}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPks && (
            <Card className="border-2 border-primary/20 bg-primary/5 shadow-none">
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Nomor PKS
                      </p>
                      <p className="font-semibold">
                        {selectedPks.no_pks || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Tanggal PKS
                      </p>
                      <p className="font-semibold">
                        {formatDate(selectedPks.tanggal_pks)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Lembaga Pendidikan
                      </p>
                      <p className="font-semibold">
                        {selectedPks.lembaga_pendidikan || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Jenjang
                      </p>
                      <p className="font-semibold">
                        {selectedPks.jenjang || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {selectedPks && (
        <div className="mt-3">
          <ListMahasiswa dataPks={selectedPks} />
        </div>
      )}

      {!selectedPksId && data.length > 0 && (
        <Card className="border-dashed border-primary mt-3 shadow-none">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col gap-4 items-center justify-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center">
                <FileText className="h-12 w-12 text-primary" />
              </div>
              <p className="text-md text-muted-foreground">
                Pilih PKS untuk melihat detail dan daftar mahasiswa
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default StatusAktifMahasiswaPage;
