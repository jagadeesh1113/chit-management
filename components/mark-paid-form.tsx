/* eslint-disable @typescript-eslint/no-explicit-any */
import { PAYMENT_TYPES } from "@/constants";
import { Payment, PaymentType } from "@/types";
import {
  BanknoteIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  XIcon,
} from "lucide-react";
import React from "react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { toast } from "sonner";

export const MarkPaidForm = ({
  onCancel,
  refetch,
  paymentObj,
  setExpandedId,
}: {
  onCancel: () => void;
  refetch?: () => void;
  paymentObj: Payment;
  setExpandedId: (_id: string | null) => void;
}) => {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = React.useState(today);
  const [type, setType] = React.useState<PaymentType>("cash");
  const [typeOpen, setTypeOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const selectedType = PAYMENT_TYPES.find((t) => t.value === type)!;

  const handleMarkPaid = async (date: string, type: PaymentType) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: paymentObj.payment_id,
          payment_status: true,
          payment_date: date,
          payment_type: type,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payment marked as paid", { position: "top-right" });
        setExpandedId(null);
        refetch?.();
      } else {
        setError(data.error ?? "Failed to update payment");
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-3 w-full">
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

        {/* Pill buttons on mobile */}
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

        {/* Dropdown for desktop */}
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
      </div>

      {error && <p className="text-sm text-red-500 px-4 pt-2">{error}</p>}

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          className="flex-1 h-8 gap-1 text-xs"
          disabled={submitting || !date}
          onClick={() => handleMarkPaid(date, type)}
        >
          <CheckIcon className="size-3.5" />
          {submitting ? "Saving…" : "Confirm"}
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
