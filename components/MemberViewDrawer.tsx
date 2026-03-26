"use client";

import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Input } from "./ui/input";
import {
  XIcon,
  PhoneIcon,
  CalendarIcon,
  TrophyIcon,
  CheckCircle2Icon,
  CircleIcon,
  IndianRupeeIcon,
  CheckIcon,
  ChevronDownIcon,
  SendIcon,
} from "lucide-react";
import { OwnerBadge, PaymentStatusBadge } from "./custom-badges";
import {
  useFetchMemberPayments,
  MemberMonthPayment,
} from "@/hooks/use-fetch-member-payments";
import {
  cn,
  formatAmount,
  formatDate,
  getMonthlyPaymentAmount,
  getNumericAmountWithoutCurrency,
  getWhatsAppChitMesssageTemplate,
} from "@/lib/utils";
import { Chit, ChitMonth, Member, PaymentType } from "@/types";
import { PAYMENT_TYPES } from "@/constants";
import { PaymentHistory } from "./payment-history";
import { toast } from "sonner";
import CurrencyInput from "react-currency-input-field";

// ── WhatsApp icon ─────────────────────────────────────────────────────────────
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

// ── Open WhatsApp (auto-close tab on desktop) ─────────────────────────────────
const openWhatsApp = (
  mobile: string,
  chit: Chit | null,
  month: ChitMonth | MemberMonthPayment | null,
) => {
  const message = getWhatsAppChitMesssageTemplate({
    chit,
    month: month as ChitMonth,
  });
  const number = mobile.replace(/\D/g, "");
  const url = `https://wa.me/91${number}?text=${encodeURIComponent(message)}`;
  const tab = window.open("", "_blank");
  if (tab) {
    tab.document.write(
      `<html><body><script>window.location.href="${url}";setTimeout(()=>window.close(),1000);<\/script></body></html>`,
    );
    tab.document.close();
  }
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: "green" | "amber";
}) => (
  <div className="rounded-lg border border-border bg-muted/30 p-2.5 flex flex-col gap-0.5">
    <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
    <p
      className={cn(
        "text-xs font-semibold tabular-nums leading-tight",
        color === "green" && "text-green-700 dark:text-green-400",
        color === "amber" && "text-amber-600 dark:text-amber-400",
      )}
    >
      {value}
    </p>
  </div>
);

// ── Inline mark-paid form ─────────────────────────────────────────────────────
const MarkPaidInline = ({
  chitMonth,
  member,
  chit,
  due,
  paid,
  onCancel,
  onSaved,
}: {
  chitMonth: MemberMonthPayment;
  member: Member;
  chit: Chit | null;
  due: number;
  paid: number;
  onCancel: () => void;
  onSaved: () => void;
}) => {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = React.useState(today);
  const [type, setType] = React.useState<PaymentType>("cash");
  const [amount, setAmount] = React.useState<string>(
    Math.max(0, due - paid).toString(),
  );
  const [typeOpen, setTypeOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const selectedType = PAYMENT_TYPES.find((t) => t.value === type)!;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: member.id,
          chit_id: chit?.id,
          month_id: chitMonth.id,
          payment_date: date,
          payment_type: type,
          amount: getNumericAmountWithoutCurrency(amount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payment marked as paid", { position: "top-right" });
        onSaved();
      } else {
        setError(data.error ?? "Failed to save payment");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-3 mx-4 mb-3">
      {/* Amount */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Amount paid
        </label>
        <CurrencyInput
          value={amount}
          onValueChange={(val) => setAmount(val ?? "")}
          intlConfig={{ locale: "en-IN", currency: "INR" }}
          customInput={Input}
          className="h-8 text-sm"
          onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
          onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
          onTouchStart={(e: React.TouchEvent) => e.stopPropagation()}
        />
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
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Payment type — pills */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Payment type
        </label>
        {/* Mobile pills */}
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
        {/* Desktop dropdown */}
        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setTypeOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3 h-8 text-sm rounded-md border border-input bg-background hover:bg-accent transition-colors"
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

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          className="flex-1 h-8 gap-1 text-xs"
          disabled={submitting || !date}
          onClick={handleSubmit}
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

// ── Main drawer ───────────────────────────────────────────────────────────────
export const MemberViewDrawer = ({
  member,
  chit,
  isOpen,
  onOpenChange,
}: {
  member: Member | null;
  chit: Chit | null;
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const {
    values: memberMonths,
    loading,
    refetch,
  } = useFetchMemberPayments(member?.id ?? null, chit?.id ?? null);

  // Track which month card has the mark-paid form expanded
  const [expandedMonthId, setExpandedMonthId] = React.useState<string | null>(
    null,
  );

  // ── Summary totals ────────────────────────────────────────────────────────
  const { totalDue, totalPaid, paidMonths, unpaidMonths } =
    React.useMemo(() => {
      let totalDue = 0,
        totalPaid = 0,
        paidMonths = 0,
        unpaidMonths = 0;
      for (const row of memberMonths) {
        const due = getMonthlyPaymentAmount({
          chit,
          month: row as unknown as ChitMonth,
          isOwnerAuction: row.is_owner_auction,
        });
        const paid = row.payments.reduce((acc, p) => acc + (p.amount ?? 0), 0);
        totalDue += due;
        totalPaid += paid;
        if (due > 0 && paid >= due) paidMonths++;
        else unpaidMonths++;
      }
      return { totalDue, totalPaid, paidMonths, unpaidMonths };
    }, [memberMonths, chit]);

  const totalPending = Math.max(0, totalDue - totalPaid);

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
      <DrawerContent direction="right">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <DrawerHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DrawerTitle className="truncate">{member?.name}</DrawerTitle>
                {member?.owner && <OwnerBadge />}
              </div>
              {member?.mobile && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <PhoneIcon className="size-3 shrink-0" />
                  {member.mobile}
                </div>
              )}
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="size-8 shrink-0">
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DrawerClose>
          </div>

          {/* Progress bar */}
          {!loading && memberMonths.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  {paidMonths} of {memberMonths.length} months paid
                </span>
                <span className="text-xs font-medium">
                  {Math.round((paidMonths / memberMonths.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-300"
                  style={{
                    width: `${(paidMonths / memberMonths.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
          {loading && (
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          )}

          {/* Summary stats */}
          <div className="mt-4 grid grid-cols-4 gap-1.5">
            <StatCard label="Total Due" value={formatAmount(totalDue)} />
            <StatCard
              label="Paid"
              value={formatAmount(totalPaid)}
              color="green"
            />
            <StatCard
              label="Pending"
              value={totalPending > 0 ? formatAmount(totalPending) : "—"}
              color={totalPending > 0 ? "amber" : undefined}
            />
            <StatCard
              label="Unpaid"
              value={unpaidMonths > 0 ? `${unpaidMonths} mo` : "—"}
              color={unpaidMonths > 0 ? "amber" : undefined}
            />
          </div>
        </DrawerHeader>

        {/* ── Month list ───────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {/* Skeletons */}
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="mx-5 rounded-xl border border-border bg-card p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-2/5" />
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-8 rounded-lg" />
                  <Skeleton className="h-8 rounded-lg" />
                  <Skeleton className="h-8 rounded-lg" />
                </div>
              </div>
            ))}

          {/* Month cards */}
          {!loading &&
            memberMonths.map((chitMonth) => {
              const due = getMonthlyPaymentAmount({
                chit,
                month: chitMonth as unknown as ChitMonth,
                isOwnerAuction: chitMonth.is_owner_auction,
              });
              const paid = chitMonth.payments.reduce(
                (acc, p) => acc + (p.amount ?? 0),
                0,
              );
              const pending = Math.max(0, due - paid);
              const isPaid = due > 0 && paid >= due;
              const isPartial = !isPaid && paid > 0;
              const isExpanded = expandedMonthId === chitMonth.id;

              return (
                <div
                  key={chitMonth.id}
                  className={cn(
                    "mx-5 rounded-xl border bg-card overflow-hidden",
                    isPaid
                      ? "border-green-200 dark:border-green-900"
                      : "border-border",
                  )}
                >
                  {/* ── Month header ───────────────────────────────────────── */}
                  <div className="flex items-center justify-between gap-2 px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {isPaid ? (
                        <CheckCircle2Icon className="size-4 shrink-0 text-green-500" />
                      ) : (
                        <CircleIcon className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {chitMonth.name}
                        </p>
                        {chitMonth.auction_date && (
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                            <CalendarIcon className="size-3 shrink-0" />
                            {formatDate(chitMonth.auction_date)}
                          </div>
                        )}
                      </div>
                    </div>
                    <PaymentStatusBadge status={isPaid} partial={isPartial} />
                  </div>

                  {/* ── Amounts grid ───────────────────────────────────────── */}
                  <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
                    <div className="px-3 py-2">
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <IndianRupeeIcon className="size-3" />
                        Due
                      </p>
                      <p className="text-xs font-semibold tabular-nums mt-0.5">
                        {due > 0 ? formatAmount(due) : "—"}
                      </p>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <IndianRupeeIcon className="size-3" />
                        Paid
                      </p>
                      <p className="text-xs font-semibold tabular-nums mt-0.5 text-green-700 dark:text-green-400">
                        {paid > 0 ? formatAmount(paid) : "—"}
                      </p>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <IndianRupeeIcon className="size-3" />
                        Pending
                      </p>
                      <p
                        className={cn(
                          "text-xs font-semibold tabular-nums mt-0.5",
                          isPaid
                            ? "text-muted-foreground"
                            : "text-amber-600 dark:text-amber-400",
                        )}
                      >
                        {isPaid ? "—" : formatAmount(pending)}
                      </p>
                    </div>
                  </div>

                  {/* ── Payment history ────────────────────────────────────── */}
                  {chitMonth.payments?.length > 0 && (
                    <div className="border-t border-border px-4 pb-2">
                      <PaymentHistory
                        payments={chitMonth.payments}
                        refetch={refetch}
                      />
                    </div>
                  )}

                  {/* ── Auction winner badge ───────────────────────────────── */}
                  {chitMonth.auction_user === member?.id && (
                    <div className="border-t border-border px-4 py-2">
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        <TrophyIcon className="size-3" />
                        Won this auction
                      </span>
                    </div>
                  )}

                  {/* ── Action strip (unpaid only) ─────────────────────────── */}
                  {!isPaid && (
                    <>
                      <div className="border-t border-border px-4 py-2.5 flex gap-2">
                        {/* WhatsApp remind */}
                        {member?.mobile && (
                          <button
                            type="button"
                            onClick={() =>
                              openWhatsApp(
                                member.mobile,
                                chit,
                                chitMonth as unknown as ChitMonth,
                              )
                            }
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] text-white py-1.5 text-xs font-medium hover:bg-[#1ebe5d] active:opacity-75 transition-colors"
                          >
                            <WhatsAppIcon className="size-3.5" />
                            <SendIcon className="size-3" />
                            Remind
                          </button>
                        )}
                        {/* Mark as paid toggle */}
                        {!isExpanded ? (
                          <button
                            type="button"
                            onClick={() => setExpandedMonthId(chitMonth.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                          >
                            <CheckIcon className="size-3.5" />
                            Mark as paid
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setExpandedMonthId(null)}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/40 transition-colors"
                          >
                            <XIcon className="size-3.5" />
                            Cancel
                          </button>
                        )}
                      </div>

                      {/* Inline mark-paid form */}
                      {isExpanded && member && (
                        <MarkPaidInline
                          chitMonth={chitMonth}
                          member={member}
                          chit={chit}
                          due={due}
                          paid={paid}
                          onCancel={() => setExpandedMonthId(null)}
                          onSaved={() => {
                            setExpandedMonthId(null);
                            refetch();
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              );
            })}

          {/* Empty state */}
          {!loading && memberMonths.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3 mx-5">
              <div className="rounded-full bg-muted p-4">
                <CalendarIcon className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No months yet</p>
              <p className="text-xs text-muted-foreground">
                Months will appear here once added to the chit.
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <DrawerFooter className="px-5 py-4 border-t border-border shrink-0">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
