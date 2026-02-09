/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "./ui/button";
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
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import React from "react";
import { toast } from "sonner";
import { ChitMemberSelect } from "./ChitMemberSelect";

export const AddMonths = ({
  chitId,
  refetch,
}: {
  chitId: string;
  refetch: () => void;
}) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [auctionUser, setAuctionUser] = React.useState<string>("");

  const handleAddMonth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    formData.append("chit_id", chitId);
    formData.append("auction_user", auctionUser);

    try {
      const res = await fetch("/api/months", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Month added successfully", {
          position: "top-right",
        });
        setIsDialogOpen(false);
        refetch();
      } else {
        setError(data.error);
      }
    } catch (error: any) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>Add Month / Auction</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleAddMonth}>
          <DialogHeader>
            <DialogTitle>Add Month</DialogTitle>
            <DialogDescription>
              Month / Auction will be added to this chit.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="mb-6">
            <Field>
              <Label htmlFor="name">Month / Auction Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="add name"
                required
                type="text"
              />
            </Field>
            <Field>
              <Label htmlFor="auction_date">Auction Date</Label>
              <Input
                id="auction_date"
                name="auction_date"
                placeholder="add auction date"
                required
                type="date"
              />
            </Field>
            <Field>
              <Label htmlFor="auction_amount">Auction Amount</Label>
              <Input
                id="auction_amount"
                name="auction_amount"
                placeholder="add auction amount"
                required
                type="number"
              />
            </Field>
            <Field>
              <Label>Auction User</Label>
              <ChitMemberSelect
                onChange={(value) => setAuctionUser(value)}
                value={auctionUser}
              />
            </Field>
          </FieldGroup>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding Month" : "Add Month"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
