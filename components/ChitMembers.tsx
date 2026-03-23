/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { AddMembers } from "./add-members";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { TableSkletonRows } from "./table-skleton-rows";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { MemberContext } from "@/context/MemberContext";
import { PhoneIcon } from "lucide-react";

export const ChitMembers = ({ chitId }: { chitId: string }) => {
  const { values, loading, refetch } = React.useContext(MemberContext);

  // ── Mobile cards ──────────────────────────────────────────────────────
  const MobileList = () => {
    if (loading) {
      return (
        <div className="space-y-2 sm:hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-3 space-y-2">
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
          <div key={memberObj.id} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-sm truncate">{memberObj?.name}</span>
                {memberObj.owner && (
                  <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 shrink-0">
                    Owner
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {memberObj?.payments_count ?? 0} / 20 paid
              </span>
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

  // ── Desktop table ─────────────────────────────────────────────────────
  const DesktopTable = () => (
    <div className="hidden sm:block rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="font-medium">Name</TableHead>
            <TableHead className="font-medium">Mobile</TableHead>
            <TableHead className="font-medium">Payments</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkletonRows rowsCount={5} colsCount={3} />
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
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3 mt-6">
        <h2 className="text-sm font-semibold sm:text-base">
          Members <span className="text-muted-foreground font-normal">({values.length})</span>
        </h2>
        <AddMembers chitId={chitId} refetch={refetch} />
      </div>
      <MobileList />
      <DesktopTable />
    </div>
  );
};
