/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import CurrencyInput from "react-currency-input-field";
import { toast } from "sonner";
import { PAYMENT_TYPES } from "@/constants";
import type { PaymentType } from "@/types";
import { getNumericAmountWithoutCurrency, cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  BanknoteIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  XIcon,
} from "lucide-react";

const getPayoutId = (payout: any) => payout?.payout_id ?? payout?.id;

export const AuctionUserPayoutForm = ({
  mode,
  payout,
  amountPreset,
  auctionUserId,
  chitId,
  monthId,
  onCancel,
  refetch,
}: {
  mode: "create" | "edit";
  payout?: any | null;
  amountPreset: number;
  auctionUserId: string;
  chitId: string;
  monthId: string;
  onCancel: () => void;
  refetch?: () => void;
}) => {
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = React.useState<string>(
    payout?.payment_date ? String(payout.payment_date).split("T")[0] : today,
  );
  const [type, setType] = React.useState<PaymentType>(
    (payout?.payment_type ?? "cash") as PaymentType,
  );
  const [amount, setAmount] = React.useState<string>(() => {
    const initial =
      mode === "edit" ? (payout?.amount ?? amountPreset) : amountPreset;
    return String(initial ?? 0);
  });

  const [typeOpen, setTypeOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const selectedType = PAYMENT_TYPES.find((t) => t.value === type)!;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "create") {
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: getNumericAmountWithoutCurrency(amount),
            chit_id: chitId,
            month_id: monthId,
            payment_date: date,
            payment_type: type,
            member_id: auctionUserId,
            is_payout: true,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Auction user payout marked as paid", {
            position: "top-right",
          });
          onCancel();
          refetch?.();
        } else {
          setError(data.error ?? "Failed to add payout");
        }
      } else {
        const payout_id = getPayoutId(payout);
        if (!payout_id) {
          setError("Payout id not found");
          return;
        }

        const res = await fetch("/api/payouts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payout_id,
            // Keep existing payment status if present; otherwise assume paid.
            payment_status: payout?.payment_status ?? true,
            payment_date: date,
            payment_type: type,
            amount: getNumericAmountWithoutCurrency(amount),
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Auction user payout updated", {
            position: "top-right",
          });
          onCancel();
          refetch?.();
        } else {
          setError(data.error ?? "Failed to update payout");
        }
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-3 w-full">
      {/* Amount */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Amount paid
        </label>
        <div className="relative">
          <BanknoteIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none z-10" />
          <CurrencyInput
            value={amount}
            onValueChange={(val) => setAmount(val ?? "")}
            intlConfig={{ locale: "en-IN", currency: "INR" }}
            prefix=""
            customInput={Input}
            className="pl-8 h-8 text-sm"
            onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
            onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
            onTouchStart={(e: React.TouchEvent) => e.stopPropagation()}
            required
          />
        </div>
      </div>

      {/* Date */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Payment date
        </label>
        <div className="relative">
          <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            required
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Payment type */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Payment type
        </label>

        <div className="relative hidden sm:block">
          <BanknoteIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none z-10" />
          <button
            type="button"
            onClick={() => setTypeOpen((o) => !o)}
            className="w-full flex items-center justify-between pl-8 pr-3 h-8 text-sm rounded-md border border-input bg-background hover:bg-accent transition-colors"
          >
            <span>
              {selectedType.icon} {selectedType.label}
            </span>
            <ChevronDownIcon className="size-3.5 text-muted-foreground" />
          </button>
          {typeOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-popover shadow-md overflow-hidden">
              {PAYMENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setType(t.value);
                    setTypeOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left",
                    type === t.value && "bg-accent font-medium",
                  )}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-1.5 sm:hidden flex-wrap">
          {PAYMENT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                type === t.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:border-foreground/40",
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          className="flex-1 h-8 gap-1 text-xs"
          disabled={submitting || !date || !amount}
          onClick={handleSubmit}
        >
          <CheckIcon className="size-3.5" />
          {submitting ? "Saving…" : mode === "edit" ? "Update" : "Confirm"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2"
          onClick={onCancel}
          disabled={submitting}
        >
          <XIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
};
