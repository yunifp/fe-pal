import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";

export const HomeGreeting = () => {
  const [now, setNow] = useState(new Date());
  const user = useAuthStore((state) => state.user);

  const showTime = true;

  useEffect(() => {
    if (!showTime) return;

    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [showTime]);

  const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-lg font-semibold text-gray-900">
        Selamat datang{user?.nama ? `, ${user.nama}` : ""}
      </h1>

      <p className="text-sm text-gray-500">
        {dateFormatter.format(now)}
        {showTime && ` • ${timeFormatter.format(now)}`}
      </p>
    </div>
  );
};
