import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileCheck, Users } from "lucide-react";

const totalPendaftar = 1000;
const lulusAdministrasi = 500;

const Ringkasan = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
      {/* Total Pendaftar */}
      <Card className="relative overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-blue-500 to-blue-600">
        <CardContent className="relative p-4">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="p-3 bg-white/20 rounded-lg flex-shrink-0">
              <Users className="h-6 w-6 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-100 mb-1">
                Total Pendaftar
              </p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-bold text-white">
                  {totalPendaftar}
                </h3>
                <span className="text-xs text-blue-100">peserta</span>
              </div>
            </div>

            {/* Badge */}
            <Badge
              variant="outline"
              className="text-xs bg-white/20 text-white border-white/30 flex-shrink-0"
            >
              100%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Lulus Administrasi */}
      <Card className="relative overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-green-500 to-emerald-600">
        <CardContent className="relative p-4">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="p-3 bg-white/20 rounded-lg flex-shrink-0">
              <FileCheck className="h-6 w-6 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-green-100 mb-1">
                Lulus Administrasi
              </p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-bold text-white">
                  {lulusAdministrasi}
                </h3>
                <span className="text-xs text-green-100">peserta</span>
              </div>
            </div>

            {/* Badge */}
            <Badge
              variant="outline"
              className="text-xs bg-white/20 text-white border-white/30 flex-shrink-0"
            >
              {Math.round((lulusAdministrasi / totalPendaftar) * 100)}%
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Ringkasan;
