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
import {
  EyeIcon,
  MoreHorizontalIcon,
  PhoneIcon,
  RefreshCcwIcon,
} from "lucide-react";
import { EditMemberDialog } from "./edit-member-dialog";
import { DeleteMemberDialog } from "./delete-member-dialog";
import { OwnerBadge, CountBadge } from "./custom-badges";
import { ChitContext } from "@/context/ChitContext";
import { formatAmount, getMonthlyPaymentAmount } from "@/lib/utils";
import { ChitMonthContext } from "@/context/MonthContext";
import { Member } from "@/types";
import { MemberViewDrawer } from "./MemberViewDrawer";

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

// ── WhatsApp helper ───────────────────────────────────────────────────────────
const openMemberWhatsApp = (
  mobile: string,
  name: string,
  pendingAmount: number,
  chitName?: string,
) => {
  const message = [
    `Hi ${name},`,
    ``,
    `This is a reminder that you have a pending chit payment of ${formatAmount(pendingAmount)}${chitName ? ` for ${chitName}` : ""}.`,
    ``,
    `Please make the payment at the earliest.`,
    ``,
    `Thank you!`,
  ].join("\n");

  const number = mobile.replace(/\D/g, "");
  const url = `https://wa.me/91${number}?text=${encodeURIComponent(message)}`;

  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true);

  if (isStandalone) {
    window.location.href = url;
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

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

  const [viewMember, setViewMember] = useState<Member | null>(null);

  const handleReset = () => {
    setSelectedMemberObj(null);
  };

  const handleViewMember = (memberObj: Member) => setViewMember(memberObj);

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
        <DropdownMenuItem onClick={() => handleViewMember(member)}>
          View
        </DropdownMenuItem>
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
            <button
              type="button"
              onClick={() => handleViewMember(memberObj)}
              className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <EyeIcon className="size-3" />
              View months
            </button>
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
            {/* WhatsApp remind — only when pending > 0 */}
            {memberObj.mobile &&
              totalChitPaymentAmountPerUser -
                (memberObj.payments_received ?? 0) >
                0 && (
                <div className="border-t border-border -mx-3 px-3 pt-2.5 pb-1">
                  <button
                    type="button"
                    onClick={() =>
                      openMemberWhatsApp(
                        memberObj.mobile,
                        memberObj.name,
                        totalChitPaymentAmountPerUser -
                          (memberObj.payments_received ?? 0),
                        chitDetails?.name,
                      )
                    }
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] text-white py-2 text-xs font-medium hover:bg-[#1ebe5d] active:opacity-75 transition-colors"
                  >
                    <WhatsAppIcon className="size-3.5" />
                    Send reminder on WhatsApp
                  </button>
                </div>
              )}
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
                  <div className="flex items-center justify-end gap-1.5">
                    {memberObj.mobile &&
                      totalChitPaymentAmountPerUser -
                        (memberObj?.payments_received ?? 0) >
                        0 && (
                        <Button
                          size="sm"
                          className="h-8 gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white border-0"
                          onClick={() =>
                            openMemberWhatsApp(
                              memberObj.mobile,
                              memberObj.name,
                              totalChitPaymentAmountPerUser -
                                (memberObj?.payments_received ?? 0),
                              chitDetails?.name,
                            )
                          }
                        >
                          <WhatsAppIcon className="size-3.5" />
                          Remind
                        </Button>
                      )}
                    <ActionMenu member={memberObj} />
                  </div>
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
      <MemberViewDrawer
        member={viewMember}
        chit={chitDetails}
        isOpen={!!viewMember}
        onOpenChange={(open) => {
          if (!open) setViewMember(null);
        }}
      />
    </div>
  );
};
