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
import { Search, X } from "lucide-react";

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
}: DataTableProps<TData, TValue> & {
  pageCount: number;
  pageIndex: number;
  onPageChange: (pageIndex: number) => void;
}) {
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
      pagination: {
        pageIndex,
        pageSize: 10,
      },
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
    <>
      <div className="rounded-md border">
        <div className="flex items-center justify-between py-4 px-3 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari..."
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchValue && (
                <button
                  onClick={() => onSearchChange?.("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {leftHeaderContent}
          </div>
          <div className="flex items-center gap-2">{rightHeaderContent}</div>
        </div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={`bg-primary text-white`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-16 text-center"
                >
                  <span>Memuat Data...</span>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-3">
        <TablePagination table={table} />
      </div>
    </>
  );
}
