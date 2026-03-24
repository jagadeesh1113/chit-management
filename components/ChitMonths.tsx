/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { TableSkletonRows } from "./table-skleton-rows";
import { useFetchChitMonths } from "@/hooks/use-fetch-chit-months";
import { AddMonths } from "./add-months";
import React from "react";
import { MemberContext } from "@/context/MemberContext";
import { MonthlyPaymentsDrawer } from "./MonthlyPaymentsDrawer";
import { Button } from "./ui/button";
import {
  CalendarIcon,
  EyeIcon,
  TrophyIcon,
  IndianRupeeIcon,
  UsersIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { DeleteMonthDialog } from "./delete-month-dialog";
import { Skeleton } from "./ui/skeleton";

// ── Formatters ────────────────────────────────────────────────────────────────
const fmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ── Payments progress badge ───────────────────────────────────────────────────
const PaymentsBadge = ({ count, total }: { count: number; total: number }) => {
  const allPaid = count === total && total > 0;
  return (
    <span
      className={
        allPaid
          ? "inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-300"
          : "inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"
      }
    >
      {allPaid ? (
        <span className="size-1.5 rounded-full bg-green-500 inline-block" />
      ) : (
        <span className="size-1.5 rounded-full bg-amber-400 inline-block" />
      )}
      {count} / {total}
    </span>
  );
};

export const ChitMonths = ({ chitId }: { chitId: string }) => {
  const {
    loading,
    values,
    refetch: fetchChitMonths,
  } = useFetchChitMonths(chitId);
  const { values: members } = React.useContext(MemberContext);
  const [selectedMonth, setSelectedMonth] = React.useState<null | any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [selectedMonthToDelete, setSelectedMonthToDelete] = React.useState<
    null | any
  >(null);

  const handleSelectMonthlyPayments = (monthObj: any) => {
    setSelectedMonth(monthObj);
    setIsDrawerOpen(true);
  };

  const handleDeleteMonth = (monthObj: any) => {
    setSelectedMonthToDelete(monthObj);
  };

  const handleResetDelete = () => {
    setSelectedMonthToDelete(null);
  };

  // ── Mobile cards ──────────────────────────────────────────────────────────
  const MobileList = () => {
    if (loading) {
      return (
        <div className="space-y-2 sm:hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-2/5" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2 sm:hidden">
        {values?.map((auctionObj: any) => {
          const memberDetails: any = members?.find(
            (m: any) => m?.id === auctionObj?.auction_user,
          );
          const hasAuction = !!auctionObj?.auction_amount;

          return (
            <div
              key={auctionObj.id}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* Header row */}
              <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">
                    {auctionObj?.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                    <CalendarIcon className="size-3 shrink-0" />
                    {formatDate(auctionObj?.auction_date)}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => handleSelectMonthlyPayments(auctionObj)}
                  >
                    <EyeIcon className="size-3.5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontalIcon className="size-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleSelectMonthlyPayments(auctionObj)}
                      >
                        View payments
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:bg-red-100 focus:text-red-600 dark:focus:bg-red-900"
                        onClick={() => handleDeleteMonth(auctionObj)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
                <div className="px-3 py-2.5">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <IndianRupeeIcon className="size-3" />
                    Auction
                  </p>
                  <p className="text-xs font-semibold mt-0.5 tabular-nums">
                    {hasAuction
                      ? fmt.format(Number(auctionObj.auction_amount))
                      : "—"}
                  </p>
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrophyIcon className="size-3" />
                    Winner
                  </p>
                  <p className="text-xs font-semibold mt-0.5 truncate">
                    {memberDetails?.name ?? "—"}
                  </p>
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <UsersIcon className="size-3" />
                    Paid
                  </p>
                  <div className="mt-0.5">
                    <PaymentsBadge
                      count={auctionObj?.payments_count ?? 0}
                      total={members?.length ?? 20}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ── Desktop table ─────────────────────────────────────────────────────────
  const DesktopTable = () => (
    <div className="hidden sm:block rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="font-medium">Month</TableHead>
            <TableHead className="font-medium">Auction Date</TableHead>
            <TableHead className="font-medium">Auction Amount</TableHead>
            <TableHead className="font-medium">Winner</TableHead>
            <TableHead className="font-medium">Payments</TableHead>
            <TableHead className="text-right font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkletonRows rowsCount={5} colsCount={6} />
          ) : (
            values?.map((auctionObj: any) => {
              const memberDetails: any = members?.find(
                (m: any) => m?.id === auctionObj?.auction_user,
              );
              const hasAuction = auctionObj?.auction_amount >= 0;

              return (
                <TableRow
                  key={auctionObj.id}
                  className="cursor-pointer"
                  onClick={() => handleSelectMonthlyPayments(auctionObj)}
                >
                  <TableCell className="font-medium">
                    {auctionObj?.name}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarIcon className="size-3.5 shrink-0" />
                      {formatDate(auctionObj?.auction_date)}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium tabular-nums">
                    {hasAuction ? (
                      fmt.format(Number(auctionObj.auction_amount))
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {memberDetails?.name ? (
                      <span className="flex items-center gap-1.5 text-sm">
                        <TrophyIcon className="size-3.5 text-amber-500 shrink-0" />
                        {memberDetails.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <PaymentsBadge
                      count={auctionObj?.payments_count ?? 0}
                      total={members?.length ?? 20}
                    />
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreHorizontalIcon className="size-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleSelectMonthlyPayments(auctionObj)
                            }
                          >
                            View payments
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:bg-red-100 focus:text-red-600 dark:focus:bg-red-900"
                            onClick={() => handleDeleteMonth(auctionObj)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold sm:text-base">Chit Months</h2>
        <AddMonths chitId={chitId} refetch={fetchChitMonths} />
      </div>
      <MobileList />
      <DesktopTable />
      <MonthlyPaymentsDrawer
        month_name={selectedMonth?.name}
        month_id={selectedMonth?.id}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        month={selectedMonth}
        chit_id={chitId}
      />
      <DeleteMonthDialog
        selectedMonthDetails={selectedMonthToDelete}
        deleted={!!selectedMonthToDelete}
        onReset={handleResetDelete}
        refetch={fetchChitMonths}
      />
    </div>
  );
};
