import { Button } from "@/components/ui/button";
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
import { logPerubahanService } from "@/services/logPerubahanService";
import type { ListIpkWithMahasiswa } from "@/types/validitasIpkMahasiswa";
import { Loader2, Upload } from "lucide-react";
import { useState } from "react";

interface Props {
  idTrxPks: string;
  semester: number;
  data: ListIpkWithMahasiswa[];
}

const ITEMS_PER_PAGE = 10;

const ListIpk = ({ idTrxPks, semester, data }: Props) => {
  const [ipkPerMahasiswa, setIpkPerMahasiswa] = useState<
    Record<number, number | null>
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
    const nilai = ipkPerMahasiswa[idMahasiswa];
    if (nilai === null || nilai === undefined) return;

    try {
      setIsSaving(idMahasiswa);
      await logPerubahanService.postPerubahanIpkBulk(
        idMahasiswa,
        Number(idTrxPks),
        [{ nilai, semester: Number(semester) }],
      );
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
                <TableHead className="font-medium text-black ">IPK</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground py-6"
                  >
                    Tidak ada data
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => (
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
                        <div className="flex items-center gap-2 w-56">
                          <input
                            type="number"
                            step="0.01"
                            min={0}
                            max={4}
                            value={ipkPerMahasiswa[item.id] ?? ""}
                            disabled={isSaving === item.id}
                            onChange={(e) => {
                              const value = e.target.value;
                              setIpkPerMahasiswa((prev) => ({
                                ...prev,
                                [item.id]: value === "" ? null : Number(value),
                              }));
                            }}
                            className="w-full rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleUpdate(item.id)}
                            disabled={
                              ipkPerMahasiswa[item.id] === null ||
                              ipkPerMahasiswa[item.id] === undefined ||
                              isSaving === item.id
                            }
                          >
                            {isSaving === item.id ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Upload className="h-3 w-3" />
                                Update
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
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

export default ListIpk;
