import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Calendar } from "lucide-react";

export const TidakAdaBeasiswaAktif = () => {
  return (
    <Card className="w-[840px] shadow-sm border-2 border-dashed border-gray-300 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <CardContent className="px-8 py-12">
        <div className="flex flex-col items-center text-center gap-5">
          {/* Animated Icon Container */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-2xl opacity-40 animate-pulse"></div>

            {/* Icon */}
            <div className="relative bg-white p-5 rounded-2xl border-2 border-gray-200 shadow-lg">
              <GraduationCap className="h-14 w-14 text-gray-400" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3 max-w-md">
            <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
              Pendaftaran Belum Dibuka
            </h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Saat ini belum ada program beasiswa yang tersedia. Program
              beasiswa akan segera dibuka, pantau terus halaman ini untuk
              informasi terbaru.
            </p>
          </div>

          {/* Decorative Divider */}
          <div className="flex items-center gap-3 w-full max-w-xs mt-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <Calendar className="h-4 w-4 text-gray-400" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
