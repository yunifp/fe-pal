import { useState, useEffect, type FC, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { IBeasiswa } from "@/types/beasiswa";

interface CountdownProps {
  beasiswa: IBeasiswa;
}

const Countdown: FC<CountdownProps> = ({ beasiswa }) => {
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
    const timer = setInterval(() => {
      const diff = endDate.getTime() - Date.now();

      if (diff <= 0) {
        clearInterval(timer);
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      {/* Ukuran font angka mengecil di HP (text-3xl) dan besar di tablet/desktop (sm:text-5xl) */}
      <div className="text-3xl sm:text-5xl font-bold text-green-600">
        {String(value).padStart(2, "0")}
      </div>
      {/* Ukuran font label juga disesuaikan */}
      <div className="text-xs sm:text-sm text-green-600/70 mt-1">{label}</div>
    </div>
  );

  return (
    <Card>
      {/* Padding card disesuaikan biar nggak buang tempat di HP */}
      <CardContent className="px-4 py-6 sm:px-12 sm:py-6">
        {/* Judul */}
        <div className="text-center mb-6">
          <p className="text-sm sm:text-md text-foreground">
            Pendaftaran Beasiswa Akan Ditutup Dalam :
          </p>
        </div>

        {/* Countdown */}
        <div className="flex justify-center items-center gap-2 sm:gap-4 flex-wrap">
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
  // Titik dua juga dikecilin biar balance sama angkanya
  <div className="text-2xl sm:text-4xl font-bold text-green-600 -mt-4 sm:-mt-6">:</div>
);

export default Countdown;