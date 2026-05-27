import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTAButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/pendaftaran-beasiswa")}
      size="lg"
      className="
        btn-cta
        bg-amber-500
        hover:bg-amber-600
        text-white
        w-full
        sm:w-auto
        px-6
        py-4
        sm:px-8
        sm:py-6
        text-base
        sm:text-lg
        shadow-lg
        transition-all
      "
    >
      <GraduationCap className="!w-5 !h-5 sm:!w-6 sm:!h-6 mr-2" />
      Pendaftaran Beasiswa
    </Button>
  );
};

export default CTAButton;