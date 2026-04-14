/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { getPenetapanColumns } from "../components/columns"; 
import { penetapanService } from "../../../services/penetapanService";
import { ArrowLeft, Eye, Users, Download } from "lucide-react"; 
import { BEASISWA_SERVICE_BASE_URL } from "@/constants/api"; 
import { toast } from "sonner"; 

const getUploadUrl = () => {
  try {
    const origin = new URL(BEASISWA_SERVICE_BASE_URL).origin;
    return `${origin}/uploads`;
  } catch (error) {
    return "/uploads";
  }
};

const BACKEND_PUBLIC_URL = getUploadUrl(); 

const PenetapanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;
  
  const [isDownloading, setIsDownloading] = useState(false); 

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

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await penetapanService.downloadDataPenetapan(id);
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Data_Peserta_Diterima_${id || 'All'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Data berhasil diunduh!");
    } catch (error) {
      toast.error("Gagal mengunduh data.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        
        <CustBreadcrumb items={[{ name: "Beasiswa" }, { name: "Penetapan" }, { name: "Detail Peserta" }]} />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate("/penetapan")} 
            className="w-fit text-slate-600 hover:text-slate-900 border-slate-200 shadow-sm rounded-xl h-11 px-5 transition-all bg-white hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-slate-400" /> Kembali
          </Button>

          <div className="flex flex-wrap items-center gap-3">
            <Button 
              onClick={handleDownload} 
              disabled={isDownloading || totalData === 0}
              variant="outline"
              className="border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 rounded-xl h-11 px-5 shadow-sm transition-all"
            >
              <Download className="h-4 w-4 mr-2" /> 
              {isDownloading ? "Mengunduh..." : "Download Data"}
            </Button>

            {uploadedFilename && (
              <Button 
                onClick={() => window.open(`${BACKEND_PUBLIC_URL}/${uploadedFilename}`, "_blank")} 
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-11 px-5 shadow-md transition-all font-semibold"
              >
                <Eye className="h-4 w-4 mr-2" /> Lihat Dokumen SK
              </Button>
            )}
          </div>
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 px-8 pt-7">
            <CardTitle className="text-xl text-slate-800 font-bold flex flex-wrap items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              Detail Peserta Penetapan
              <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm py-1 px-3 rounded-lg ml-auto sm:ml-2 font-bold shadow-sm">
                Total: {totalData}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6 sm:p-8">
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
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default PenetapanDetailPage;