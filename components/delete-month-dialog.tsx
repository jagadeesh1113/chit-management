/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from "sonner";

export const DeleteMonthDialog = ({
  selectedMonthDetails,
  refetch,
  deleted,
  onReset,
}: {
  selectedMonthDetails: any;
  refetch?: () => void;
  deleted?: boolean;
  onReset?: () => void;
}) => {
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (deleted) {
      setIsAlertDialogOpen(true);
    }
  }, [deleted]);

  const handleDeleteMonth = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/months", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedMonthDetails?.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Month deleted successfully", { position: "top-right" });
        refetch?.();
        onReset?.();
      } else {
        toast.error(data.error ?? "Failed to delete month", {
          position: "top-right",
        });
      }
    } catch (error: any) {
      toast.error("Failed to delete month: " + error?.message, {
        position: "top-right",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsAlertDialogOpen(open);
    if (!open) {
      onReset?.();
    }
  };

  return (
    <AlertDialog open={isAlertDialogOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {`Delete ${selectedMonthDetails?.name ?? "this month"}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            month and all its associated payments.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2 sm:flex-row">
          <AlertDialogCancel className="flex-1 sm:flex-none mt-0">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteMonth}
            disabled={deleteLoading}
            className="flex-1 sm:flex-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteLoading ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
