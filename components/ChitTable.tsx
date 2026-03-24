/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import {
  CalendarIcon,
  MoreHorizontalIcon,
  UsersIcon,
  IndianRupeeIcon,
  ClockIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";
import { Chit } from "@/types";
import { CountBadge } from "./custom-badges";

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const ChitTable = ({
  loading,
  values,
  onSelectChit,
}: {
  loading: boolean;
  values: Chit[];
  onSelectChit: (_chitObj: { mode: "EDIT" | "DELETE"; details: any }) => void;
}) => {
  const router = useRouter();

  const handleViewChit = (chitObj: Chit) => router.push(`/chit/${chitObj.id}`);
  const handleEditChit = (chitObj: Chit) =>
    onSelectChit({ mode: "EDIT", details: chitObj });
  const handleDeleteChit = (chitObj: Chit) =>
    onSelectChit({ mode: "DELETE", details: chitObj });

  const ActionMenu = ({ chitObj }: { chitObj: Chit }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 shrink-0">
          <MoreHorizontalIcon className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleViewChit(chitObj)}>
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEditChit(chitObj)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:bg-red-100 focus:text-red-600 dark:focus:bg-red-900"
          onClick={() => handleDeleteChit(chitObj)}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // ── Empty state ───────────────────────────────────────────────────────
  const EmptyState = ({ className }: { className?: string }) => (
    <div
      className={`flex flex-col items-center justify-center py-16 text-center gap-3 ${className}`}
    >
      <div className="rounded-full bg-muted p-4">
        <IndianRupeeIcon className="size-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">No chits yet</p>
      <p className="text-xs text-muted-foreground">
        Add your first chit to get started
      </p>
    </div>
  );

  // ── Stat pill ─────────────────────────────────────────────────────────
  const StatPill = ({
    icon: Icon,
    label,
  }: {
    icon: React.ElementType;
    label: string;
  }) => (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className="size-3 shrink-0" />
      {label}
    </span>
  );

  // ── Icon + CountBadge pill ────────────────────────────────────────────
  const CountPill = ({
    icon: Icon,
    count,
    total,
    suffix,
  }: {
    icon: React.ElementType;
    count: number;
    total: number;
    suffix: string;
  }) => (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-3 shrink-0 text-muted-foreground" />
      <CountBadge count={count} total={total} />
      <span className="text-xs text-muted-foreground">{suffix}</span>
    </span>
  );

  // ── Mobile card list ──────────────────────────────────────────────────
  const MobileList = () => {
    if (loading) {
      return (
        <div className="space-y-3 sm:hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-6 w-3/5" />
              <div className="flex gap-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!values?.length) {
      return <EmptyState className="sm:hidden" />;
    }

    return (
      <div className="space-y-3 sm:hidden">
        {values.map((chitObj) => (
          <div
            key={chitObj.id}
            className="rounded-xl border border-border bg-card p-4 active:bg-accent transition-colors cursor-pointer"
            onClick={() => handleViewChit(chitObj)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {/* Name + amount */}
                <p className="font-semibold text-sm truncate">{chitObj.name}</p>
                <p className="text-xl font-bold mt-0.5">
                  {formatter.format(chitObj.amount)}
                </p>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <ActionMenu chitObj={chitObj} />
              </div>
            </div>

            {/* Divider */}
            <div className="mt-3 mb-3 border-t border-border" />

            {/* Stats row */}
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <CountPill
                icon={UsersIcon}
                count={chitObj.member_count}
                total={chitObj.members}
                suffix="members"
              />
              <CountPill
                icon={ClockIcon}
                count={chitObj.month_count}
                total={chitObj.months}
                suffix="months"
              />
              <StatPill
                icon={TrendingUpIcon}
                label={`${formatter.format(chitObj.charges)}/mo`}
              />
              <StatPill
                icon={CalendarIcon}
                label={formatDate(chitObj.start_date)}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── Desktop table ─────────────────────────────────────────────────────
  const DesktopTable = () => (
    <div className="hidden sm:block rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold text-foreground pl-4">
              Name
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              <span className="flex items-center gap-1">
                <IndianRupeeIcon className="size-3.5" />
                Amount
              </span>
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              <span className="flex items-center gap-1">
                <UsersIcon className="size-3.5" />
                Members
              </span>
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              <span className="flex items-center gap-1">
                <ClockIcon className="size-3.5" />
                Months
              </span>
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              <span className="flex items-center gap-1">
                <TrendingUpIcon className="size-3.5" />
                Charges/mo
              </span>
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              <span className="flex items-center gap-1">
                <CalendarIcon className="size-3.5" />
                Start Date
              </span>
            </TableHead>
            <TableHead className="text-right font-semibold text-foreground pr-4">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-4">
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="pr-4">
                    <Skeleton className="h-6 w-6 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </>
          ) : !values?.length ? (
            <TableRow>
              <TableCell colSpan={7}>
                <EmptyState />
              </TableCell>
            </TableRow>
          ) : (
            values.map((chitObj) => (
              <TableRow
                key={chitObj.id}
                className="cursor-pointer group"
                onClick={() => handleViewChit(chitObj)}
              >
                {/* Name */}
                <TableCell className="pl-4">
                  <span className="font-semibold group-hover:text-foreground transition-colors">
                    {chitObj.name}
                  </span>
                </TableCell>

                {/* Amount — visually prominent */}
                <TableCell>
                  <span className="font-semibold tabular-nums">
                    {formatter.format(chitObj.amount)}
                  </span>
                </TableCell>

                {/* Members */}
                <TableCell>
                  <CountBadge
                    count={chitObj?.member_count ?? 0}
                    total={chitObj?.members ?? 20}
                  />
                </TableCell>

                {/* Months */}
                <TableCell>
                  <CountBadge
                    count={chitObj?.month_count ?? 0}
                    total={chitObj?.months ?? 20}
                  />
                </TableCell>

                {/* Charges */}
                <TableCell>
                  <span className="tabular-nums text-sm text-muted-foreground">
                    {formatter.format(chitObj.charges)}
                    <span className="text-xs">/mo</span>
                  </span>
                </TableCell>

                {/* Start date */}
                <TableCell>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {formatDate(chitObj.start_date)}
                  </span>
                </TableCell>

                {/* Actions */}
                <TableCell
                  className="text-right pr-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ActionMenu chitObj={chitObj} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <MobileList />
      <DesktopTable />
    </>
  );
};
