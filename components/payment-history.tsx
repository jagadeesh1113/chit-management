/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { PAYMENT_TYPE_LABELS } from "@/constants";
import { formatAmount, formatDate } from "@/lib/utils";
import { Payment } from "@/types";
import {
  CalendarIcon,
  PencilIcon,
  ReceiptIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { EditPaymentForm } from "./edit-payment-form";

export const PaymentHistory = ({
  payments,
  refetch,
}: {
  payments: Payment["payments"];
  refetch?: () => void;
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(
    null,
  );

  if (!payments?.length) return null;

  const handleDelete = async (paymentId: string) => {
    setDeletingId(paymentId);
    try {
      const res = await fetch("/api/payments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: paymentId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payment deleted", { position: "top-right" });
        refetch?.();
      } else {
        toast.error(data.error ?? "Failed to delete payment", {
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

  return (
    <div className="border-t border-border mt-2 pt-2 space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1 pb-0.5">
        <ReceiptIcon className="size-3" />
        Payment history
      </p>

      {payments.map((p) => (
        <div key={p.payment_id} className="space-y-1">
          {/* Row */}
          <div className="flex items-center justify-between gap-2 text-xs rounded-md px-1 -mx-1 py-0.5 hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
              <CalendarIcon className="size-3 shrink-0" />
              <span className="truncate">{formatDate(p.payment_date)}</span>
              {p.payment_type && (
                <span className="text-muted-foreground/70 hidden sm:inline">
                  · {PAYMENT_TYPE_LABELS[p.payment_type] ?? p.payment_type}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="font-medium tabular-nums">
                {formatAmount(p.amount)}
              </span>

              {/* Edit button */}
              {editingId !== p.payment_id && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(p.payment_id);
                    setConfirmDeleteId(null);
                  }}
                  className="ml-1 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Edit payment"
                >
                  <PencilIcon className="size-3" />
                </button>
              )}

              {/* Delete / confirm buttons */}
              {confirmDeleteId === p.payment_id ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDelete(p.payment_id)}
                    disabled={deletingId === p.payment_id}
                    className="px-1.5 py-0.5 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deletingId === p.payment_id ? "…" : "Confirm"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <XIcon className="size-3" />
                  </button>
                </div>
              ) : (
                editingId !== p.payment_id && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDeleteId(p.payment_id);
                      setEditingId(null);
                    }}
                    className="p-1 rounded text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    title="Delete payment"
                  >
                    <Trash2Icon className="size-3" />
                  </button>
                )
              )}

              {/* Cancel edit */}
              {editingId === p.payment_id && (
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <XIcon className="size-3" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile payment type tag */}
          {p.payment_type && (
            <p className="text-xs text-muted-foreground/70 px-1 sm:hidden -mt-0.5">
              {PAYMENT_TYPE_LABELS[p.payment_type] ?? p.payment_type}
            </p>
          )}

          {/* Inline edit form */}
          {editingId === p.payment_id && (
            <EditPaymentForm
              entry={p}
              onCancel={() => setEditingId(null)}
              onSaved={() => {
                setEditingId(null);
                refetch?.();
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};
