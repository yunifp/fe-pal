import { CustInputRupiah } from "@/components/CustInputRupiah";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ListSertifikasiWithMahasiswa } from "@/types/biayaSertifikasi";
import { Loader2, Upload } from "lucide-react";
import { useState } from "react";

interface Props {
  data: ListSertifikasiWithMahasiswa[];
}

const ITEMS_PER_PAGE = 10;

const FormListBuktiPengeluaran = ({ data }: Props) => {
  const [nominalPerMahasiswa, setNominalPerMahasiswa] = useState<
    Record<number, number | null>
  >({});

  const [filePerMahasiswa, setFilePerMahasiswa] = useState<
    Record<number, File | null>
  >({});

  const [isSaving, setIsSaving] = useState<number | null>(null);
  const [submittedIds, setSubmittedIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const paginatedData = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleUpdate = async (idMahasiswa: number) => {
    const nilai = nominalPerMahasiswa[idMahasiswa];
    if (nilai === null || nilai === undefined) return;

    try {
      setIsSaving(idMahasiswa);

      setSubmittedIds((prev) => new Set(prev).add(idMahasiswa));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-green-50 hover:bg-green-50">
                <TableHead className="font-medium text-black w-12 text-center">
                  #
                </TableHead>
                <TableHead className="font-medium text-black ">Nama</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center text-muted-foreground">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </TableCell>
                  <TableCell>{item.nama ?? "-"}</TableCell>
                  <TableCell>
                    {item.has_diajukan || submittedIds.has(item.id) ? (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200`}
                      >
                        Sudah Diajukan Ke BPDP
                      </span>
                    ) : (
                      <div className="flex items-center gap-2 w-full">
                        <CustInputRupiah
                          label="Nominal"
                          id={`nominal-${item.id}`}
                          value={nominalPerMahasiswa[item.id] ?? 0}
                          disabled={isSaving === item.id}
                          className="w-40"
                          onValueChange={(val) => {
                            setNominalPerMahasiswa((prev) => ({
                              ...prev,
                              [item.id]: val,
                            }));
                          }}
                        />

                        {/* Upload File */}
                        <div className="space-y-1">
                          <Label>Dokumen Salinan Bukti Pengeluaran</Label>
                          <Input
                            type="file"
                            className="w-44"
                            disabled={isSaving === item.id}
                            onChange={(e) => {
                              const file = e.target.files?.[0] ?? null;
                              setFilePerMahasiswa((prev) => ({
                                ...prev,
                                [item.id]: file,
                              }));
                            }}
                          />
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleUpdate(item.id)}
                          disabled={
                            !nominalPerMahasiswa[item.id] ||
                            !filePerMahasiswa[item.id] ||
                            isSaving === item.id
                          }
                        >
                          {isSaving === item.id ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Upload className="h-3 w-3 mr-1" />
                              Upload
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-muted-foreground">
              Menampilkan{" "}
              {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, data.length)}–
              {Math.min(currentPage * ITEMS_PER_PAGE, data.length)} dari{" "}
              {data.length} data
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1,
                  )
                  .reduce<(number | "ellipsis")[]>((acc, page, idx, arr) => {
                    if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                      acc.push("ellipsis");
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          isActive={currentPage === item}
                          onClick={() => setCurrentPage(item)}
                          className="cursor-pointer"
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </>
  );
};

export default FormListBuktiPengeluaran;
