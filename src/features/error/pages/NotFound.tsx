import { useNavigate } from "react-router-dom";
import NotFoundSvg from "@/assets/images/not-found.svg";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center font-inter">
      <div className="max-w-md">
        <img
          src={NotFoundSvg}
          alt="Halaman Tidak Ditemukan"
          className="w-full h-auto mb-6"
        />
        <h1 className="text-2xl font-bold mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-gray-500 mb-6">
          Maaf, halaman yang kamu cari tidak tersedia atau mungkin sudah
          dipindahkan. Pastikan URL sudah benar.
        </p>
        <Button onClick={() => navigate(-1)} className="hover:cursor-pointer">
          Kembali
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
