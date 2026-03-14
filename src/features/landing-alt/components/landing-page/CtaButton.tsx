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
        px-8
        py-6
        text-lg
        shadow-lg
      "
    >
      <GraduationCap className="!w-6 !h-6 mr-1" />
      Pendaftaran Beasiswa
    </Button>
  );
};

export default CTAButton;
