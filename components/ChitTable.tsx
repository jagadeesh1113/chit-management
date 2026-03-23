/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkletonRows } from "@/components/table-skleton-rows";
import { Button } from "./ui/button";
import { CalendarIcon, MoreHorizontalIcon, UsersIcon, IndianRupeeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

export const ChitTable = ({
  loading,
  values,
  onSelectChit,
}: {
  loading: boolean;
  values: any[];
  onSelectChit: (_chitObj: { mode: "EDIT" | "DELETE"; details: any }) => void;
}) => {
  const router = useRouter();
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const handleViewChit = (chitObj: any) => router.push(`/chit/${chitObj.id}`);
  const handleEditChit = (chitObj: any) => onSelectChit({ mode: "EDIT", details: chitObj });
  const handleDeleteChit = (chitObj: any) => onSelectChit({ mode: "DELETE", details: chitObj });

  const ActionMenu = ({ chitObj }: { chitObj: any }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 shrink-0">
          <MoreHorizontalIcon className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleViewChit(chitObj)}>View</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEditChit(chitObj)}>Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:bg-red-100 focus:text-red-600 dark:focus:bg-red-900"
          onClick={() => handleDeleteChit(chitObj)}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // ── Mobile card list ──────────────────────────────────────────────────
  const MobileList = () => {
    if (loading) {
      return (
        <div className="space-y-3 sm:hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-6 w-3/5" />
              <div className="flex gap-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!values?.length) {
      return (
        <div className="sm:hidden flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="rounded-full bg-muted p-4">
            <IndianRupeeIcon className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No chits yet</p>
          <p className="text-xs text-muted-foreground">Add your first chit to get started</p>
        </div>
      );
    }

    return (
      <div className="space-y-3 sm:hidden">
        {values.map((chitObj: any) => (
          <div
            key={chitObj.id}
            className="rounded-xl border border-border bg-card p-4 active:bg-accent transition-colors"
            onClick={() => handleViewChit(chitObj)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{chitObj.name}</p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {formatter.format(chitObj.amount)}
                </p>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <ActionMenu chitObj={chitObj} />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <UsersIcon className="size-3" />
                {chitObj.members} members
              </span>
              <span className="flex items-center gap-1">
                <CalendarIcon className="size-3" />
                {chitObj.months} months
              </span>
              <span className="flex items-center gap-1">
                <IndianRupeeIcon className="size-3" />
                {formatter.format(chitObj.charges)}/mo
              </span>
              <span className="flex items-center gap-1">
                Started {chitObj.start_date}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── Desktop table ─────────────────────────────────────────────────────
  const DesktopTable = () => (
    <div className="hidden sm:block rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="font-medium">Name</TableHead>
            <TableHead className="font-medium">Amount</TableHead>
            <TableHead className="font-medium">Members</TableHead>
            <TableHead className="font-medium">Months</TableHead>
            <TableHead className="font-medium">Charges/mo</TableHead>
            <TableHead className="font-medium">Start Date</TableHead>
            <TableHead className="text-right font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkletonRows rowsCount={5} colsCount={7} />
          ) : !values?.length ? (
            <TableRow>
              <TableCell colSpan={7} className="h-40 text-center text-muted-foreground text-sm">
                No chits yet. Add your first chit to get started.
              </TableCell>
            </TableRow>
          ) : (
            values.map((chitObj: any) => (
              <TableRow
                key={chitObj.id}
                className="cursor-pointer"
                onClick={() => handleViewChit(chitObj)}
              >
                <TableCell className="font-medium">{chitObj.name}</TableCell>
                <TableCell>{formatter.format(chitObj.amount)}</TableCell>
                <TableCell>{chitObj.members}</TableCell>
                <TableCell>{chitObj.months}</TableCell>
                <TableCell>{formatter.format(chitObj.charges)}</TableCell>
                <TableCell>{chitObj.start_date}</TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <ActionMenu chitObj={chitObj} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <MobileList />
      <DesktopTable />
    </>
  );
};
