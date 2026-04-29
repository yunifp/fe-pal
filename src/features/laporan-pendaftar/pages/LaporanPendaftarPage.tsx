/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { laporanPendaftarService } from "@/services/laporanPendaftarService";
import { nikCekalService } from "@/services/nikCekalService"; // ✅ IMPORT SERVICE MASTER CEKAL
import { DataTable } from "@/components/DataTable";
import { getColumns, getCekalColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download } from "lucide-react";
import { toast } from "sonner";

const TIPE_LAPORAN_OPTIONS = [
    { value: "1", label: "Data Pendaftar Aktif" },
    { value: "2", label: "Data Pendaftar Non Aktif" },
    { value: "3", label: "Data Pendaftar Cekal" },
    { value: "4", label: "Data Pendaftar Lulus Seleksi Administrasi" },
    { value: "5", label: "Data Pendaftar Lulus Verifikasi" },
    { value: "6", label: "Data Pendaftar Lulus Tes Seleksi" },
    { value: "7", label: "Data Pendaftar Menerima Beasiswa" },
];

const LaporanPendaftarPage: React.FC = () => {
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>("");
    const [searchInput, setSearchInput] = useState<string>("");
    const [tipeLaporan, setTipeLaporan] = useState<string>("1");
    const [idJalur, setIdJalur] = useState<string>(""); 
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const limit = 10;

    const { data: jalurRes } = useQuery({
        queryKey: ["jalur-list-from-trx"],
        queryFn: () => laporanPendaftarService.getJalurList(),
        refetchOnWindowFocus: false,
    });
    const listJalur = jalurRes?.data || [];

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        setPage(1);
    }, [tipeLaporan, idJalur]);

    // === FETCH DATA TABEL DINAMIS ===
    // ✅ Tambahkan <any> di useQuery untuk mengatasi Error Union Types
    const { data: response, isLoading } = useQuery<any>({
        queryKey: ["laporan-pendaftar", page, search, tipeLaporan, idJalur],
        queryFn: async () => {
            if (tipeLaporan === "3") {
                return await nikCekalService.getPaginated(page, search);
            }
            return await laporanPendaftarService.getPaginated(page, search, tipeLaporan, idJalur);
        },
        refetchOnWindowFocus: false,
    });

    const tableData = response?.data?.result || [];
    const totalPages = response?.data?.total_pages || 1;

    // === HANDLER EXPORT EXCEL DINAMIS ===
    const handleExportExcel = async () => {
        try {
            setIsExporting(true);
            toast.info("Sedang menyiapkan file Excel...");

            let blobData;
            // ✅ EXPORT EXCEL DINAMIS
            if (tipeLaporan === "3") {
                blobData = await nikCekalService.exportExcel(search);
            } else {
                blobData = await laporanPendaftarService.exportExcel(search, tipeLaporan, idJalur);
            }

            const url = window.URL.createObjectURL(new Blob([blobData]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", tipeLaporan === "3" ? "Rekap_Data_Cekal.xlsx" : `Rekap_Pendaftar_Tipe_${tipeLaporan}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("File Excel berhasil diunduh!");
        } catch (error) {
            console.error("Gagal export:", error);
            toast.error("Gagal mengunduh file Excel.");
        } finally {
            setIsExporting(false);
        }
    };

    const columns = useMemo(() => {
        if (tipeLaporan === "3") {
            return getCekalColumns(page, limit) as any;
        }
        return getColumns(page, limit) as any;
    }, [tipeLaporan, page, limit]);

    return (
        <div className="p-6 space-y-6">
            <CustBreadcrumb items={[{ name: "Laporan Rekap Pendaftar", url: "/laporan/pendaftar" }]} />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Laporan Rekap List Pendaftar</h1>
                    <p className="text-sm text-gray-500">Lihat dan unduh rekapitulasi data pendaftar berdasarkan status.</p>
                </div>
                <Button onClick={handleExportExcel} disabled={isExporting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? "Mengunduh..." : "Download Rekap File Excel"}
                </Button>
            </div>
            
            <Card className="shadow-sm border border-gray-200">
                <CardHeader className="border-b bg-gray-50/80 p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <select
                                className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
                                value={tipeLaporan}
                                onChange={(e) => setTipeLaporan(e.target.value)}
                            >
                                {TIPE_LAPORAN_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>

                            <select
                                className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-48 disabled:opacity-50"
                                value={idJalur}
                                onChange={(e) => setIdJalur(e.target.value)}
                                disabled={tipeLaporan === "3"} 
                            >
                                <option value="">Semua Jalur</option>
                                {listJalur.length > 0 ? (
                                    listJalur.map((namaJalur: string) => (
                                        <option key={namaJalur} value={namaJalur}>{namaJalur}</option>
                                    ))
                                ) : (
                                    <option disabled>Loading jalur...</option>
                                )}
                            </select>
                        </div>

                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Cari Nama / NIK / Kode..."
                                className="pl-9 h-9 border-gray-300 w-full"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-4">
                    {isLoading ? (
                        <div className="py-12 text-center text-gray-500 animate-pulse">Memuat laporan pendaftar...</div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={tableData}
                            pageCount={totalPages}
                            pageIndex={page - 1}
                            onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default LaporanPendaftarPage;