"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import React from "react";
import { Button } from "./ui/button";
import { ChitPaymentsTable } from "./ChitPaymentsTable";
import { useFetchChitPayments } from "@/hooks/use-fetch-chit-payments";
import { XIcon } from "lucide-react";
import type { Payment, ChitMonth, Chit } from "@/types";
import { ChitContext } from "@/context/ChitContext";
import { getMonthlyPaidAmount, getMonthlyPaymentAmount } from "@/lib/utils";

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
  const { loading, values, refetch } = useFetchChitPayments(month_id, chit_id);
  const { chitDetails } = React.useContext(ChitContext);

  const paidCount =
    values?.filter((p: Payment) => {
      if (!p?.payments?.length) return false;
      const monthPaymentAmount = getMonthlyPaymentAmount({
        chit: chitDetails,
        month: month,
        isOwnerAuction: month?.is_owner_auction,
      });
      const paidAmount = getMonthlyPaidAmount(p);
      return paidAmount >= monthPaymentAmount;
    }).length ?? 0;
  const totalCount = values?.length ?? 0;

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
      <DrawerContent direction="right">
        {/* Header */}
        <DrawerHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <DrawerTitle className="truncate">
                {month_name ?? "Monthly Payments"}
              </DrawerTitle>
              <DrawerDescription className="mt-1">
                {loading
                  ? "Loading payments…"
                  : `${paidCount} of ${totalCount} paid`}
              </DrawerDescription>
            </div>
            {/* Close button */}
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="size-8 shrink-0">
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DrawerClose>
          </div>

          {/* Progress bar */}
          {!loading && totalCount > 0 && (
            <div className="mt-3">
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(paidCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}
        </DrawerHeader>

        {/* Scrollable payments list */}
        <div className="flex-1 overflow-y-auto">
          <ChitPaymentsTable
            loading={loading}
            values={values}
            refetch={refetch}
            month={month}
            chit={chitDetails as Chit | null}
          />
        </div>

        {/* Footer */}
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
