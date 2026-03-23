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
import { CheckIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Payment } from "@/types";
import { PAYMENT_TYPES } from "@/constants";
import { MarkPaidForm } from "./mark-paid-form";

// ── Formatters ───────────────────────────────────────────────────────────────
const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const fmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

// ── Status badge ──────────────────────────────────────────────────────────────
const PaymentStatus = ({ status }: { status: boolean }) => {
  if (status) {
    return (
      <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 text-xs">
        Paid
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
}: {
  refetch: () => void;
  loading: boolean;
  values: Payment[];
}) => {
  const [error, setError] = React.useState<string | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const handleMarkUnpaid = async (paymentObj: Payment) => {
    setError(null);
    try {
      const res = await fetch("/api/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: paymentObj.payment_id,
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

          const isPaid = paymentObj.payment_status;
          const isExpanded = expandedId === paymentObj.payment_id;

          return (
            <div
              key={paymentObj.payment_id}
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
                  {isPaid && paymentObj.payment_type && (
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
                  )}
                </div>

                {/* Amount + status */}
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {fmt.format(paymentObj.amount)}
                  </p>
                  <PaymentStatus status={paymentObj.payment_status} />
                </div>
              </div>

              {/* Action strip */}
              {!isPaid && (
                <div className="px-4 pb-3">
                  {!isExpanded ? (
                    <button
                      type="button"
                      onClick={() => toggleExpand(paymentObj.payment_id)}
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
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="text-right font-medium">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkletonRows rowsCount={5} colsCount={6} />
          ) : (
            values?.map((paymentObj) => (
              <React.Fragment key={paymentObj.payment_id}>
                <TableRow>
                  <TableCell className="font-medium">
                    {paymentObj.name}
                  </TableCell>
                  <TableCell className="font-medium">
                    {fmt.format(paymentObj.amount)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <PaymentStatus status={paymentObj.payment_status} />
                      {paymentObj?.payment_status ? (
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
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {paymentObj.payment_status ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkUnpaid(paymentObj)}
                      >
                        Mark Unpaid
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpand(paymentObj.payment_id)}
                      >
                        {expandedId === paymentObj.payment_id
                          ? "Cancel"
                          : "Mark Paid"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>

                {/* Inline form row */}
                {!paymentObj.payment_status &&
                  expandedId === paymentObj.payment_id && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-2 px-4 bg-muted/20">
                        <MarkPaidForm
                          paymentObj={paymentObj}
                          refetch={refetch}
                          onCancel={() => setExpandedId(null)}
                          setExpandedId={setExpandedId}
                        />
                      </TableCell>
                    </TableRow>
                  )}
              </React.Fragment>
            ))
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
