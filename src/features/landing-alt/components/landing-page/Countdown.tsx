import { useState, useEffect, type FC, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { IBeasiswa } from "@/types/beasiswa";

interface CountdownProps {
  beasiswa: IBeasiswa;
  onTimeUp?: () => void;
}

const Countdown: FC<CountdownProps> = ({ beasiswa, onTimeUp }) => {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const endDate = useMemo(() => {
    const raw = beasiswa.tanggal_selesai;
    // handle berbagai format: "2025-12-31", "2025-12-31 23:59:59", "2025-12-31T23:59:59"
    return new Date(raw.includes("T") ? raw : raw.replace(" ", "T"));
  }, [beasiswa.tanggal_selesai]);

  useEffect(() => {
    const checkTime = () => {
      const diff = endDate.getTime() - Date.now();

      if (diff <= 0) {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (onTimeUp) onTimeUp(); // Lapor ke atas saat waktu habis
        return true;
      }

      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
      return false;
    };

    // Cek langsung saat render pertama
    const isExpired = checkTime();
    if (isExpired) return;

    // Jika belum habis, jalankan interval
    const timer = setInterval(() => {
      const expired = checkTime();
      if (expired) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onTimeUp]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center min-w-[60px]">
      <div className="text-3xl sm:text-5xl font-bold text-green-600">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-xs sm:text-sm font-medium text-green-600/80 mt-1">{label}</div>
    </div>
  );

  return (
    // Tambahkan w-fit dan mx-auto agar Card tidak melar, dan tambahkan shadow agar lebih menonjol
    <Card className="mx-auto w-fit shadow-xl border-none">
      {/* Perbesar padding di CardContent agar tidak sesak */}
      <CardContent className="px-6 py-5 sm:px-12 sm:py-8">
        <div className="text-center mb-5">
          <p className="text-sm sm:text-base font-semibold text-slate-700">
            Pendaftaran Beasiswa Akan Ditutup Dalam :
          </p>
        </div>

        <div className="flex justify-center items-center gap-3 sm:gap-6 flex-nowrap">
          {time.days > 0 && (
            <>
              <TimeUnit value={time.days} label="Hari" />
              <Separator />
            </>
          )}
          <TimeUnit value={time.hours} label="Jam" />
          <Separator />
          <TimeUnit value={time.minutes} label="Menit" />
          <Separator />
          <TimeUnit value={time.seconds} label="Detik" />
        </div>
      </CardContent>
    </Card>
  );
};

const Separator = () => (
  <div className="text-2xl sm:text-4xl font-bold text-green-600 -mt-5 sm:-mt-6">:</div>
);

export default Countdown;