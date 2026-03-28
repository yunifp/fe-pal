 
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { getPenetapanColumns } from "../components/columns"; // Pastikan path ini benar
import { penetapanService } from "../../../services/penetapanService";
import { ArrowLeft, Eye, Users } from "lucide-react";

const BACKEND_PUBLIC_URL = "http://localhost:3003/uploads"; 

const PenetapanDetailPage = () => {
  const { id } = useParams(); // Ambil ID dari URL
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  const { data: response, isLoading } = useQuery({
    queryKey: ["penetapan-detail", pageIndex, search, id],
    queryFn: () => penetapanService.getListDetail(pageIndex + 1, pageSize, search, id),
  });

  const { data: docResponse } = useQuery({
    queryKey: ["cek-dokumen-penetapan"],
    queryFn: () => penetapanService.cekDokumenPenetapan(),
  });

  const rawData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;
  const totalData = response?.data?.total || 0;
  const uploadedFilename = docResponse?.data?.filename;

  const columns = useMemo(() => getPenetapanColumns(pageIndex, pageSize), [pageIndex, pageSize]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-8">
      <div className="max-w-screen-2xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 pt-6">
        
        <CustBreadcrumb items={[{ name: "Beasiswa" }, { name: "Penetapan" }, { name: "Detail Peserta" }]} />
        {/* Tombol Kembali & Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/penetapan")} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Penetapan
          </Button>

          {uploadedFilename && (
            <Button onClick={() => window.open(`${BACKEND_PUBLIC_URL}/${uploadedFilename}`, "_blank")} className="bg-violet-600 hover:bg-violet-700 text-white">
              <Eye className="h-4 w-4 mr-2" /> Lihat Dokumen SK / Pengesahan
            </Button>
          )}
        </div>

        <Card className="border-0 shadow-md rounded-2xl bg-white border-t-4 border-t-violet-500">
          <CardHeader className="bg-violet-50/30 border-b pb-4 px-6 pt-6">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-600" />
              Detail Peserta Penetapan
              <span className="bg-violet-100 text-violet-700 text-xs py-1 px-2 rounded-md ml-2 font-semibold">
                Total: {totalData} Peserta
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <DataTable
              isLoading={isLoading}
              columns={columns}
              data={rawData}
              pageCount={totalPages}
              pageIndex={pageIndex}
              onPageChange={setPageIndex}
              searchValue={search}
              onSearchChange={(val) => { setSearch(val); setPageIndex(0); }}
            />
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default PenetapanDetailPage;