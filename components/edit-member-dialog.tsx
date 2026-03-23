/* eslint-disable @typescript-eslint/no-explicit-any */
import { PhoneIcon, UserIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export const EditMemberDialog = ({
  onReset,
  selectedMember,
  refetch,
  editMode,
}: {
  onReset?: () => void;
  selectedMember?: any;
  refetch?: () => void;
  editMode?: boolean;
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (editMode) {
      setIsDialogOpen(true);
    }
  }, [editMode]);

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      onReset?.();
    }
  };

  // ── Handle edit submit ─────────────────────────────────────────────────────
  const handleUpdateMember = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      formData.append("id", selectedMember?.id);

      const res = await fetch("/api/members", {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Member updated", { position: "top-right" });
        setIsDialogOpen(false);
        refetch?.();
        onReset?.();
      } else {
        setError(data.error ?? "Failed to update member");
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-xl p-0 gap-0">
        <form
          onSubmit={handleUpdateMember}
          className="flex flex-col max-h-[90dvh]"
        >
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
            <DialogTitle className="text-base">Edit Member</DialogTitle>
            <DialogDescription className="text-xs">
              Update name or mobile for {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-name"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                Name
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Full name"
                  required
                  className="pl-8"
                  defaultValue={selectedMember?.name}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-mobile"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                Mobile
              </Label>
              <div className="relative">
                <PhoneIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  id="mobile"
                  name="mobile"
                  placeholder="Mobile number"
                  inputMode="numeric"
                  className="pl-8"
                  defaultValue={selectedMember?.mobile}
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <DialogFooter className="px-5 py-4 border-t border-border shrink-0 flex-row gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              {isLoading ? "Updating..." : "Update Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
