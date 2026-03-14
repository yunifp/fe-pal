import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { STALE_TIME } from "@/constants/reactQuery";
import { authService } from "@/features/Auth/services/authService";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";

interface TableVerifProps {
  id_lembaga_pendidikan: string;
}

export function TableVerif({ id_lembaga_pendidikan }: TableVerifProps) {
  const {
    data: oPresponse,
    isLoading: oPisLoading,
    isError: oPisError,
    error: opError,
  } = useQuery({
    queryKey: ["profil-lembaga-pendidikan", "op-verif", id_lembaga_pendidikan],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => authService.getVerifPt(id_lembaga_pendidikan),
    staleTime: STALE_TIME,
  });

  if (oPisError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Gagal memuat data:{" "}
          {(opError as Error)?.message ?? "Terjadi kesalahan"}
        </AlertDescription>
      </Alert>
    );
  }

  const users = oPresponse?.data ?? [];

  if (oPisLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
          >
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <Users className="h-8 w-8 mb-2 opacity-40" />
        <p className="text-sm">Tidak ada data operator</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors"
        >
          {/* Avatar */}
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.nama_lengkap ?? "avatar"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-primary">
                {user.nama_lengkap?.charAt(0)?.toUpperCase() ?? "?"}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="text-sm font-medium leading-none truncate">
              {user.nama_lengkap ?? "-"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email ?? "-"}
            </p>
            {user.no_hp && (
              <p className="text-xs text-muted-foreground">{user.no_hp}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
