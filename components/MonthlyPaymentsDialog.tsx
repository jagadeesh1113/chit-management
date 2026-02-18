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
import { MessageCircle } from "lucide-react";
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
    if (loading) {
      return;
    }
    const payment_reminder_recipients = values?.filter(
      (paymentObj: any) => !paymentObj?.payment_status,
    );
    const res = await fetch("/api/send-message", {
      method: "POST",
      body: JSON.stringify({
        payment_reminder_recipients,
      }),
    });

    await res.json();
    toast.success("Payment Reminder sent successfully", {
      position: "top-right",
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={onChangeDialogOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Chit Monthly Payments</DialogTitle>
          <DialogDescription>
            Member payments for {month_name}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end px-4">
          <Button variant={"secondary"} onClick={handleSendMessage}>
            <MessageCircle />
            Send Message
          </Button>
        </div>
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
