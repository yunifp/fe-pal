import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { TablePagination } from "./TablePagination";
import { useState } from "react";
import { Search, X, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  pageIndex: number;
  onPageChange: (pageIndex: number) => void;
  leftHeaderContent?: React.ReactNode;
  rightHeaderContent?: React.ReactNode;
  isLoading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pageIndex,
  onPageChange,
  leftHeaderContent,
  rightHeaderContent,
  isLoading,
  searchValue,
  onSearchChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    pageCount,
    state: {
      sorting,
      columnVisibility,
      pagination: { pageIndex, pageSize: 10 },
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater(table.getState().pagination)
          : updater;
      onPageChange(newState.pageIndex);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3 flex-wrap">
          <DropdownMenu>
            <DropdownMenuContent align="start" className="rounded-xl shadow-lg border-slate-100">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize text-sm rounded-md"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }>
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
            <Input
              placeholder="Cari data..."
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 pr-10 h-10 w-full sm:w-72 text-sm tracking-normal rounded-full border-slate-200 bg-slate-50/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-sm"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange?.("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {leftHeaderContent}
        </div>

        <div className="flex items-center gap-2">{rightHeaderContent}</div>
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <Table className="text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-b border-slate-200 bg-slate-50/80">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-12 px-5 text-xs font-semibold text-slate-600 tracking-wider uppercase whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow
                  key={`skeleton-${i}`}
                  className="border-b border-slate-100 animate-pulse">
                  {columns.map((_, j) => (
                    <TableCell
                      key={`skeleton-cell-${j}`}
                      className="px-5 py-4">
                      {j === 1 ? (
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0 bg-slate-100" />
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-32 rounded-md bg-slate-100" />
                            <Skeleton className="h-2.5 w-20 rounded-md bg-slate-100" />
                          </div>
                        </div>
                      ) : j === columns.length - 1 ? (
                        <Skeleton className="h-8 w-28 rounded-lg bg-slate-100" />
                      ) : (
                        <Skeleton className="h-3 w-24 rounded-md bg-slate-100" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50/60 data-[state=selected]:bg-emerald-50/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-5 py-3.5 text-sm leading-snug text-slate-700">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                    <div className="p-4 bg-slate-50 rounded-full">
                      <Inbox className="h-8 w-8 opacity-40 text-slate-500" />
                    </div>
                    <p className="text-sm font-medium tracking-normal text-slate-500">
                      Tidak ada data ditemukan
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="pt-2">
        <TablePagination table={table} />
      </div>
    </div>
  );
}