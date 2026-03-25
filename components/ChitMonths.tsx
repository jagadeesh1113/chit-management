/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { TableSkletonRows } from "./table-skleton-rows";
import { AddMonths } from "./add-months";
import React from "react";
import { MemberContext } from "@/context/MemberContext";
import { MonthlyPaymentsDrawer } from "./MonthlyPaymentsDrawer";
import { Button } from "./ui/button";
import {
  CalendarIcon,
  EyeIcon,
  TrophyIcon,
  IndianRupeeIcon,
  UsersIcon,
  MoreHorizontalIcon,
  RefreshCcwIcon,
  BanknoteIcon,
  CreditCardIcon,
  BuildingIcon,
  InfoIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { DeleteMonthDialog } from "./delete-month-dialog";
import { EditMonthDialog } from "./edit-month-dialog";
import { Skeleton } from "./ui/skeleton";
import { ChitMonth } from "@/types";
import { ChitContext } from "@/context/ChitContext";
import { ChitMonthContext } from "@/context/MonthContext";
import {
  getAuctionUserPayableAmount,
  getMonthlyPaymentAmount,
} from "@/lib/utils";
import { CountBadge } from "./custom-badges";

// ── Formatters ────────────────────────────────────────────────────────────────
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

// ── Breakdown popover (desktop) ───────────────────────────────────────────────
const BreakdownPopover = ({ month }: { month: ChitMonth }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const cash = month.cash_received ?? 0;
  const cheque = month.cheque_received ?? 0;
  const bank = month.bank_transfer_received ?? 0;
  const hasData = cash > 0 || cheque > 0 || bank > 0;

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!hasData) return null;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="ml-1.5 text-muted-foreground hover:text-foreground transition-colors align-middle"
        aria-label="View payment breakdown"
      >
        <InfoIcon className="size-3.5" />
      </button>

      {open && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 w-52 rounded-lg border border-border bg-popover shadow-md text-popover-foreground">
          {/* Arrow */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 size-3 rotate-45 border-l border-t border-border bg-popover" />

          {/* Header */}
          <div className="px-3 pt-3 pb-1.5 border-b border-border">
            <p className="text-xs font-semibold">Received by type</p>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {[
              { icon: BanknoteIcon,   label: "Cash",             amount: cash },
              { icon: CreditCardIcon, label: "Cheque",           amount: cheque },
              { icon: BuildingIcon,   label: "Bank Transfer",    amount: bank },
            ].map(({ icon: Icon, label, amount }) => (
              <div key={label} className="flex items-center justify-between px-3 py-2">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="size-3 shrink-0" />
                  {label}
                </span>
                <span className="text-xs font-semibold tabular-nums">
                  {amount > 0 ? fmt.format(amount) : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Mobile breakdown popover ──────────────────────────────────────────────────
const MobileBreakdownPopover = ({ month }: { month: ChitMonth }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const cash = month.cash_received ?? 0;
  const cheque = month.cheque_received ?? 0;
  const bank = month.bank_transfer_received ?? 0;
  const hasData = cash > 0 || cheque > 0 || bank > 0;

  // Close on outside tap
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  if (!hasData) return null;

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="ml-1 p-0.5 text-muted-foreground hover:text-foreground active:text-foreground transition-colors"
        aria-label="View payment breakdown"
      >
        <InfoIcon className="size-3.5" />
      </button>

      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-lg border border-border bg-popover shadow-lg text-popover-foreground">
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-3 rotate-45 border-r border-b border-border bg-popover" />

          {/* Header */}
          <div className="px-3 pt-3 pb-1.5 border-b border-border">
            <p className="text-xs font-semibold">Received by type</p>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {[
              { icon: BanknoteIcon,   label: "Cash",          amount: cash },
              { icon: CreditCardIcon, label: "Cheque",        amount: cheque },
              { icon: BuildingIcon,   label: "Bank Transfer", amount: bank },
            ].map(({ icon: Icon, label, amount }) => (
              <div key={label} className="flex items-center justify-between px-3 py-2">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="size-3 shrink-0" />
                  {label}
                </span>
                <span className="text-xs font-semibold tabular-nums">
                  {amount > 0 ? fmt.format(amount) : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const ChitMonths = ({ chitId }: { chitId: string }) => {
  const {
    values,
    loading,
    refetch: fetchChitMonths,
  } = React.useContext(ChitMonthContext);
  const { values: members } = React.useContext(MemberContext);
  const { chitDetails } = React.useContext(ChitContext);

  const [selectedMonth, setSelectedMonth] = React.useState<null | any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [selectedMonthToDelete, setSelectedMonthToDelete] = React.useState<null | any>(null);
  const [selectedMonthToEdit, setSelectedMonthToEdit] = React.useState<null | any>(null);

  const handleSelectMonthlyPayments = (monthObj: any) => {
    setSelectedMonth(monthObj);
    setIsDrawerOpen(true);
  };
  const handleEditMonth = (monthObj: any) => setSelectedMonthToEdit(monthObj);
  const handleResetEdit = () => setSelectedMonthToEdit(null);
  const handleDeleteMonth = (monthObj: any) => setSelectedMonthToDelete(monthObj);
  const handleResetDelete = () => setSelectedMonthToDelete(null);

  // ── Mobile cards ──────────────────────────────────────────────────────────
  const MobileList = () => {
    if (loading) {
      return (
        <div className="space-y-2 sm:hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-2/5" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2 sm:hidden">
        {values?.map((auctionObj: ChitMonth) => {
          const memberDetails = members?.find((m) => m?.id === auctionObj?.auction_user);
          const payableAmount = getAuctionUserPayableAmount({ chit: chitDetails, month: auctionObj });
          const monthlyPaymentAmount = getMonthlyPaymentAmount({
            chit: chitDetails,
            month: auctionObj,
            isOwnerAuction: auctionObj?.is_owner_auction,
          });

          return (
            <div key={auctionObj.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{auctionObj?.name}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                    <CalendarIcon className="size-3 shrink-0" />
                    {formatDate(auctionObj?.auction_date)}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="outline" size="icon" className="size-8"
                    onClick={() => handleSelectMonthlyPayments(auctionObj)}>
                    <EyeIcon className="size-3.5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontalIcon className="size-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleSelectMonthlyPayments(auctionObj)}>
                        View payments
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditMonth(auctionObj)}>Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:bg-red-100 focus:text-red-600 dark:focus:bg-red-900"
                        onClick={() => handleDeleteMonth(auctionObj)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Stats grid */}
              <div className="border-t border-border">
                <div className="grid grid-cols-2 divide-x divide-y divide-border">
                  <div className="px-3 py-2.5">
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <IndianRupeeIcon className="size-3" />Auction
                    </p>
                    <p className="text-xs font-semibold mt-0.5 tabular-nums">
                      {fmt.format(auctionObj.auction_amount)}
                    </p>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <IndianRupeeIcon className="size-3" />Amount / Person
                    </p>
                    <p className="text-xs font-semibold mt-0.5 tabular-nums">
                      {fmt.format(monthlyPaymentAmount)}
                    </p>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <IndianRupeeIcon className="size-3" />Payable
                    </p>
                    <p className="text-xs font-semibold mt-0.5 tabular-nums">
                      {!!payableAmount ? fmt.format(payableAmount) : "-"}
                    </p>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <IndianRupeeIcon className="size-3" />Received
                    </p>
                    <p className="text-xs font-semibold mt-0.5 tabular-nums text-green-700 dark:text-green-400 flex items-center">
                      {fmt.format(auctionObj?.payments_received)}
                      <MobileBreakdownPopover month={auctionObj} />
                    </p>
                  </div>
                </div>

                {/* Winner + paid count */}
                <div className="flex items-start justify-between gap-3 px-3 py-2.5 border-t border-border">
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <TrophyIcon className="size-3" />Winner
                    </p>
                    <p className="text-xs font-semibold mt-0.5 truncate">
                      {memberDetails?.name ?? "—"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] text-muted-foreground flex items-center justify-end gap-1">
                      <UsersIcon className="size-3" />Paid
                    </p>
                    <div className="mt-0.5">
                      <CountBadge
                        count={auctionObj?.payments_count ?? 0}
                        total={chitDetails?.members ?? 20}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ── Desktop table ─────────────────────────────────────────────────────────
  const DesktopTable = () => (
    <div className="hidden sm:block rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="font-medium">Month</TableHead>
            <TableHead className="font-medium">Auction Date</TableHead>
            <TableHead className="font-medium">Auction Amount</TableHead>
            <TableHead className="font-medium">Amount / Person</TableHead>
            <TableHead className="font-medium">Payable Amount</TableHead>
            <TableHead className="font-medium">Payment Received</TableHead>
            <TableHead className="font-medium">Winner</TableHead>
            <TableHead className="font-medium">Payments</TableHead>
            <TableHead className="text-right font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkletonRows rowsCount={5} colsCount={9} />
          ) : (
            values?.map((auctionObj: ChitMonth) => {
              const memberDetails = members?.find((m) => m?.id === auctionObj?.auction_user);
              const payableAmount = getAuctionUserPayableAmount({ chit: chitDetails, month: auctionObj });
              const monthlyPaymentAmount = getMonthlyPaymentAmount({
                chit: chitDetails,
                month: auctionObj,
                isOwnerAuction: auctionObj?.is_owner_auction,
              });

              return (
                <TableRow
                  key={auctionObj.id}
                  className="cursor-pointer"
                  onClick={() => handleSelectMonthlyPayments(auctionObj)}
                >
                  <TableCell className="font-medium">{auctionObj?.name}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarIcon className="size-3.5 shrink-0" />
                      {formatDate(auctionObj?.auction_date)}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium tabular-nums">
                    {fmt.format(auctionObj.auction_amount)}
                  </TableCell>
                  <TableCell className="font-medium tabular-nums">
                    {fmt.format(monthlyPaymentAmount)}
                  </TableCell>
                  <TableCell className="font-medium tabular-nums">
                    {payableAmount ? fmt.format(payableAmount) : "-"}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <span className="inline-flex items-center gap-0.5">
                      <span className="font-medium tabular-nums text-sm text-green-700 dark:text-green-400">
                        {fmt.format(auctionObj?.payments_received)}
                      </span>
                      <BreakdownPopover month={auctionObj} />
                    </span>
                  </TableCell>
                  <TableCell>
                    {memberDetails?.name ? (
                      <span className="flex items-center gap-1.5 text-sm">
                        <TrophyIcon className="size-3.5 text-amber-500 shrink-0" />
                        {memberDetails.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <CountBadge
                      count={auctionObj?.payments_count ?? 0}
                      total={chitDetails?.members ?? 20}
                    />
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontalIcon className="size-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSelectMonthlyPayments(auctionObj)}>
                          View payments
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditMonth(auctionObj)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:bg-red-100 focus:text-red-600 dark:focus:bg-red-900"
                          onClick={() => handleDeleteMonth(auctionObj)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold sm:text-base">Chit Months</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchChitMonths}
            disabled={loading}
            className="h-8 px-2 sm:px-3"
          >
            <RefreshCcwIcon className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <AddMonths chitId={chitId} refetch={fetchChitMonths} />
        </div>
      </div>
      <MobileList />
      <DesktopTable />
      <MonthlyPaymentsDrawer
        month_name={selectedMonth?.name}
        month_id={selectedMonth?.id}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        month={selectedMonth}
        chit_id={chitId}
      />
      <EditMonthDialog
        selectedMonth={selectedMonthToEdit}
        editMode={!!selectedMonthToEdit}
        onReset={handleResetEdit}
        refetch={fetchChitMonths}
      />
      <DeleteMonthDialog
        selectedMonthDetails={selectedMonthToDelete}
        deleted={!!selectedMonthToDelete}
        onReset={handleResetDelete}
        refetch={fetchChitMonths}
      />
    </div>
  );
};
