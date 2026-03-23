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

export const DeleteChitDialog = ({
  selectedChitDetails,
  refetch,
  deleted,
  onReset,
}: {
  selectedChitDetails: any;
  refetch?: () => void;
  deleted?: boolean;
  onReset?: () => void;
}) => {
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

  useEffect(() => {
    if (deleted) {
      setIsAlertDialogOpen(deleted);
    }
  }, [deleted]);

  const handleDeleteChit = async () => {
    try {
      const res = await fetch("/api/chits", {
        method: "DELETE",
        body: JSON.stringify({
          chit_id: selectedChitDetails?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Chit deleted successfully", {
          position: "top-right",
        });
        refetch?.();
        onReset?.();
      } else {
        toast.error("Chit deleted failed", {
          position: "top-right",
        });
      }
    } catch (error: any) {
      toast.error("Chit deleted failed" + error, {
        position: "top-right",
      });
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{`Are you sure to delete ${selectedChitDetails?.name} chit?`}</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your chit
            from your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteChit}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
