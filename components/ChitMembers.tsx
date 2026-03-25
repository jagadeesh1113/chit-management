/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { AddMembers } from "./add-members";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { TableSkletonRows } from "./table-skleton-rows";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { MemberContext } from "@/context/MemberContext";
import { MoreHorizontalIcon, PhoneIcon, RefreshCcwIcon } from "lucide-react";
import { EditMemberDialog } from "./edit-member-dialog";
import { DeleteMemberDialog } from "./delete-member-dialog";
import { OwnerBadge, CountBadge } from "./custom-badges";
import { ChitContext } from "@/context/ChitContext";
import { formatAmount, getMonthlyPaymentAmount } from "@/lib/utils";
import { ChitMonthContext } from "@/context/MonthContext";
import { Member } from "@/types";

export const ChitMembers = ({ chitId }: { chitId: string }) => {
  const { values, loading, refetch } = React.useContext(MemberContext);
  const { chitDetails } = React.useContext(ChitContext);
  const { values: months } = React.useContext(ChitMonthContext);

  const totalChitPaymentAmountPerUser = React.useMemo(() => {
    return months?.reduce((acc, monthObj) => {
      acc += getMonthlyPaymentAmount({
        chit: chitDetails,
        month: monthObj,
        isOwnerAuction: monthObj?.is_owner_auction,
      });
      return acc;
    }, 0);
  }, [chitDetails, months]);

  const [selectedMemberObj, setSelectedMemberObj] = useState<{
    mode: "EDIT" | "DELETE";
    details: any;
  } | null>(null);

  const handleReset = () => {
    setSelectedMemberObj(null);
  };

  const handleEditMember = (memberObj: any) => {
    setSelectedMemberObj({
      mode: "EDIT",
      details: memberObj,
    });
  };

  const handleDeleteMember = (memberObj: any) => {
    setSelectedMemberObj({
      mode: "DELETE",
      details: memberObj,
    });
  };

  // ── Action menu (shared) ───────────────────────────────────────────────────
  const ActionMenu = ({ member }: { member: Member }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 shrink-0">
          <MoreHorizontalIcon className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleEditMember(member)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:bg-red-100 focus:text-red-600 dark:focus:bg-red-900"
          onClick={() => handleDeleteMember(member)}
          disabled={member.owner}
        >
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // ── Mobile cards ───────────────────────────────────────────────────────────
  const MobileList = () => {
    if (loading) {
      return (
        <div className="space-y-2 sm:hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-3 space-y-2"
            >
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-2 sm:hidden">
        {values.map((memberObj) => (
          <div
            key={memberObj.id}
            className="rounded-xl border border-border bg-card p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-sm truncate">
                  {memberObj?.name}
                </span>
                {memberObj.owner && <OwnerBadge />}
              </div>
              <ActionMenu member={memberObj} />
            </div>
            {memberObj?.mobile && (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <PhoneIcon className="size-3" />
                {memberObj.mobile}
              </div>
            )}
            <div className="mt-2 grid grid-cols-3 divide-x divide-border border-t border-border -mx-3 px-0">
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground">Payments</p>
                <div className="mt-0.5">
                  <CountBadge
                    count={memberObj?.payments_count ?? 0}
                    total={chitDetails?.months ?? 20}
                  />
                </div>
              </div>
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground">Received</p>
                <p className="text-xs font-semibold tabular-nums mt-0.5 text-green-700 dark:text-green-400">
                  {formatAmount(memberObj?.payments_received ?? 0)}
                </p>
              </div>
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xs font-semibold tabular-nums mt-0.5 text-amber-600 dark:text-amber-400">
                  {formatAmount(
                    totalChitPaymentAmountPerUser -
                      (memberObj.payments_received ?? 0),
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── Desktop table ──────────────────────────────────────────────────────────
  const DesktopTable = () => (
    <div className="hidden sm:block rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="font-medium">Name</TableHead>
            <TableHead className="font-medium">Mobile</TableHead>
            <TableHead className="font-medium">Payments</TableHead>
            <TableHead className="font-medium">Received</TableHead>
            <TableHead className="font-medium">Pending</TableHead>
            <TableHead className="text-right font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkletonRows rowsCount={5} colsCount={4} />
          ) : (
            values?.map((memberObj) => (
              <TableRow key={memberObj.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {memberObj?.name}
                    {memberObj.owner && <OwnerBadge />}
                  </div>
                </TableCell>
                <TableCell>{memberObj?.mobile}</TableCell>
                <TableCell>
                  <CountBadge
                    count={memberObj?.payments_count ?? 0}
                    total={chitDetails?.months ?? 20}
                  />
                </TableCell>
                <TableCell className="font-medium tabular-nums text-green-700 dark:text-green-400">
                  {formatAmount(memberObj?.payments_received ?? 0)}
                </TableCell>
                <TableCell className="font-medium tabular-nums text-amber-600 dark:text-amber-400">
                  {formatAmount(
                    totalChitPaymentAmountPerUser -
                      (memberObj?.payments_received ?? 0),
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <ActionMenu member={memberObj} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold sm:text-base">
          Members{" "}
          <span className="text-muted-foreground font-normal">
            ({values.length})
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="h-8 px-2 sm:px-3"
          >
            <RefreshCcwIcon
              className={`size-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <AddMembers chitId={chitId} refetch={refetch} />
        </div>
      </div>
      <MobileList />
      <DesktopTable />
      <EditMemberDialog
        selectedMember={selectedMemberObj?.details}
        refetch={refetch}
        onReset={handleReset}
        editMode={selectedMemberObj?.mode === "EDIT"}
      />
      <DeleteMemberDialog
        selectedMemberDetails={selectedMemberObj?.details}
        deleted={selectedMemberObj?.mode === "DELETE"}
        onReset={handleReset}
        refetch={refetch}
      />
    </div>
  );
};
