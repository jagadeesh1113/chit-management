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
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { MemberContext } from "@/context/MemberContext";
import { MoreHorizontalIcon, PhoneIcon } from "lucide-react";
import { EditMemberDialog } from "./edit-member-dialog";
import { DeleteMemberDialog } from "./delete-member-dialog";

interface MemberObj {
  id: string;
  name: string;
  mobile: string;
  owner: boolean;
  payments_count?: number;
}

export const ChitMembers = ({ chitId }: { chitId: string }) => {
  const { values, loading, refetch } = React.useContext(MemberContext);
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
  const ActionMenu = ({ member }: { member: MemberObj }) => (
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
        {values.map((memberObj: any) => (
          <div
            key={memberObj.id}
            className="rounded-xl border border-border bg-card p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-sm truncate">
                  {memberObj?.name}
                </span>
                {memberObj.owner && (
                  <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 shrink-0">
                    Owner
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs text-muted-foreground">
                  {memberObj?.payments_count ?? 0} / 20
                </span>
                <ActionMenu member={memberObj} />
              </div>
            </div>
            {memberObj?.mobile && (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <PhoneIcon className="size-3" />
                {memberObj.mobile}
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
            <TableHead className="text-right font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkletonRows rowsCount={5} colsCount={4} />
          ) : (
            values?.map((memberObj: any) => (
              <TableRow key={memberObj.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {memberObj?.name}
                    {memberObj.owner && (
                      <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                        Owner
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{memberObj?.mobile}</TableCell>
                <TableCell>{`${memberObj?.payments_count ?? 0} / 20`}</TableCell>
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
      <div className="flex items-center justify-between mb-3 mt-6">
        <h2 className="text-sm font-semibold sm:text-base">
          Members{" "}
          <span className="text-muted-foreground font-normal">
            ({values.length})
          </span>
        </h2>
        <AddMembers chitId={chitId} refetch={refetch} />
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
