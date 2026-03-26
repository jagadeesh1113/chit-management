/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { TableSkletonRows } from "./table-skleton-rows";
import { Skeleton } from "./ui/skeleton";
import React from "react";
import { toast } from "sonner";
import { CheckIcon, XIcon, ReceiptIcon, ChevronDownIcon } from "lucide-react";
import {
  cn,
  formatAmount,
  getMonthlyPaidAmount,
  getMonthlyPaymentAmount,
} from "@/lib/utils";
import type { Payment, ChitMonth, Chit } from "@/types";
import { MarkPaidForm } from "./mark-paid-form";
import { PaymentHistory } from "./payment-history";
import { OwnerBadge, PaymentStatusBadge } from "./custom-badges";
import {
  getWhatsAppChitMesssageTemplate,
  openWhatsapp,
  WhatsAppIcon,
} from "./whatsapp";

// ── WhatsApp reminder helper ────────────────────────────────────────────────
const openWhatsAppReminder = (
  mobile: string,
  month?: ChitMonth | null,
  chit?: Chit | null,
) => {
  const message = getWhatsAppChitMesssageTemplate({
    chit,
    month,
  });

  openWhatsapp({
    mobile,
    message,
  });
};

// ── Main component ────────────────────────────────────────────────────────────
export const ChitPaymentsTable = ({
  refetch,
  loading,
  values,
  month,
  chit,
}: {
  refetch: () => void;
  loading: boolean;
  values: Payment[];
  month?: ChitMonth | null;
  chit?: Chit | null;
}) => {
  const [error, setError] = React.useState<string | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = React.useState<
    string | null
  >(null);

  const toggleHistory = (id: string) =>
    setExpandedHistoryId((prev) => (prev === id ? null : id));

  const monthlyPaymentAmount = React.useMemo(() => {
    return getMonthlyPaymentAmount({
      month,
      chit,
      isOwnerAuction: month?.is_owner_auction,
    });
  }, [month, chit]);

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const handleMarkUnpaid = async (paymentObj: Payment) => {
    setError(null);
    try {
      const res = await fetch("/api/payments/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: paymentObj?.member_id,
          chit_id: chit?.id,
          month_id: month?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payment marked as unpaid", { position: "top-right" });
        refetch();
      } else {
        setError(data.error ?? "Failed to update payment");
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    }
  };

  // ── Mobile cards ──────────────────────────────────────────────────────────
  const MobileList = () => {
    if (loading) {
      return (
        <div className="space-y-2 p-3 sm:hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-2/5" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2 p-3 sm:hidden">
        {values?.map((paymentObj) => {
          const initials = paymentObj.name
            .split(" ")
            .map((w: string) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          const paidAmount = getMonthlyPaidAmount(paymentObj);
          const pendingAmount = Math.max(0, monthlyPaymentAmount - paidAmount);
          const isPaid = pendingAmount === 0;
          const isPartial = !isPaid && paidAmount > 0;
          const isExpanded = expandedId === paymentObj.member_id;

          return (
            <div
              key={paymentObj.member_id}
              className={cn(
                "rounded-xl border bg-card overflow-hidden transition-colors",
                isPaid
                  ? "border-green-200 dark:border-green-900"
                  : "border-border",
              )}
            >
              {/* Main row */}
              <div className="flex items-center gap-3 p-4">
                {/* Avatar */}
                <div
                  className={cn(
                    "size-9 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold select-none",
                    isPaid
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {initials}
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-sm font-medium truncate leading-tight">
                    {paymentObj.name}
                  </span>
                  {paymentObj?.owner ? <OwnerBadge /> : null}
                </div>

                {/* Status badge */}
                <div className="shrink-0">
                  <PaymentStatusBadge status={isPaid} partial={isPartial} />
                </div>
              </div>

              {/* Amount stats row */}
              <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
                <div className="px-3 py-2">
                  <p className="text-xs text-muted-foreground">Due</p>
                  <p className="text-xs font-semibold tabular-nums mt-0.5">
                    {formatAmount(monthlyPaymentAmount)}
                  </p>
                </div>
                <div className="px-3 py-2">
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="text-xs font-semibold tabular-nums mt-0.5 text-green-700 dark:text-green-400">
                    {paidAmount > 0 ? formatAmount(paidAmount) : "—"}
                  </p>
                </div>
                <div className="px-3 py-2">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p
                    className={`text-xs font-semibold tabular-nums mt-0.5 ${isPaid ? "text-muted-foreground" : "text-amber-600 dark:text-amber-400"}`}
                  >
                    {isPaid ? "—" : formatAmount(pendingAmount)}
                  </p>
                </div>
              </div>

              {/* Payment history toggle */}
              {paymentObj.payments?.length > 0 && (
                <div className="border-t border-border">
                  <button
                    type="button"
                    onClick={() => toggleHistory(paymentObj.member_id)}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <ReceiptIcon className="size-3" />
                      {paymentObj.payments.length} payment
                      {paymentObj.payments.length > 1 ? "s" : ""}
                    </span>
                    <ChevronDownIcon
                      className={cn(
                        "size-3.5 transition-transform duration-200",
                        expandedHistoryId === paymentObj.member_id &&
                          "rotate-180",
                      )}
                    />
                  </button>
                  {expandedHistoryId === paymentObj.member_id && (
                    <div className="px-4 pb-3">
                      <PaymentHistory
                        payments={paymentObj.payments}
                        refetch={refetch}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Action strip */}
              {!isPaid && (
                <div className="px-4 pb-3 space-y-2">
                  {/* WhatsApp reminder */}
                  <button
                    type="button"
                    onClick={() =>
                      openWhatsAppReminder(paymentObj.mobile, month, chit)
                    }
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] text-white py-2 text-xs font-medium hover:bg-[#1ebe5d] transition-colors"
                  >
                    <WhatsAppIcon className="size-3.5" />
                    Send reminder on WhatsApp
                  </button>
                  {/* Mark as paid */}
                  {!isExpanded ? (
                    <button
                      type="button"
                      onClick={() => toggleExpand(paymentObj.member_id)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                    >
                      <CheckIcon className="size-3.5" />
                      Mark as paid
                    </button>
                  ) : (
                    <MarkPaidForm
                      paymentObj={paymentObj}
                      refetch={refetch}
                      onCancel={() => setExpandedId(null)}
                      setExpandedId={setExpandedId}
                      chit={chit}
                      month={month}
                    />
                  )}
                </div>
              )}

              {/* Unpaid action for paid items */}
              {isPaid && (
                <div className="px-4 pb-3">
                  <button
                    type="button"
                    onClick={() => handleMarkUnpaid(paymentObj)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                  >
                    <XIcon className="size-3" />
                    Mark as unpaid
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ── Desktop table ─────────────────────────────────────────────────────────
  const DesktopTable = () => (
    <div className="hidden sm:block">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="font-medium">Name</TableHead>
            <TableHead className="font-medium">Amount</TableHead>
            <TableHead className="font-medium">Paid</TableHead>
            <TableHead className="font-medium">Pending</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="text-right font-medium">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkletonRows rowsCount={5} colsCount={8} />
          ) : (
            values?.map((paymentObj) => {
              const paidAmount = getMonthlyPaidAmount(paymentObj);
              const pendingAmount = Math.max(
                0,
                monthlyPaymentAmount - paidAmount,
              );
              const isPaid = pendingAmount === 0;
              const isPartial = !isPaid && paidAmount > 0;
              return (
                <React.Fragment key={paymentObj.member_id}>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{paymentObj.name}</span>
                        {paymentObj?.owner ? <OwnerBadge /> : null}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {formatAmount(monthlyPaymentAmount)}
                    </TableCell>
                    <TableCell className="tabular-nums text-green-700 dark:text-green-400 font-medium">
                      {paidAmount > 0 ? formatAmount(paidAmount) : "—"}
                    </TableCell>
                    <TableCell>
                      {isPaid ? (
                        <span className="text-sm text-muted-foreground">—</span>
                      ) : (
                        <span className="text-sm font-medium tabular-nums text-amber-600 dark:text-amber-400">
                          {formatAmount(pendingAmount)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <PaymentStatusBadge
                          status={isPaid}
                          partial={isPartial}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isPaid ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkUnpaid(paymentObj)}
                          >
                            Mark Unpaid
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              className="bg-[#25D366] hover:bg-[#1ebe5d] text-white border-0 gap-1.5"
                              onClick={() =>
                                openWhatsAppReminder(
                                  paymentObj.mobile,
                                  month,
                                  chit,
                                )
                              }
                            >
                              <WhatsAppIcon className="size-3.5" />
                              Remind
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleExpand(paymentObj.member_id)}
                            >
                              {expandedId === paymentObj.member_id
                                ? "Cancel"
                                : "Mark Paid"}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Payment history toggle row */}
                  {paymentObj.payments?.length > 0 && (
                    <>
                      <TableRow
                        className="bg-muted/10 hover:bg-muted/20 cursor-pointer"
                        onClick={() => toggleHistory(paymentObj.member_id)}
                      >
                        <TableCell colSpan={6} className="py-2 px-6">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <ReceiptIcon className="size-3" />
                            {paymentObj.payments.length} payment
                            {paymentObj.payments.length > 1 ? "s" : ""}
                            <ChevronDownIcon
                              className={cn(
                                "size-3 ml-auto transition-transform duration-200",
                                expandedHistoryId === paymentObj.member_id &&
                                  "rotate-180",
                              )}
                            />
                          </span>
                        </TableCell>
                      </TableRow>
                      {expandedHistoryId === paymentObj.member_id && (
                        <TableRow className="bg-muted/10 hover:bg-muted/10">
                          <TableCell colSpan={6} className="py-2 px-8 pt-0">
                            <PaymentHistory
                              payments={paymentObj.payments}
                              refetch={refetch}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}

                  {/* Inline form row */}
                  {!isPaid && expandedId === paymentObj.member_id && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-2 px-4 bg-muted/20">
                        <MarkPaidForm
                          paymentObj={paymentObj}
                          refetch={refetch}
                          onCancel={() => setExpandedId(null)}
                          setExpandedId={setExpandedId}
                          chit={chit}
                          month={month}
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

  return (
    <>
      {error && <p className="text-sm text-red-500 px-4 pt-2">{error}</p>}
      <MobileList />
      <DesktopTable />
    </>
  );
};
