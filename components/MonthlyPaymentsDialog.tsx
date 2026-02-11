import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { ChitPaymentsTable } from "./ChitPaymentsTable";
import React from "react";
import { useFetchChitPayments } from "@/hooks/use-fetch-chit-payments";

export const MonthlyPaymentsDialog = ({
  month_name,
  month_id,
  isDialogOpen,
  onChangeDialogOpen,
}: {
  month_name: string;
  month_id: string;
  isDialogOpen: boolean;
  onChangeDialogOpen: (value: boolean) => void;
}) => {
  const { loading, values, refetch } = useFetchChitPayments(month_id);

  return (
    <Dialog open={isDialogOpen} onOpenChange={onChangeDialogOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Chit Monthly Payments</DialogTitle>
          <DialogDescription>
            Member payments for {month_name}
          </DialogDescription>
        </DialogHeader>
        <div className="no-scrollbar overflow-y-auto px-4 h-[50vh]">
          <ChitPaymentsTable
            loading={loading}
            values={values}
            refetch={refetch}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
