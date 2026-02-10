import { ViewIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { ChitPaymentsTable } from "./ChitPaymentsTable";
import React from "react";

export const MonthlyPaymentsDialog = ({
  month_name,
  month_id,
}: {
  month_name: string;
  month_id: string;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size={"icon"}>
          <ViewIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Chit Monthly Payments</DialogTitle>
          <DialogDescription>
            Member payments for {month_name}
          </DialogDescription>
        </DialogHeader>
        <div className="no-scrollbar overflow-y-auto px-4 h-[50vh]">
          <ChitPaymentsTable month_id={month_id} />
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
