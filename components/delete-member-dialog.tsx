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

export const DeleteMemberDialog = ({
  selectedMemberDetails,
  refetch,
  deleted,
  onReset,
}: {
  selectedMemberDetails: any;
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

  const handleDeleteMember = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedMemberDetails?.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Member removed successfully", { position: "top-right" });
        refetch?.();
        onReset?.();
      } else {
        toast.error(data.error ?? "Failed to remove member", {
          position: "top-right",
        });
      }
    } catch (error: any) {
      toast.error("Failed to remove member: " + error?.message, {
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
            {`Remove ${selectedMemberDetails?.name ?? "this member"}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently remove this
            member from the chit.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2 sm:flex-row">
          <AlertDialogCancel className="flex-1 sm:flex-none mt-0">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteMember}
            disabled={deleteLoading}
            className="flex-1 sm:flex-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteLoading ? "Removing…" : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
