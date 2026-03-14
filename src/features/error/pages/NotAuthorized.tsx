import { useNavigate } from "react-router-dom";
import NotAuthorizedSvg from "@/assets/images/unauthorized.svg";
import { Button } from "@/components/ui/button";

const NotAuthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center font-inter">
      <div className="max-w-md">
        <img
          src={NotAuthorizedSvg}
          alt="Not Authorized"
          className="w-full h-auto mb-6"
        />
        <h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1>
        <p className="text-gray-500 mb-6">
          Kamu tidak memiliki akses ke halaman ini.
        </p>
        <Button onClick={() => navigate(-1)} className="hover: cursor-pointer">
          Kembali
        </Button>
      </div>
    </div>
  );
};

export default NotAuthorized;
