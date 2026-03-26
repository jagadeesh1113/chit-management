"use client";

import { ChitContext } from "@/context/ChitContext";
import { ChitMonthContext } from "@/context/MonthContext";
import { useFetchChitPayments } from "@/hooks/use-fetch-chit-payments";
import { useFetchChitPayouts } from "@/hooks/use-fetch-chit-payouts";
import {
  formatAmount,
  getAuctionUserPayableAmount,
  getMonthlyPaidAmount,
  getMonthlyPaymentAmount,
  getWhatsAppChitMesssageTemplate,
} from "@/lib/utils";
import type { Chit, ChitMonth, ChitPayment, Payment } from "@/types";
import { Skeleton } from "./ui/skeleton";
import {
  UsersIcon,
  TrendingUpIcon,
  XIcon,
  ChevronDownIcon,
  SendIcon,
} from "lucide-react";
import React from "react";
import { ChitPaymentsTable } from "./ChitPaymentsTable";
import { ChitPayouts } from "./payouts/ChitPayouts";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { cn } from "@/lib/utils";

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  color,
  loading,
}: {
  label: string;
  value: string;
  color?: "green" | "amber" | "default";
  loading?: boolean;
}) => (
  <div className="rounded-lg border border-border bg-muted/30 p-2.5 flex flex-col gap-0.5">
    <p className="text-[10px] text-muted-foreground leading-tight truncate">
      {label}
    </p>
    {loading ? (
      <Skeleton className="h-4 w-16 mt-0.5" />
    ) : (
      <p
        className={[
          "text-xs font-semibold tabular-nums leading-tight",
          color === "green"
            ? "text-green-700 dark:text-green-400"
            : color === "amber"
              ? "text-amber-600 dark:text-amber-400"
              : "",
        ].join(" ")}
      >
        {value}
      </p>
    )}
  </div>
);

// ── WhatsApp helpers ────────────────────────────────────────────────────────
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

const openWhatsAppReminder = (
  mobile: string,
  month: ChitMonth | null,
  chit: Chit | null,
) => {
  const message = getWhatsAppChitMesssageTemplate({
    chit,
    month,
  });
  const number = mobile.replace(/\D/g, "");
  const url = `https://wa.me/91${number}?text=${encodeURIComponent(message)}`;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true;
  if (isStandalone) {
    window.location.href = url;
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

// ── Bulk remind panel ─────────────────────────────────────────────────────────
const BulkRemindPanel = ({
  unpaidPayments,
  month,
  chit,
  monthlyPaymentAmount,
}: {
  unpaidPayments: Payment[];
  month: ChitMonth | null;
  chit: Chit | null;
  monthlyPaymentAmount: number;
}) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  if (!unpaidPayments.length) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors border",
          open
            ? "bg-[#25D366] text-white border-[#25D366]"
            : "bg-[#25D366]/10 text-[#128C7E] border-[#25D366]/30 hover:bg-[#25D366]/20 dark:text-[#25D366] dark:bg-[#25D366]/10",
        )}
      >
        <WhatsAppIcon className="size-3.5" />
        Remind all
        <span className="bg-white/20 text-inherit rounded-full px-1.5 py-0.5 text-[10px] tabular-nums">
          {unpaidPayments.length}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-3 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-border bg-popover shadow-xl text-popover-foreground overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-muted/40">
            <p className="text-xs font-semibold">
              {unpaidPayments.length} unpaid member
              {unpaidPayments.length > 1 ? "s" : ""}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              <XIcon className="size-3.5" />
            </button>
          </div>

          {/* Member list */}
          <div className="divide-y divide-border max-h-64 overflow-y-auto">
            {unpaidPayments.map((p) => {
              const paidAmount =
                p.payments?.reduce((acc, e) => acc + (e.amount ?? 0), 0) ?? 0;
              const pending = Math.max(0, monthlyPaymentAmount - paidAmount);
              return (
                <div
                  key={p.member_id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
                      Pending: {formatAmount(pending)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openWhatsAppReminder(p.mobile, month, chit)}
                    className="flex items-center gap-1 shrink-0 rounded-lg bg-[#25D366] text-white px-2.5 py-1.5 text-[11px] font-semibold hover:bg-[#1ebe5d] active:opacity-75 transition-colors"
                  >
                    <SendIcon className="size-3" />
                    Send
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="px-3 py-2 border-t border-border bg-muted/30">
            <p className="text-[10px] text-muted-foreground">
              Opens WhatsApp with a pre-filled payment reminder.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Divider ───────────────────────────────────────────────────────────────────
const SectionDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 mb-1.5">
    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
      {label}
    </p>
    <div className="flex-1 h-px bg-border" />
  </div>
);

export const MonthlyPaymentsDrawer = ({
  month_name,
  month_id,
  isOpen,
  onOpenChange,
  month,
  chit_id,
}: {
  month_name: string;
  month_id: string;
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  month?: ChitMonth | null;
  chit_id: string;
}) => {
  const {
    loading: paymentsLoading,
    values: payments,
    refetch: refetchPayments,
  } = useFetchChitPayments(month_id, chit_id);
  const {
    loading: payoutsLoading,
    values: payouts,
    refetch: refetchPayouts,
  } = useFetchChitPayouts(month_id, chit_id);

  const { chitDetails } = React.useContext(ChitContext);
  const { values: months } = React.useContext(ChitMonthContext);

  const resolvedMonth = React.useMemo(
    () => month ?? months?.find((m) => m.id === month_id) ?? null,
    [month, months, month_id],
  );

  // ── Payments stats ─────────────────────────────────────────────────────────
  const monthlyPaymentAmount = React.useMemo(
    () =>
      getMonthlyPaymentAmount({
        chit: chitDetails,
        month: resolvedMonth,
        isOwnerAuction: resolvedMonth?.is_owner_auction,
      }),
    [chitDetails, resolvedMonth],
  );

  const paidCount = React.useMemo(
    () =>
      payments?.filter((p: Payment) => {
        if (!p?.payments?.length) return false;
        return getMonthlyPaidAmount(p) >= monthlyPaymentAmount;
      }).length ?? 0,
    [payments, monthlyPaymentAmount],
  );

  const totalMembersCount = payments?.length ?? 0;

  const unpaidPayments = React.useMemo(
    () =>
      payments?.filter((p: Payment) => {
        const paidAmount =
          p.payments?.reduce((acc, e) => acc + (e.amount ?? 0), 0) ?? 0;
        return paidAmount < monthlyPaymentAmount;
      }) ?? [],
    [payments, monthlyPaymentAmount],
  );

  const unpaidCount = unpaidPayments.length;

  const totalCollected = React.useMemo(
    () =>
      payments?.reduce(
        (acc, p) =>
          acc + (p.payments?.reduce((s, e) => s + (e.amount ?? 0), 0) ?? 0),
        0,
      ) ?? 0,
    [payments],
  );

  const totalDue = monthlyPaymentAmount * totalMembersCount;
  const totalPending = Math.max(0, totalDue - totalCollected);

  // ── Payouts stats ──────────────────────────────────────────────────────────
  const payableAmount = React.useMemo(() => {
    if (!resolvedMonth || !chitDetails) return 0;
    return (
      getAuctionUserPayableAmount({
        chit: chitDetails,
        month: resolvedMonth,
      }) ?? 0
    );
  }, [resolvedMonth, chitDetails]);

  const totalPayoutPaid = React.useMemo(
    () =>
      (payouts ?? []).reduce(
        (acc, p: ChitPayment) => acc + (Number(p?.amount) || 0),
        0,
      ),
    [payouts],
  );

  const payoutRemaining = Math.max(0, Number(payableAmount) - totalPayoutPaid);
  const hasAuctionUser = !!resolvedMonth?.auction_user;

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
      <DrawerContent direction="right">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <DrawerHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-3">
            <DrawerTitle className="truncate">
              {month_name ?? "Monthly Payments"}
            </DrawerTitle>
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Bulk WhatsApp remind — only shown when there are unpaid members */}
              {!paymentsLoading && (
                <BulkRemindPanel
                  unpaidPayments={unpaidPayments}
                  month={resolvedMonth}
                  chit={chitDetails as Chit | null}
                  monthlyPaymentAmount={monthlyPaymentAmount}
                />
              )}
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <XIcon className="size-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </DrawerClose>
            </div>
          </div>

          {/* Progress bar */}
          {!paymentsLoading && totalMembersCount > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  {paidCount} of {totalMembersCount} paid
                </span>
                <span className="text-xs font-medium">
                  {Math.round((paidCount / totalMembersCount) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(paidCount / totalMembersCount) * 100}%` }}
                />
              </div>
            </div>
          )}
          {paymentsLoading && (
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          )}

          {/* ── Combined summary ───────────────────────────────────────────── */}
          <div className="mt-4 space-y-3">
            {/* Payments summary */}
            <div>
              <SectionDivider label="Payments" />
              <div className="grid grid-cols-3 gap-1.5">
                <StatCard
                  label="Collected"
                  value={
                    totalCollected > 0 ? formatAmount(totalCollected) : "—"
                  }
                  color="green"
                  loading={paymentsLoading}
                />
                <StatCard
                  label="Pending"
                  value={totalPending > 0 ? formatAmount(totalPending) : "—"}
                  color={totalPending > 0 ? "amber" : "default"}
                  loading={paymentsLoading}
                />
                <StatCard
                  label="Unpaid"
                  value={unpaidCount > 0 ? `${unpaidCount}` : "—"}
                  color={unpaidCount > 0 ? "amber" : "default"}
                  loading={paymentsLoading}
                />
              </div>
            </div>

            {/* Payouts summary — only show if auction user is set */}
            {hasAuctionUser && (
              <div>
                <SectionDivider label="Payout" />
                <div className="grid grid-cols-3 gap-1.5">
                  <StatCard
                    label="Payable"
                    value={formatAmount(Number(payableAmount))}
                    loading={payoutsLoading}
                  />
                  <StatCard
                    label="Paid out"
                    value={
                      totalPayoutPaid > 0 ? formatAmount(totalPayoutPaid) : "—"
                    }
                    color="green"
                    loading={payoutsLoading}
                  />
                  <StatCard
                    label="Remaining"
                    value={
                      payoutRemaining > 0 ? formatAmount(payoutRemaining) : "—"
                    }
                    color={payoutRemaining > 0 ? "amber" : "default"}
                    loading={payoutsLoading}
                  />
                </div>
              </div>
            )}
          </div>
        </DrawerHeader>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="payments" className="w-full">
            <div className="sticky top-0 z-10 bg-background border-b border-border">
              <TabsList className="w-full justify-start rounded-none border-0 bg-transparent h-auto px-5 pt-3 pb-0 gap-0">
                <TabsTrigger
                  value="payments"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 pb-2.5 text-sm font-medium"
                >
                  <UsersIcon className="size-3.5 mr-1.5" />
                  Payments
                  {!paymentsLoading && totalMembersCount > 0 && (
                    <span className="ml-1.5 text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-medium tabular-nums">
                      {paidCount}/{totalMembersCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="payouts"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 pb-2.5 text-sm font-medium"
                >
                  <TrendingUpIcon className="size-3.5 mr-1.5" />
                  Payouts
                  {!payoutsLoading && payouts?.length > 0 && (
                    <span className="ml-1.5 text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-medium tabular-nums">
                      {payouts.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="payments" className="mt-0">
              <ChitPaymentsTable
                loading={paymentsLoading}
                values={payments}
                refetch={refetchPayments}
                month={resolvedMonth}
                chit={chitDetails as Chit | null}
              />
            </TabsContent>

            <TabsContent value="payouts" className="mt-0">
              <ChitPayouts
                monthId={month_id}
                chitId={chit_id}
                payouts={payouts}
                payoutsLoading={payoutsLoading}
                refetchPayouts={refetchPayouts}
                payableAmount={payableAmount}
                totalPayoutPaid={totalPayoutPaid}
                payoutRemaining={payoutRemaining}
              />
            </TabsContent>
          </Tabs>
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
