import LNavbar from "../components/LNavbar";
import LHero from "../components/LHero";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { beasiswaService } from "@/services/beasiswaService";
import { STALE_TIME } from "@/constants/reactQuery";
import Countdown from "../components/Countdown";

export default function LandingPage() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: responseBeasiswaAktif } = useQuery({
    queryKey: ["beasiswa-aktif"],
    queryFn: () => beasiswaService.getBeasiswaAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const beasiswaAktif = responseBeasiswaAktif?.data ?? null;

  // ✅ buka dialog hanya jika beasiswa aktif ada
  useEffect(() => {
    if (beasiswaAktif) {
      setIsOpen(true);
    }
  }, [beasiswaAktif]);

  return (
    <div className="flex flex-col min-h-screen">
      <LNavbar />
      <LHero />

      {beasiswaAktif && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="font-inter p-0 gap-0">
            <Countdown beasiswa={beasiswaAktif} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
