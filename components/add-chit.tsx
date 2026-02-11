/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
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
import { Field, FieldGroup } from "./ui/field";

export function AddChit({ refetch }: { refetch: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { user } = useAuth();

  const router = useRouter();

  const addChitOwnerAsMember = async ({ chitId }: { chitId: string }) => {
    try {
      const formData = new FormData();

      formData.append("chit_id", chitId);
      formData.append("name", user?.user_metadata?.name ?? user?.email);
      formData.append("mobile", user?.user_metadata?.mobile);
      formData.append("owner", JSON.stringify(true));

      const res = await fetch("/api/members", {
        method: "POST",
        body: formData,
      });

      await res.json();
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      setError(error);
    }
  };

  const handleAddChit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chits", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      const chitDetails = data?.values?.[0];

      await addChitOwnerAsMember({
        chitId: chitDetails?.id,
      });

      if (data.success) {
        toast.success("Chit added successfully", {
          position: "top-right",
        });
        router.push("/");
      } else {
        setError(data.error);
      }
    } catch (error: any) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>Add Chit</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <form onSubmit={handleAddChit}>
          <DialogHeader>
            <DialogTitle>Add chit</DialogTitle>
            <DialogDescription>
              New chit will be added to your account.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="mb-6 mt-6">
            <Field>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="add name" required />
            </Field>
            <Field>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                placeholder="add chit amount"
                required
                type="number"
              />
            </Field>
            <Field>
              <Label htmlFor="members">No of Members</Label>
              <Input
                id="members"
                type="number"
                placeholder="10"
                required
                name="noOfMembers"
              />
            </Field>
            <Field>
              <Label htmlFor="auctions">No Of Auctions</Label>
              <Input
                id="auctions"
                type="number"
                placeholder="20"
                required
                name="noOfAuctions"
              />
            </Field>
            <Field>
              <Label htmlFor="charges">Chit Charges / Month</Label>
              <Input
                id="charges"
                type="number"
                required
                name="charges"
                placeholder="3000"
              />
            </Field>
            <Field>
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" required name="startDate" />
            </Field>
          </FieldGroup>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding chit" : "Add Chit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
