/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFetchChitPayouts } from "@/hooks/use-fetch-chit-payouts";
import {
  formatAmount,
  formatDate,
  getAuctionUserPayableAmount,
} from "@/lib/utils";
import {
  MoreHorizontalIcon,
  RefreshCcwIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
  CalendarIcon,
  BanknoteIcon,
} from "lucide-react";
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
import { Skeleton } from "../ui/skeleton";
import React from "react";
import { ChitMonthContext } from "@/context/MonthContext";
import { ChitContext } from "@/context/ChitContext";
import { AuctionUserPayoutForm } from "./auction-user-payout-form";
import { toast } from "sonner";
import { PAYMENT_TYPE_LABELS } from "@/constants";
import type { ChitPayment } from "@/types";

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
    return getAuctionUserPayableAmount({ chit: chitDetails, month }) ?? 0;
  }, [month, chitDetails]);

  const totalPaid = React.useMemo(
    () => (payouts ?? []).reduce((acc, p) => acc + (Number(p?.amount) || 0), 0),
    [payouts],
  );

  const remaining = Math.max(0, Number(payableAmount) - Number(totalPaid));

  // ── UI state ───────────────────────────────────────────────────────────────
  const [adding, setAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null | undefined>(
    null,
  );
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<
    string | null | undefined
  >(null);
  const [deletingId, setDeletingId] = React.useState<string | null | undefined>(
    null,
  );

  const handleEdit = (payout: ChitPayment) => {
    const id = payout?.id;
    setEditingId((prev) => (prev === id ? null : id));
    setConfirmDeleteId(null);
    setAdding(false);
  };

  const handleDeleteRequest = (payout: ChitPayment) => {
    const id = payout?.id;
    setConfirmDeleteId((prev) => (prev === id ? null : id));
    setEditingId(null);
  };

  const handleDelete = async (payout: ChitPayment) => {
    const id = payout?.id;
    setDeletingId(id);
    try {
      const res = await fetch("/api/payments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payout deleted", { position: "top-right" });
        refetchPayouts();
      } else {
        toast.error(data.error ?? "Failed to delete payout", {
          position: "top-right",
        });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong", {
        position: "top-right",
      });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // ── Mobile list ────────────────────────────────────────────────────────────
  const MobileList = () => {
    if (payoutsLoading) {
      return (
        <div className="space-y-2 sm:hidden">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!payouts?.length) return null;

    return (
      <div className="space-y-2 sm:hidden">
        {payouts.map((payoutObj) => {
          const id = payoutObj?.id;
          const isEditing = editingId === id;
          const isConfirmingDelete = confirmDeleteId === id;
          const isDeleting = deletingId === id;

          return (
            <div
              key={id}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* Header row */}
              <div className="flex items-center justify-between gap-2 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold tabular-nums">
                    {payoutObj.amount
                      ? formatAmount(Number(payoutObj.amount))
                      : "—"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="size-3 shrink-0" />
                      {formatDate(payoutObj.payment_date ?? null)}
                    </span>
                    {payoutObj.payment_type && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <BanknoteIcon className="size-3 shrink-0" />
                          {PAYMENT_TYPE_LABELS[payoutObj.payment_type] ??
                            payoutObj.payment_type}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {!isEditing && !isConfirmingDelete && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEdit(payoutObj)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Edit payout"
                      >
                        <PencilIcon className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRequest(payoutObj)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        title="Delete payout"
                      >
                        <Trash2Icon className="size-3.5" />
                      </button>
                    </>
                  )}

                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Delete confirmation */}
              {isConfirmingDelete && (
                <div className="border-t border-border px-4 py-3 flex items-center justify-between gap-3 bg-red-50 dark:bg-red-950/30">
                  <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                    Delete this payout?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2.5 py-1 rounded-md text-xs border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(payoutObj)}
                      disabled={isDeleting}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              )}

              {/* Inline edit form */}
              {isEditing && (
                <div className="border-t border-border px-4 py-3">
                  <AuctionUserPayoutForm
                    mode="edit"
                    payout={payoutObj}
                    amountPreset={Number(payoutObj.amount) ?? 0}
                    auctionUserId={month?.auction_user ?? ""}
                    chitId={chitId}
                    monthId={monthId}
                    onCancel={() => setEditingId(null)}
                    refetch={() => {
                      setEditingId(null);
                      refetchPayouts();
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

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
            <TableSkletonRows rowsCount={3} colsCount={4} />
          ) : (
            payouts?.map((payoutObj) => {
              const id = payoutObj?.id;
              const isEditing = editingId === id;
              const isConfirmingDelete = confirmDeleteId === id;
              const isDeleting = deletingId === id;

              return (
                <React.Fragment key={id}>
                  <TableRow>
                    <TableCell className="font-medium tabular-nums">
                      {payoutObj.amount
                        ? formatAmount(Number(payoutObj.amount))
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {formatDate(payoutObj.payment_date ?? null)}
                    </TableCell>
                    <TableCell>
                      {payoutObj.payment_type
                        ? (PAYMENT_TYPE_LABELS[payoutObj.payment_type] ??
                          payoutObj.payment_type)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0"
                          >
                            <MoreHorizontalIcon className="size-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEdit(payoutObj)}
                          >
                            <PencilIcon className="size-3.5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950"
                            onClick={() => handleDeleteRequest(payoutObj)}
                          >
                            <Trash2Icon className="size-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  {/* Delete confirmation row */}
                  {isConfirmingDelete && (
                    <TableRow className="bg-red-50 dark:bg-red-950/30 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <TableCell colSpan={4} className="py-2.5 px-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                            Are you sure you want to delete this payout?
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white border-0"
                              disabled={isDeleting}
                              onClick={() => handleDelete(payoutObj)}
                            >
                              {isDeleting ? "Deleting…" : "Delete"}
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Inline edit row */}
                  {isEditing && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={4} className="py-3 px-4 bg-muted/20">
                        <AuctionUserPayoutForm
                          mode="edit"
                          payout={payoutObj}
                          amountPreset={Number(payoutObj.amount) ?? 0}
                          auctionUserId={month?.auction_user ?? ""}
                          chitId={chitId}
                          monthId={monthId}
                          onCancel={() => setEditingId(null)}
                          refetch={() => {
                            setEditingId(null);
                            refetchPayouts();
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
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
            ({payouts?.length ?? 0})
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
            onClick={() => {
              setAdding((v) => !v);
              setEditingId(null);
              setConfirmDeleteId(null);
            }}
            disabled={!month?.auction_user || payableAmount <= 0}
          >
            {adding ? "Close" : "Add payout"}
          </Button>
        </div>
      </div>

      {/* Summary card */}
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
                refetch={() => {
                  setAdding(false);
                  refetchPayouts();
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <MobileList />
      <DesktopTable />
    </div>
  );
};
