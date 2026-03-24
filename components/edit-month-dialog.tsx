/* eslint-disable @typescript-eslint/no-explicit-any */
import { CalendarIcon, TagIcon } from "lucide-react";
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

export const EditMonthDialog = ({
  onReset,
  selectedMonth,
  refetch,
  editMode,
}: {
  onReset?: () => void;
  selectedMonth?: any;
  refetch?: () => void;
  editMode?: boolean;
}) => {
  const [name, setName] = useState("");
  const [auctionDate, setAuctionDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (editMode && selectedMonth) {
      setName(selectedMonth.name ?? "");
      setAuctionDate(selectedMonth.auction_date ?? "");
      setIsDialogOpen(true);
    }
  }, [editMode, selectedMonth]);

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) onReset?.();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/months", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedMonth?.id,
          name,
          auction_date: auctionDate || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Month updated", { position: "top-right" });
        setIsDialogOpen(false);
        refetch?.();
        onReset?.();
      } else {
        setError(data.error ?? "Failed to update month");
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-xl p-0 gap-0">
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[90dvh]">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
            <DialogTitle className="text-base">Edit Month</DialogTitle>
            <DialogDescription className="text-xs">
              Update the name or auction date for {selectedMonth?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="month-name"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                Month name
              </Label>
              <div className="relative">
                <TagIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  id="month-name"
                  placeholder="e.g. Month 1"
                  required
                  className="pl-8"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Auction date */}
            <div className="space-y-1.5">
              <Label
                htmlFor="auction-date"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                Auction date
              </Label>
              <div className="relative">
                <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  id="auction-date"
                  type="date"
                  className="pl-8"
                  value={auctionDate}
                  onChange={(e) => setAuctionDate(e.target.value)}
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
              {isLoading ? "Updating…" : "Update Month"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
