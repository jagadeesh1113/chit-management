"use client";

import { useFetchChitPayouts } from "@/hooks/use-fetch-chit-payouts";
import {
  formatAmount,
  formatDate,
  getAuctionUserPayableAmount,
} from "@/lib/utils";
import { MoreHorizontalIcon, RefreshCcwIcon } from "lucide-react";
import { TableSkletonRows } from "../table-skleton-rows";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import React from "react";
import { ChitMonthContext } from "@/context/MonthContext";
import { ChitContext } from "@/context/ChitContext";
import { AuctionUserPayoutForm } from "./auction-user-payout-form";
import { toast } from "sonner";
import { PAYMENT_TYPE_LABELS } from "@/constants";

export const ChitPayouts = ({
  chitId,
  monthId,
}: {
  chitId: string;
  monthId: string;
}) => {
  const {
    values: payouts,
    loading: payoutsLoading,
    refetch: refetchPayouts,
  } = useFetchChitPayouts(monthId, chitId);

  const { values: months } = React.useContext(ChitMonthContext);
  const { chitDetails } = React.useContext(ChitContext);

  const month = React.useMemo(
    () => months?.find((m) => m.id === monthId) ?? null,
    [months, monthId],
  );

  const payableAmount = React.useMemo(() => {
    if (!month || !chitDetails) return 0;
    return (
      getAuctionUserPayableAmount({
        chit: chitDetails,
        month,
      }) ?? 0
    );
  }, [month, chitDetails]);

  const totalPaid = React.useMemo(
    () => (payouts ?? []).reduce((acc, p) => acc + (Number(p?.amount) || 0), 0),
    [payouts],
  );

  const remaining = Math.max(0, Number(payableAmount) - Number(totalPaid));

  const [adding, setAdding] = React.useState(false);

  // ── Action menu (shared) ───────────────────────────────────────────────────
  const ActionMenu = (payoutId?: string) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 shrink-0">
          <MoreHorizontalIcon className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() =>
            toast.message("Edit is available in Monthly drawer for now.", {
              position: "top-right",
            })
          }
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            toast.message(
              payoutId
                ? "Delete is available in Monthly drawer for now."
                : "Select a payout to delete.",
              { position: "top-right" },
            )
          }
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // ── Desktop table ──────────────────────────────────────────────────────────
  const DesktopTable = () => (
    <div className="hidden sm:block rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="font-medium">Amount</TableHead>
            <TableHead className="font-medium">Payment Date</TableHead>
            <TableHead className="font-medium">Payment Type</TableHead>
            <TableHead className="text-right font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payoutsLoading ? (
            <TableSkletonRows rowsCount={5} colsCount={4} />
          ) : (
            payouts?.map((payoutObj) => (
              <TableRow key={payoutObj.payout_id ?? payoutObj.id}>
                <TableCell className="font-medium tabular-nums">
                  {payoutObj?.amount
                    ? formatAmount(Number(payoutObj.amount))
                    : "—"}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {formatDate(payoutObj?.payment_date)}
                  </div>
                </TableCell>
                <TableCell>
                  {payoutObj?.payment_type
                    ? (PAYMENT_TYPE_LABELS[payoutObj.payment_type] ??
                      payoutObj.payment_type)
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {ActionMenu(payoutObj.payout_id ?? payoutObj.id)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold sm:text-base">
          Payouts{" "}
          <span className="text-muted-foreground font-normal">
            ({payouts?.length})
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetchPayouts}
            disabled={payoutsLoading}
            className="h-8 px-2 sm:px-3"
          >
            <RefreshCcwIcon
              className={`size-3.5 ${payoutsLoading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setAdding((v) => !v)}
            disabled={!month?.auction_user || payableAmount <= 0}
          >
            {adding ? "Close" : "Add payout"}
          </Button>
        </div>
      </div>

      <Card className="mb-3 shadow-none">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Payout summary</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-[11px] text-muted-foreground">Payable</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums">
                {formatAmount(Number(payableAmount))}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-[11px] text-muted-foreground">Paid</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-green-700 dark:text-green-400">
                {totalPaid > 0 ? formatAmount(totalPaid) : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-[11px] text-muted-foreground">Pending</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                {remaining > 0 ? formatAmount(remaining) : "—"}
              </p>
            </div>
          </div>

          {adding && (
            <div className="mt-3">
              <AuctionUserPayoutForm
                mode="create"
                amountPreset={remaining > 0 ? remaining : Number(payableAmount)}
                auctionUserId={month?.auction_user ?? ""}
                chitId={chitId}
                monthId={monthId}
                onCancel={() => setAdding(false)}
                refetch={refetchPayouts}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <DesktopTable />
    </div>
  );
};
