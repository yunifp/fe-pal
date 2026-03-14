import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

interface ModernTableProps {
  headers: string[];
  rows: (string | number | React.ReactNode)[][];
  emptyMessage?: string;
}

const ModernTable = ({
  headers,
  rows,
  emptyMessage = "Data belum tersedia",
}: ModernTableProps) => (
  <div className="rounded-lg border overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow className="bg-green-50 hover:bg-green-50">
          {headers.map((h) => (
            <TableHead key={h} className="font-medium text-black">
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={headers.length}
              className="text-center text-muted-foreground py-6"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row, i) => (
            <TableRow key={i} className="hover:bg-muted/30">
              {row.map((cell, idx) => (
                <TableCell key={idx} className="font-medium">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
);

export default ModernTable;
