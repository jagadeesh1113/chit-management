"use client";
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export const TableSkletonRows = ({
  rowsCount,
  colsCount,
}: {
  rowsCount: number;
  colsCount: number;
}) => {
  return Array.from({ length: rowsCount }).map((_, index) => (
    <TableRow key={index}>
      <TableCell colSpan={colsCount}>
        <Skeleton className="h-8 w-full" />
      </TableCell>
    </TableRow>
  ));
};
