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
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import React from "react";
import { toast } from "sonner";
import { CheckIcon, XIcon, ReceiptIcon, CalendarIcon, ChevronDownIcon } from "lucide-react";
import { cn, getMonthlyPaymentAmount } from "@/lib/utils";
import type { Payment, ChitMonth, Chit } from "@/types";
import { MarkPaidForm } from "./mark-paid-form";

// ── Formatters ───────────────────────────────────────────────────────────────
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

// ── PAYMENT_TYPES lookup (local copy to avoid circular deps) ─────────────────
const PAYMENT_TYPE_LABELS: Record<string, string> = {
  cash: "💵 Cash",
  cheque: "📝 Cheque",
  bank_transfer: "🏦 Bank Transfer",
};

// ── Payment history sub-component ────────────────────────────────────────────
const PaymentHistory = ({ payments }: { payments: Payment["payments"] }) => {
  if (!payments?.length) return null;
  return (
    <div className="border-t border-border mt-2 pt-2 space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
        <ReceiptIcon className="size-3" />
        Payment history
      </p>
      {payments.map((p) => (
        <div
          key={p.payment_id}
          className="flex items-center justify-between gap-2 text-xs"
        >
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarIcon className="size-3 shrink-0" />
            {formatDate(p.payment_date)}
            {p.payment_type && (
              <span className="text-muted-foreground/70">
                · {PAYMENT_TYPE_LABELS[p.payment_type] ?? p.payment_type}
              </span>
            )}
          </div>
          <span className="font-medium tabular-nums shrink-0">
            {fmt.format(p.amount)}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── WhatsApp SVG icon ────────────────────────────────────────────────
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// ── WhatsApp reminder helper ────────────────────────────────────────────────
const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}/${mm}/${yy}`;
};

const openWhatsApp = (
  mobile: string,
  name: string,
  payableAmount: number,
  month?: ChitMonth | null,
  chit?: Chit | null,
) => {
  let message: string;

  if (month && chit) {
    const auctionAmount = Number(month.auction_amount);
    const chitAmount = Number(chit.amount);
    const numMembers = Number(chit.members);
    const payablePerPerson =
      (chitAmount - auctionAmount + chit.charges) / numMembers;
    const dividendPerMember = (auctionAmount - chit.charges) / numMembers;
    const auctionDate = month.auction_date ? fmtDate(month.auction_date) : "—";

    message = [
      `Hi ${name},`,
      ``,
      `${auctionDate}`,
      `Chits ${fmtINR(chit.amount)}, ${month.name}`,
      `Auction Amount: ${fmtINR(auctionAmount)}`,
      `Dividend Per Member: ${fmtINR(dividendPerMember)}`,
      `Payable Amount Per Person: ${fmtINR(payablePerPerson)}`,
      ``,
      `Thank you!`,
    ].join("\n");
  } else {
    // Fallback if month/chit context isn't available
    message = `Hi ${name}, your chit payment of ₹${fmtINR(payableAmount)} is due. Please make the payment at the earliest. Thank you!`;
  }

  const number = mobile.replace(/\D/g, "");
  window.open(
    `https://wa.me/91${number}?text=${encodeURIComponent(message)}`,
    "_blank",
  );
};

// ── Status badge ──────────────────────────────────────────────────────────────
const PaymentStatus = ({
  status,
  partial,
}: {
  status: boolean;
  partial?: boolean;
}) => {
  if (status) {
    return (
      <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 text-xs">
        Paid
      </Badge>
    );
  }
  if (partial) {
    return (
      <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs">
        Partially paid
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 text-xs">
      Unpaid
    </Badge>
  );
};

// ── Inline mark-as-paid form ──────────────────────────────────────────────────

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
  const [expandedHistoryId, setExpandedHistoryId] = React.useState<string | null>(null);

  const toggleHistory = (id: string) =>
    setExpandedHistoryId((prev) => (prev === id ? null : id));

  const monthlyPaymentAmount = React.useMemo(() => {
    return getMonthlyPaymentAmount({ month, chit });
  }, [month, chit]);

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const handleMarkUnpaid = async (paymentObj: Payment) => {
    setError(null);
    try {
      const res = await fetch("/api/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: paymentObj.member_id,
          payment_status: false,
          payment_date: null,
          payment_type: null,
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

          const paidAmount = paymentObj?.payments?.reduce(
            (acc, paymentDetails) => (acc += paymentDetails?.amount),
            0,
          );
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate leading-tight">
                    {paymentObj.name}
                  </p>
                  {/* {isPaid && paymentObj.payment_type && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {
                        PAYMENT_TYPES.find(
                          (t) => t.value === paymentObj.payment_type,
                        )?.icon
                      }{" "}
                      {
                        PAYMENT_TYPES.find(
                          (t) => t.value === paymentObj.payment_type,
                        )?.label
                      }
                      {paymentObj.payment_date && (
                        <span className="ml-1">
                          · {formatDate(paymentObj.payment_date)}
                        </span>
                      )}
                    </p>
                  )} */}
                </div>

                {/* Status badge */}
                <div className="shrink-0">
                  <PaymentStatus status={isPaid} partial={isPartial} />
                </div>
              </div>

              {/* Amount stats row */}
              <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
                <div className="px-3 py-2">
                  <p className="text-xs text-muted-foreground">Due</p>
                  <p className="text-xs font-semibold tabular-nums mt-0.5">{fmt.format(monthlyPaymentAmount)}</p>
                </div>
                <div className="px-3 py-2">
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="text-xs font-semibold tabular-nums mt-0.5 text-green-700 dark:text-green-400">
                    {paidAmount > 0 ? fmt.format(paidAmount) : "—"}
                  </p>
                </div>
                <div className="px-3 py-2">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className={`text-xs font-semibold tabular-nums mt-0.5 ${isPaid ? "text-muted-foreground" : "text-amber-600 dark:text-amber-400"}`}>
                    {isPaid ? "—" : fmt.format(pendingAmount)}
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
                      {paymentObj.payments.length} payment{paymentObj.payments.length > 1 ? "s" : ""}
                    </span>
                    <ChevronDownIcon
                      className={cn(
                        "size-3.5 transition-transform duration-200",
                        expandedHistoryId === paymentObj.member_id && "rotate-180",
                      )}
                    />
                  </button>
                  {expandedHistoryId === paymentObj.member_id && (
                    <div className="px-4 pb-3">
                      <PaymentHistory payments={paymentObj.payments} />
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
                      openWhatsApp(
                        paymentObj.mobile,
                        paymentObj.name,
                        monthlyPaymentAmount,
                        month,
                        chit,
                      )
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
              const paidAmount = paymentObj?.payments?.reduce(
                (acc, paymentDetails) => (acc += paymentDetails?.amount),
                0,
              );
              const pendingAmount = Math.max(0, monthlyPaymentAmount - paidAmount);
              const isPaid = pendingAmount === 0;
              const isPartial = !isPaid && paidAmount > 0;
              return (
                <React.Fragment key={paymentObj.member_id}>
                  <TableRow>
                    <TableCell className="font-medium">
                      {paymentObj.name}
                    </TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {fmt.format(monthlyPaymentAmount)}
                    </TableCell>
                    <TableCell className="tabular-nums text-green-700 dark:text-green-400 font-medium">
                      {paidAmount > 0 ? fmt.format(paidAmount) : "—"}
                    </TableCell>
                    <TableCell>
                      {isPaid ? (
                        <span className="text-sm text-muted-foreground">—</span>
                      ) : (
                        <span className="text-sm font-medium tabular-nums text-amber-600 dark:text-amber-400">
                          {fmt.format(pendingAmount)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <PaymentStatus status={isPaid} partial={isPartial} />
                        {/* {isPaid ? (
                          <>
                            {paymentObj.payment_type ? (
                              <div>
                                {
                                  PAYMENT_TYPES.find(
                                    (t) => t.value === paymentObj.payment_type,
                                  )?.icon
                                }{" "}
                                {
                                  PAYMENT_TYPES.find(
                                    (t) => t.value === paymentObj.payment_type,
                                  )?.label
                                }
                              </div>
                            ) : null}
                            {paymentObj.payment_date ? (
                              <div>{formatDate(paymentObj.payment_date)}</div>
                            ) : null}
                          </>
                        ) : null} */}
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
                                openWhatsApp(
                                  paymentObj.mobile,
                                  paymentObj.name,
                                  monthlyPaymentAmount,
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
                            {paymentObj.payments.length} payment{paymentObj.payments.length > 1 ? "s" : ""}
                            <ChevronDownIcon
                              className={cn(
                                "size-3 ml-auto transition-transform duration-200",
                                expandedHistoryId === paymentObj.member_id && "rotate-180",
                              )}
                            />
                          </span>
                        </TableCell>
                      </TableRow>
                      {expandedHistoryId === paymentObj.member_id && (
                        <TableRow className="bg-muted/10 hover:bg-muted/10">
                          <TableCell colSpan={6} className="py-2 px-8 pt-0">
                            <PaymentHistory payments={paymentObj.payments} />
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
