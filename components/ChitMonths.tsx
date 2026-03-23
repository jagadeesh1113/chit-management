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
import { CalendarIcon, EyeIcon } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

export const ChitMonths = ({ chitId }: { chitId: string }) => {
  const {
    loading,
    values,
    refetch: fetchChitMonths,
  } = useFetchChitMonths(chitId);
  const { values: members } = React.useContext(MemberContext);
  const [selectedMonth, setSelectedMonth] = React.useState<null | any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const handleSelectMonthlyPayments = (monthObj: any) => {
    setSelectedMonth(monthObj);
    setIsDrawerOpen(true);
  };

  // ── Mobile cards ──────────────────────────────────────────────────────
  const MobileList = () => {
    if (loading) {
      return (
        <div className="space-y-2 sm:hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-3 space-y-2"
            >
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-2/5" />
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
          return (
            <div
              key={auctionObj.id}
              className="rounded-xl border border-border bg-card p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{auctionObj?.name}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="size-3" />
                      {auctionObj?.auction_date ?? "—"}
                    </span>
                    <span>₹{auctionObj?.auction_amount ?? "—"}</span>
                    {memberDetails?.name && (
                      <span>Auction User: {memberDetails.name}</span>
                    )}
                    <span>{auctionObj?.payments_count} / 20 paid</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={() => handleSelectMonthlyPayments(auctionObj)}
                >
                  <EyeIcon className="size-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
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
            <TableHead className="font-medium">Auction Date</TableHead>
            <TableHead className="font-medium">Amount</TableHead>
            <TableHead className="font-medium">Auction User</TableHead>
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
              return (
                <TableRow key={auctionObj.id}>
                  <TableCell className="font-medium">
                    {auctionObj?.name}
                  </TableCell>
                  <TableCell>{auctionObj?.auction_date}</TableCell>
                  <TableCell>{auctionObj?.auction_amount}</TableCell>
                  <TableCell>{memberDetails?.name ?? "—"}</TableCell>
                  <TableCell>{`${auctionObj?.payments_count} / 20`}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => handleSelectMonthlyPayments(auctionObj)}
                    >
                      <EyeIcon className="size-3.5" />
                    </Button>
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
      />
    </div>
  );
};
