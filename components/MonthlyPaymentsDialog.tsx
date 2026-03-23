/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useFetchChitPayments } from "@/hooks/use-fetch-chit-payments";
import { MessageCircleIcon } from "lucide-react";
import { toast } from "sonner";

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

  const handleSendMessage = async () => {
    if (loading) return;
    const payment_reminder_recipients = values?.filter(
      (paymentObj: any) => !paymentObj?.payment_status,
    );
    const res = await fetch("/api/send-message", {
      method: "POST",
      body: JSON.stringify({ payment_reminder_recipients }),
    });
    await res.json();
    toast.success("Payment reminder sent successfully", { position: "top-right" });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={onChangeDialogOpen}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl rounded-xl p-0 gap-0">
        <DialogHeader className="px-4 pt-5 pb-3 border-b border-border">
          <DialogTitle className="text-base">Monthly Payments</DialogTitle>
          <DialogDescription className="text-xs">
            Member payments for {month_name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end px-4 py-2.5 border-b border-border bg-muted/30">
          <Button variant="secondary" size="sm" onClick={handleSendMessage} className="gap-1.5 text-xs">
            <MessageCircleIcon className="size-3.5" />
            Send Reminder
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[55vh] px-0">
          <ChitPaymentsTable loading={loading} values={values} refetch={refetch} />
        </div>

        <DialogFooter className="px-4 py-3 border-t border-border">
          <DialogClose asChild>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
