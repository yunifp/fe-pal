import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { type Table as TanstackTable } from "@tanstack/react-table";

type TablePaginationProps<TData> = {
  table: TanstackTable<TData>;
};

export function TablePagination<TData>({ table }: TablePaginationProps<TData>) {
  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex;

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 2; // jumlah halaman di kiri/kanan current page

    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, i) => i);
    }

    pages.push(0); // halaman pertama

    const start = Math.max(currentPage - maxVisible, 1);
    const end = Math.min(currentPage + maxVisible, pageCount - 2);

    if (start > 1) pages.push("ellipsis");

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < pageCount - 2) pages.push("ellipsis");

    pages.push(pageCount - 1); // halaman terakhir

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination>
      <PaginationContent>
        {/* Tombol Previous */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              table.previousPage();
            }}
            className={
              table.getCanPreviousPage() ? "" : "pointer-events-none opacity-50"
            }
          />
        </PaginationItem>

        {/* Tombol Angka dengan Ellipsis */}
        {pageNumbers.map((p, idx) => (
          <PaginationItem key={idx}>
            {p === "ellipsis" ? (
              <span className="px-2">…</span>
            ) : (
              <PaginationLink
                href="#"
                isActive={currentPage === p}
                onClick={(e) => {
                  e.preventDefault();
                  table.setPageIndex(p);
                }}
              >
                {p + 1}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* Tombol Next */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              table.nextPage();
            }}
            className={
              table.getCanNextPage() ? "" : "pointer-events-none opacity-50"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
